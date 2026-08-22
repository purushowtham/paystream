'use client';

import React from 'react';
import { Zap, Wallet, Plus, Video as VideoIcon, User, Gamepad2, LogOut } from 'lucide-react';
import { formatEther } from 'viem';

interface HeaderProps {
  authenticatedRole: 'viewer' | 'creator';
  authenticatedWallet: `0x${string}`;
  viewerVaultBalanceWei: bigint;
  creatorWalletBalanceWei: bigint;
  creatorTotalEarningsWei: bigint;
  onOpenDepositModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authenticatedRole,
  authenticatedWallet,
  viewerVaultBalanceWei,
  creatorWalletBalanceWei,
  creatorTotalEarningsWei,
  onOpenDepositModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-yellow-300 text-black shadow-[0_6px_0_#000000]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: 8-Bit Arcade Logo & Active Role Badge */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-pink-500 border-4 border-black shadow-[4px_4px_0_#000000]">
              <Gamepad2 className="h-7 w-7 text-yellow-300 animate-bounce" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-pixel tracking-wider text-black">
                PAY<span className="text-pink-600">STREAM</span>
              </span>
              <span className="text-xs font-arcade font-bold tracking-widest text-pink-700 uppercase">
                🕹️ SUNNY 8-BIT MONAD PAY-PER-SEC ARCADE
              </span>
            </div>
          </div>

          {/* Active Locked Role Display */}
          <div className="hidden sm:flex items-center gap-2 p-1.5 bg-white border-4 border-black shadow-[3px_3px_0_#000000]">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 font-pixel text-xs uppercase font-bold ${
                authenticatedRole === 'viewer'
                  ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0_#000000]'
                  : 'bg-pink-500 text-yellow-200 border-2 border-black shadow-[2px_2px_0_#000000]'
              }`}
            >
              {authenticatedRole === 'viewer' ? (
                <>
                  <User className="h-3.5 w-3.5" />
                  PLAYER MODE (LOCKED)
                </>
              ) : (
                <>
                  <VideoIcon className="h-3.5 w-3.5" />
                  STUDIO MODE (LOCKED)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Right: Authenticated Wallet Chip ONLY */}
        <div className="flex items-center gap-3">
          
          {authenticatedRole === 'viewer' ? (
            /* VIEWER LOCKED WALLET BADGE */
            <div className="flex items-center gap-2 bg-amber-100 border-4 border-black p-1.5 pl-3 shadow-[4px_4px_0_#000000] text-black">
              <div className="flex flex-col">
                <span className="text-[9px] font-pixel text-pink-700 uppercase">PLAYER WALLET (LOCKED)</span>
                <div className="flex items-center gap-1.5 font-arcade text-base text-black font-bold">
                  <span className="font-mono text-black font-bold">
                    {authenticatedWallet.substring(0, 6)}...{authenticatedWallet.substring(authenticatedWallet.length - 4)}
                  </span>
                  <span className="font-pixel text-[10px] text-emerald-700 font-bold">
                    VAULT: {parseFloat(formatEther(viewerVaultBalanceWei)).toFixed(2)} MON
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenDepositModal}
                className="pixel-btn-yellow px-2.5 py-1 text-[9px]"
                title="Deposit MON to Player Vault"
              >
                +COIN
              </button>
            </div>
          ) : (
            /* CREATOR LOCKED WALLET BADGE WITH REAL MONAD BALANCE */
            <div className="flex items-center gap-2 bg-pink-200 border-4 border-black p-1.5 pl-3 shadow-[4px_4px_0_#000000] text-black">
              <div className="flex flex-col">
                <span className="text-[9px] font-pixel text-pink-700 uppercase">CREATOR PAYOUT WALLET (LOCKED)</span>
                <div className="flex items-center gap-2 font-arcade text-base font-bold text-black">
                  <span className="font-mono text-black font-bold">
                    {authenticatedWallet.substring(0, 6)}...{authenticatedWallet.substring(authenticatedWallet.length - 4)}
                  </span>
                  <span className="font-pixel text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 border border-black">
                    BAL: {parseFloat(formatEther(creatorWalletBalanceWei)).toFixed(4)} MON
                  </span>
                  <span className="font-pixel text-[10px] text-purple-900 font-bold">
                    EARNED: {parseFloat(formatEther(creatorTotalEarningsWei)).toFixed(3)} MON
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* LOGOUT / SWITCH ROLE BUTTON */}
          <button
            onClick={onLogout}
            className="pixel-btn-magenta px-3 py-2 text-[9px] flex items-center gap-1"
            title="Log Out & Return to Login Screen"
          >
            <LogOut className="h-3.5 w-3.5" />
            EXIT
          </button>

        </div>

      </div>
    </header>
  );
};
