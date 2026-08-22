'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Zap, PlusCircle, Lock, Wallet, Coins } from 'lucide-react';
import { parseEther, formatEther } from 'viem';

interface SmartAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultBalanceWei: bigint;
  onDeposit: (amountWei: bigint) => void;
  walletAddress: `0x${string}` | null;
  onConnectWallet: () => void;
}

export const SmartAccountModal: React.FC<SmartAccountModalProps> = ({
  isOpen,
  onClose,
  vaultBalanceWei,
  onDeposit,
  walletAddress,
  onConnectWallet,
}) => {
  const [depositAmountEth, setDepositAmountEth] = useState<string>('0.5');

  if (!isOpen) return null;

  const handleDepositClick = () => {
    try {
      const wei = parseEther(depositAmountEth || '0');
      if (wei > 0n) {
        onDeposit(wei);
        onClose();
      }
    } catch (e) {
      console.error('Invalid deposit amount', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-yellow-100/90 p-4">
      <div className="relative w-full max-w-md bg-yellow-200 border-4 border-black p-6 shadow-[12px_12px_0_#000000] font-arcade text-black">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 bg-white border-2 border-black text-black hover:bg-pink-500 hover:text-white font-pixel text-xs"
        >
          X
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center bg-pink-500 border-4 border-black text-yellow-300">
            <Coins className="h-7 w-7 text-yellow-300 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-pixel text-black">INSERT MON COINS 🪙</h3>
            <p className="text-sm text-pink-700 font-bold">MONAD SUBSECOND VAULT TOP-UP</p>
          </div>
        </div>

        {!walletAddress ? (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-white border-4 border-black">
            <Wallet className="h-10 w-10 text-pink-600 mb-3" />
            <p className="text-lg text-black mb-4 font-bold">CONNECT PLAYER WALLET TO INSERT COINS.</p>
            <button
              onClick={() => {
                onConnectWallet();
                onClose();
              }}
              className="pixel-btn-yellow px-6 py-3 text-xs"
            >
              CONNECT WALLET
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            
            {/* Current Vault Balance */}
            <div className="flex items-center justify-between p-4 bg-amber-100 border-4 border-black">
              <div className="flex flex-col">
                <span className="text-[10px] font-pixel text-pink-700">PLAYER VAULT BALANCE</span>
                <span className="text-3xl font-bold font-arcade text-black">
                  {parseFloat(formatEther(vaultBalanceWei)).toFixed(4)} MON
                </span>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-700" />
            </div>

            {/* Quick Top-Up Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-pixel text-black">SELECT COIN DENOMINATION</label>
              <div className="grid grid-cols-4 gap-2">
                {['0.1', '0.5', '1.0', '5.0'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmountEth(amt)}
                    className={`py-2 text-xs font-pixel font-bold transition-all ${
                      depositAmountEth === amt
                        ? 'bg-pink-500 text-white border-3 border-black shadow-[2px_2px_0_#000000]'
                        : 'bg-white text-black hover:bg-amber-200 border-3 border-black shadow-[2px_2px_0_#000000]'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.01"
                value={depositAmountEth}
                onChange={(e) => setDepositAmountEth(e.target.value)}
                className="w-full bg-white border-4 border-black px-4 py-2 text-xl font-arcade text-black focus:outline-none focus:bg-pink-100 mt-1"
                placeholder="Custom amount"
              />
            </div>

            {/* Confirm Deposit Button */}
            <button
              onClick={handleDepositClick}
              className="pixel-btn-green flex items-center justify-center gap-2 w-full py-3.5 text-xs uppercase"
            >
              <PlusCircle className="h-5 w-5" />
              DEPOSIT {depositAmountEth} MON TO VAULT
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
