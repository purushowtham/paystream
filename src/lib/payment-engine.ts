import { parseEther, formatEther } from 'viem';
import { TransactionLog, Video, WatchSessionState } from './types';

export class PaymentEngine {
  private videoElement: HTMLVideoElement | null = null;
  private currentVideo: Video | null = null;
  private walletAddress: `0x${string}` | null = null;
  private vaultBalanceWei: bigint = 0n;
  
  private sessionId: `0x${string}` | null = null;
  private isSessionActive: boolean = false;
  private maxSpendWei: bigint = parseEther('1');
  private pricePerSecondWei: bigint = parseEther('0.001');

  private secondsPaid: number = 0;
  private totalSpentWei: bigint = 0n;
  private lastPaidPlaybackTime: number = -1;

  private txLogs: TransactionLog[] = [];
  private onStateChangeCallback: (() => void) | null = null;
  private onBalanceExhaustedCallback: (() => void) | null = null;

  private isProcessingTx: boolean = false;

  constructor() {}

  public setVideoElement(element: HTMLVideoElement | null) {
    if (this.videoElement) {
      this.videoElement.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.videoElement.removeEventListener('pause', this.handlePause);
      this.videoElement.removeEventListener('seeking', this.handleSeeking);
    }
    this.videoElement = element;
    if (this.videoElement) {
      this.videoElement.addEventListener('timeupdate', this.handleTimeUpdate);
      this.videoElement.addEventListener('pause', this.handlePause);
      this.videoElement.addEventListener('seeking', this.handleSeeking);
    }
  }

  public initSession(
    video: Video,
    walletAddress: `0x${string}` | null,
    vaultBalanceWei: bigint,
    maxSpendWei: bigint,
    pricePerSecondWei: bigint,
    onStateChange: () => void,
    onBalanceExhausted: () => void
  ) {
    this.currentVideo = video;
    this.walletAddress = walletAddress;
    this.vaultBalanceWei = vaultBalanceWei;
    this.maxSpendWei = maxSpendWei;
    this.pricePerSecondWei = pricePerSecondWei;
    this.onStateChangeCallback = onStateChange;
    this.onBalanceExhaustedCallback = onBalanceExhausted;

    // Generate pseudo session ID for current session
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    this.sessionId = `0x${randomHex}` as `0x${string}`;
    this.isSessionActive = true;
    this.secondsPaid = 0;
    this.totalSpentWei = 0n;
    this.lastPaidPlaybackTime = -1;
    this.txLogs = [];

    this.notifyStateChange();
  }

  public updateVaultBalance(newBalanceWei: bigint) {
    this.vaultBalanceWei = newBalanceWei;
    this.notifyStateChange();
  }

  private handlePause = () => {
    // Payment stops automatically on pause
    this.notifyStateChange();
  };

  private handleSeeking = () => {
    // Reset relative tracking for seek so skipped content is never charged
    if (this.videoElement) {
      this.lastPaidPlaybackTime = Math.floor(this.videoElement.currentTime);
    }
  };

  private handleTimeUpdate = async () => {
    if (!this.videoElement || !this.isSessionActive || !this.currentVideo || !this.walletAddress) {
      return;
    }

    // GATED ACCESS: Pause immediately if wallet is missing
    if (!this.walletAddress) {
      this.videoElement.pause();
      return;
    }

    const currentSec = Math.floor(this.videoElement.currentTime);

    // Only process if video is actively playing and at least 1 new second elapsed
    if (this.videoElement.paused || currentSec <= 0) {
      return;
    }

    // Check if new elapsed payable second reached
    if (currentSec > this.lastPaidPlaybackTime) {
      // BALANCE GUARD: If vault balance < price per second, PAUSE VIDEO IMMEDIATELY
      if (this.vaultBalanceWei < this.pricePerSecondWei) {
        this.videoElement.pause();
        if (this.onBalanceExhaustedCallback) {
          this.onBalanceExhaustedCallback();
        }
        return;
      }

      // MAX SPEND GUARD: If max spend reached, pause
      if (this.totalSpentWei + this.pricePerSecondWei > this.maxSpendWei) {
        this.videoElement.pause();
        return;
      }

      // Execute on-chain payment for this second
      this.lastPaidPlaybackTime = currentSec;
      await this.executePerSecondPayment(currentSec);
    }
  };

  private async executePerSecondPayment(secondNumber: number) {
    if (this.isProcessingTx) return;
    this.isProcessingTx = true;

    const txId = Math.random().toString(36).substring(2, 9);
    // Generate realistic Monad tx hash format
    const mockHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}` as `0x${string}`;

    const newLog: TransactionLog = {
      id: txId,
      sessionId: this.sessionId || '0x0',
      secondNumber: secondNumber,
      amountEth: formatEther(this.pricePerSecondWei),
      txHash: mockHash,
      timestamp: new Date(),
      status: 'pending',
    };

    this.txLogs.unshift(newLog);
    this.notifyStateChange();

    // Simulate ultra-fast Monad block execution (400ms)
    setTimeout(() => {
      // Deduct from vault balance & update totals
      this.vaultBalanceWei -= this.pricePerSecondWei;
      this.totalSpentWei += this.pricePerSecondWei;
      this.secondsPaid += 1;

      // Update log to confirmed
      const logIdx = this.txLogs.findIndex((l) => l.id === txId);
      if (logIdx !== -1) {
        this.txLogs[logIdx].status = 'confirmed';
        this.txLogs[logIdx].blockNumber = 1043200 + this.secondsPaid;
      }

      this.isProcessingTx = false;
      this.notifyStateChange();
    }, 350);
  }

  public stopSession() {
    this.isSessionActive = false;
    if (this.videoElement) {
      this.videoElement.pause();
    }
    this.notifyStateChange();
  }

  public resetSession() {
    this.stopSession();
    this.sessionId = null;
    this.walletAddress = null;
    this.secondsPaid = 0;
    this.totalSpentWei = 0n;
    this.txLogs = [];
    this.lastPaidPlaybackTime = -1;
  }

  public getSessionState(): WatchSessionState {
    return {
      sessionId: this.sessionId,
      userAddress: this.walletAddress,
      creatorAddress: this.currentVideo?.creatorAddress || null,
      videoId: this.currentVideo?.id || null,
      pricePerSecondWei: this.pricePerSecondWei,
      maxSpendWei: this.maxSpendWei,
      secondsPaid: this.secondsPaid,
      totalSpentWei: this.totalSpentWei,
      expiryTimestamp: Date.now() + 3600 * 1000,
      isActive: this.isSessionActive,
      userVaultBalanceWei: this.vaultBalanceWei,
    };
  }

  public getLogs(): TransactionLog[] {
    return this.txLogs;
  }

  private notifyStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback();
    }
  }
}

export const paymentEngineInstance = new PaymentEngine();
