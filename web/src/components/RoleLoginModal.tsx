'use client';

import React, { useState } from 'react';
import { Gamepad2, Video as VideoIcon, Wallet, ShieldCheck, Sparkles } from 'lucide-react';
import { monadWeb3Service } from '../lib/web3-provider';

interface RoleLoginModalProps {
  onAuthenticate: (role: 'viewer' | 'creator', walletAddress: `0x${string}`) => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({ onAuthenticate }) => {
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'creator' | null>(null);
  const [customWallet, setCustomWallet] = useState<string>('');
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultViewerWallet = '0x1111111111111111111111111111111111111111';
  const defaultCreatorWallet = '0x2222222222222222222222222222222222222222';

  const handleMetaMaskConnect = async () => {
    if (!selectedRole) return;
    setIsConnectingMetaMask(true);
    setErrorMsg(null);

    try {
      const { address } = await monadWeb3Service.connectBrowserWallet();
      onAuthenticate(selectedRole, address);
    } catch (err: any) {
      console.warn('MetaMask connection notice:', err);
      // If MetaMask extension is not present or user rejected, fallback to role default address
      const fallbackWallet = selectedRole === 'viewer' ? defaultViewerWallet : defaultCreatorWallet;
      onAuthenticate(selectedRole, fallbackWallet as `0x${string}`);
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  const handleDemoAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    let targetWallet = customWallet.trim();
    if (!targetWallet.startsWith('0x') || targetWallet.length !== 42) {
      targetWallet = selectedRole === 'viewer' ? defaultViewerWallet : defaultCreatorWallet;
    }

    onAuthenticate(selectedRole, targetWallet as `0x${string}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-yellow-100/95 p-4 font-arcade">
      <div className="w-full max-w-xl bg-yellow-200 border-4 border-black p-8 shadow-[12px_12px_0_#000000] text-black">
        
        {/* Header Title */}
        <div className="flex items-center justify-center gap-3 mb-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center bg-pink-500 border-4 border-black text-yellow-300 shadow-[4px_4px_0_#000000]">
            <Gamepad2 className="h-8 w-8 text-yellow-300 animate-bounce" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl sm:text-3xl font-pixel text-black tracking-wider">
              PAY<span className="text-pink-600">STREAM</span>
            </h1>
            <span className="text-xs font-pixel text-pink-700 uppercase">
              MONAD DEMO LOGIN PORTAL
            </span>
          </div>
        </div>

        {/* Step 1: Select Role */}
        {!selectedRole ? (
          <div className="flex flex-col gap-6">
            <p className="text-center font-pixel text-xs text-black uppercase">
              CHOOSE YOUR ROLE TO LOGIN:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Player Role Card */}
              <div
                onClick={() => {
                  setSelectedRole('viewer');
                  setCustomWallet(defaultViewerWallet);
                }}
                className="group cursor-pointer p-6 bg-amber-100 border-4 border-black hover:bg-yellow-300 shadow-[6px_6px_0_#000000] hover:shadow-[9px_9px_0_#000000] transition-all flex flex-col items-center text-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center bg-yellow-400 border-3 border-black text-black">
                  <Gamepad2 className="h-7 w-7 text-black" />
                </div>
                <h3 className="text-sm font-pixel text-black uppercase">PLAYER / VIEWER</h3>
                <p className="text-base text-slate-800 leading-tight">
                  Watch monetized creator videos. Pays 1 MON transaction per second to creator.
                </p>
                <span className="pixel-btn-magenta px-4 py-2 text-[9px] mt-2 group-hover:scale-105">
                  LOGIN AS PLAYER ▶
                </span>
              </div>

              {/* Creator Role Card */}
              <div
                onClick={() => {
                  setSelectedRole('creator');
                  setCustomWallet(defaultCreatorWallet);
                }}
                className="group cursor-pointer p-6 bg-pink-100 border-4 border-black hover:bg-pink-200 shadow-[6px_6px_0_#000000] hover:shadow-[9px_9px_0_#000000] transition-all flex flex-col items-center text-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center bg-pink-500 border-3 border-black text-white">
                  <VideoIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-sm font-pixel text-black uppercase">CREATOR / STUDIO</h3>
                <p className="text-base text-slate-800 leading-tight">
                  Upload video files. Receives MON micro-payments directly to your wallet.
                </p>
                <span className="pixel-btn-yellow px-4 py-2 text-[9px] mt-2 group-hover:scale-105">
                  LOGIN AS CREATOR ▶
                </span>
              </div>

            </div>
          </div>
        ) : (
          /* Step 2: Wallet Connection & Locking */
          <div className="flex flex-col gap-6 bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000000]">
            
            {/* Top Role Indicator */}
            <div className="flex items-center justify-between pb-4 border-b-4 border-black">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-300 border-2 border-black font-pixel text-[10px] font-bold uppercase">
                  ROLE: {selectedRole === 'viewer' ? 'PLAYER / VIEWER' : 'CREATOR / STUDIO'}
                </span>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs font-pixel text-slate-600 hover:text-black"
              >
                BACK
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 border-3 border-black text-red-600 text-sm font-bold">
                {errorMsg}
              </div>
            )}

            {/* Option A: Connect MetaMask Real Wallet */}
            <button
              onClick={handleMetaMaskConnect}
              disabled={isConnectingMetaMask}
              className="pixel-btn-magenta flex items-center justify-center gap-3 w-full py-4 text-xs uppercase"
            >
              <Wallet className="h-5 w-5" />
              {isConnectingMetaMask ? 'CONNECTING METAMASK...' : 'CONNECT REAL METAMASK WALLET'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="h-1 flex-1 bg-black" />
              <span className="font-pixel text-[10px] text-slate-600">OR ENTER WALLET ADDRESS</span>
              <div className="h-1 flex-1 bg-black" />
            </div>

            {/* Option B: Manual Wallet Input */}
            <form onSubmit={handleDemoAuth} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-pixel text-black">
                  {selectedRole === 'viewer' ? 'PLAYER WALLET ADDRESS (0x...)' : 'CREATOR PAYOUT WALLET (0x...)'}
                </label>
                <input
                  type="text"
                  value={customWallet}
                  onChange={(e) => setCustomWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full mt-1 bg-yellow-100 border-3 border-black px-4 py-2.5 text-base font-mono text-black focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="pixel-btn-green flex items-center justify-center gap-2 w-full py-3.5 text-xs uppercase"
              >
                <ShieldCheck className="h-5 w-5" />
                ENTER & LOCK WALLET
              </button>
            </form>

            <p className="text-xs text-center text-slate-600 font-bold">
              🔒 Once logged in, your wallet is locked and ready for Monad Testnet streaming transactions.
            </p>

          </div>
        )}

      </div>
    </div>
  );
};
