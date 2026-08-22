export interface Video {
  id: number;
  title: string;
  description: string;
  creatorAddress: `0x${string}`;
  creatorName: string;
  creatorAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  pricePerSecondEth: string; // e.g. "0.001"
  viewsCount: number;
  category: string;
  uploadedAt: string;
}

export interface WatchSessionState {
  sessionId: `0x${string}` | null;
  userAddress: `0x${string}` | null;
  creatorAddress: `0x${string}` | null;
  videoId: number | null;
  pricePerSecondWei: bigint;
  maxSpendWei: bigint;
  secondsPaid: number;
  totalSpentWei: bigint;
  expiryTimestamp: number;
  isActive: boolean;
  userVaultBalanceWei: bigint;
}

export interface TransactionLog {
  id: string;
  sessionId: string;
  secondNumber: number;
  amountEth: string;
  txHash: `0x${string}`;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
}

export interface CreatorEarningsState {
  creatorAddress: `0x${string}`;
  totalEarnedWei: bigint;
  totalSecondsPaid: number;
  totalTransactionsCount: number;
}
