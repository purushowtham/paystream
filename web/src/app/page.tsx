'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LivePaymentStream } from '@/components/LivePaymentStream';
import { VideoFeed } from '@/components/VideoFeed';
import { CreatorDashboard } from '@/components/CreatorDashboard';
import { SmartAccountModal } from '@/components/SmartAccountModal';
import { RoleLoginModal } from '@/components/RoleLoginModal';
import { DEMO_VIDEOS } from '@/lib/videos';
import { Video, TransactionLog, WatchSessionState } from '@/lib/types';
import { paymentEngineInstance } from '@/lib/payment-engine';
import { monadWeb3Service } from '@/lib/web3-provider';
import { videoStorageService } from '@/lib/video-storage';
import { parseEther, formatEther } from 'viem';
import confetti from 'canvas-confetti';
import { Zap, Sparkles, Heart, Wallet } from 'lucide-react';

interface AuthSession {
  role: 'viewer' | 'creator';
  walletAddress: `0x${string}`;
}

export default function Home() {
  // Demo Login Auth Session State (Null by default: forces login screen first)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  const [videoList, setVideoList] = useState<Video[]>(DEMO_VIDEOS);
  const [currentVideo, setCurrentVideo] = useState<Video>(DEMO_VIDEOS[0]);
  
  // Independent Locked Wallets
  const [viewerWallet, setViewerWallet] = useState<`0x${string}`>('0x1111111111111111111111111111111111111111');
  const [creatorWallet, setCreatorWallet] = useState<`0x${string}`>('0x2222222222222222222222222222222222222222');
  
  // Vault & Earnings Balances
  const [viewerVaultBalanceWei, setViewerVaultBalanceWei] = useState<bigint>(parseEther('5.0'));
  const [creatorTotalEarningsWei, setCreatorTotalEarningsWei] = useState<bigint>(parseEther('0.0'));

  // Session & Logs state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionState, setSessionState] = useState<WatchSessionState>(
    paymentEngineInstance.getSessionState()
  );
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load persistent videos on mount
  useEffect(() => {
    const loaded = videoStorageService.loadVideos();
    setVideoList(loaded);
    if (loaded.length > 0) {
      handleSelectVideo(loaded[0]);
    }
  }, []);

  // Initialize payment session whenever video or viewer wallet changes
  useEffect(() => {
    if (authSession) {
      startNewSession(currentVideo, viewerWallet, viewerVaultBalanceWei);
      fetchRealMonadBalance(viewerWallet);
    }
  }, [currentVideo, viewerWallet, authSession]);

  const handleAuthenticate = (role: 'viewer' | 'creator', walletAddress: `0x${string}`) => {
    if (role === 'viewer') {
      setViewerWallet(walletAddress);
    } else {
      setCreatorWallet(walletAddress);
    }
    setAuthSession({ role, walletAddress });
    showNotification(`Authorized & locked as ${role.toUpperCase()} (${walletAddress.substring(0, 6)}...)`);
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
  };

  const handleLogout = () => {
    setAuthSession(null);
    paymentEngineInstance.resetSession();
    setIsSessionActive(false);
  };

  const fetchRealMonadBalance = async (address: `0x${string}`) => {
    try {
      const realBal = await monadWeb3Service.getBalance(address);
      if (realBal > 0n) {
        setViewerVaultBalanceWei(realBal);
        paymentEngineInstance.updateVaultBalance(realBal);
      }
    } catch (e) {
      console.log('Using default viewer vault balance for demo');
    }
  };

  const startNewSession = (
    video: Video,
    address: `0x${string}`,
    balance: bigint
  ) => {
    paymentEngineInstance.initSession(
      video,
      address,
      balance,
      parseEther('10'), // 10 MON max spend cap
      parseEther(video.pricePerSecondEth),
      () => {
        const state = paymentEngineInstance.getSessionState();
        setSessionState({ ...state });
        setLogs([...paymentEngineInstance.getLogs()]);
        setViewerVaultBalanceWei(state.userVaultBalanceWei);
        setCreatorTotalEarningsWei(state.totalSpentWei);
      },
      () => {
        showNotification('⚡ Player Vault Balance Depleted! Playback paused.');
      }
    );
    setIsSessionActive(true);
    setSessionState({ ...paymentEngineInstance.getSessionState() });
    setLogs([...paymentEngineInstance.getLogs()]);
  };

  const handleDeposit = async (amountWei: bigint) => {
    const newBal = viewerVaultBalanceWei + amountWei;
    setViewerVaultBalanceWei(newBal);
    paymentEngineInstance.updateVaultBalance(newBal);
    showNotification(`Deposited ${formatEther(amountWei)} MON to Player Vault!`);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleSelectVideo = async (video: Video) => {
    const playableUrl = await videoStorageService.getPlayableUrl(video);
    const resolvedVideo = { ...video, videoUrl: playableUrl };
    setCurrentVideo(resolvedVideo);
    if (authSession?.role === 'viewer') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddVideo = async (newVideo: Video, videoBlob?: Blob) => {
    const saved = await videoStorageService.saveVideo(newVideo, videoBlob);
    const updatedList = videoStorageService.loadVideos();
    setVideoList(updatedList);
    await handleSelectVideo(saved);
    showNotification('Video published to PayStream catalog!');
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // If not authenticated, render Demo Authorization Login Screen
  if (!authSession) {
    return <RoleLoginModal onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="min-h-screen text-black selection:bg-pink-500 selection:text-white font-arcade antialiased">
      
      {/* Header Navigation with Locked Authenticated Wallet */}
      <Header
        authenticatedRole={authSession.role}
        authenticatedWallet={authSession.walletAddress}
        viewerVaultBalanceWei={viewerVaultBalanceWei}
        creatorTotalEarningsWei={creatorTotalEarningsWei}
        onOpenDepositModal={() => setIsDepositModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-yellow-300 border-4 border-black text-black font-pixel text-xs font-bold shadow-[6px_6px_0_#000000] animate-bounce">
          <Sparkles className="h-4 w-4 text-pink-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main App Workspace */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {authSession.role === 'viewer' ? (
          <div className="flex flex-col gap-10">
            
            {/* Top Row: Video Player & Live Payment Stream Ticker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Video Player & Info (2 Columns) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                <VideoPlayer
                  video={currentVideo}
                  userWallet={viewerWallet}
                  vaultBalanceWei={viewerVaultBalanceWei}
                  onOpenDepositModal={() => setIsDepositModalOpen(true)}
                  isSessionActive={isSessionActive}
                  onStartSession={() => startNewSession(currentVideo, viewerWallet, viewerVaultBalanceWei)}
                />

                {/* Video Title & Creator Card */}
                <div className="flex flex-col gap-3.5 p-5 bg-yellow-200 border-4 border-black shadow-[6px_6px_0_#000000]">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold font-arcade text-black tracking-tight">
                      {currentVideo.title}
                    </h1>
                    <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 border-3 border-black text-xs font-pixel font-bold text-black shadow-[2px_2px_0_#000000]">
                      <Zap className="h-4 w-4 fill-black text-black" />
                      {currentVideo.pricePerSecondEth} MON/sec
                    </span>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center justify-between pt-3 border-t-4 border-black font-arcade">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentVideo.creatorAvatar}
                        alt={currentVideo.creatorName}
                        className="h-10 w-10 border-2 border-black object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-black">{currentVideo.creatorName}</span>
                        <span className="text-xs font-mono text-pink-700 font-bold">
                          Creator Stream Payout Enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-base text-slate-800 leading-relaxed mt-1 font-arcade font-bold">
                    {currentVideo.description}
                  </p>
                </div>

              </div>

              {/* Live Payment Stream Ticker (1 Column) */}
              <div className="lg:col-span-1 h-full">
                <LivePaymentStream
                  sessionState={sessionState}
                  logs={logs}
                  viewerWallet={viewerWallet}
                  creatorWallet={creatorWallet}
                />
              </div>

            </div>

            {/* Video Discovery Catalog Grid */}
            <div className="pt-6 border-t-4 border-black">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-pixel text-black uppercase">MONAD TESTNET MONETIZED VIDEO CATALOG</h2>
                <span className="text-base text-pink-700 font-arcade font-bold">{videoList.length} ACTIVE STREAMS</span>
              </div>

              <VideoFeed
                videos={videoList}
                activeVideo={currentVideo}
                onSelectVideo={handleSelectVideo}
              />
            </div>

          </div>
        ) : (
          /* Creator Studio View (Locked for Creator) */
          <CreatorDashboard
            videos={videoList}
            creatorWallet={creatorWallet}
            setCreatorWallet={setCreatorWallet}
            onAddVideo={handleAddVideo}
            totalEarningsWei={creatorTotalEarningsWei}
            totalSecondsPaid={sessionState.secondsPaid}
            totalTransactionsCount={logs.length}
          />
        )}

      </main>

      {/* Smart Account Deposit Modal */}
      <SmartAccountModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        vaultBalanceWei={viewerVaultBalanceWei}
        onDeposit={handleDeposit}
        walletAddress={viewerWallet}
        onConnectWallet={() => {}}
      />

    </div>
  );
}
