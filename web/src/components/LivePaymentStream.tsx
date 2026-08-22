'use client';

import React from 'react';
import { Zap, ExternalLink, ShieldCheck, Clock, Layers, ArrowRight, Activity, Gamepad2 } from 'lucide-react';
import { TransactionLog, WatchSessionState } from '../lib/types';
import { formatEther } from 'viem';

interface LivePaymentStreamProps {
  sessionState: WatchSessionState;
  logs: TransactionLog[];
  viewerWallet: `0x${string}`;
  creatorWallet: `0x${string}`;
}

export const LivePaymentStream: React.FC<LivePaymentStreamProps> = ({
  sessionState,
  logs,
  viewerWallet,
  creatorWallet,
}) => {
  const formattedPaidMon = parseFloat(formatEther(sessionState.totalSpentWei)).toFixed(4);

  return (
    <div className="flex flex-col h-full bg-yellow-200 border-4 border-black p-5 shadow-[8px_8px_0_#000000] text-black font-arcade">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b-4 border-black">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center bg-pink-400 border-2 border-black text-black">
            <Activity className="h-5 w-5 text-black animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-pixel text-black tracking-wide">LIVE ARCADE TICKER</h3>
            <p className="text-sm font-arcade text-pink-700 font-bold">1 SEC PLAYBACK = 1 MONAD TX</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-300 border-2 border-black text-xs font-pixel text-black font-bold shadow-[2px_2px_0_#000000]">
          <span className="h-2 w-2 bg-black animate-ping" />
          MONAD 10143
        </div>
      </div>

      {/* DUAL WALLET FLOW BOX */}
      <div className="my-4 p-3 bg-white border-4 border-black flex items-center justify-between font-arcade text-lg shadow-[3px_3px_0_#000000]">
        <div className="flex flex-col">
          <span className="text-[10px] font-pixel text-pink-600 uppercase">PLAYER</span>
          <span className="text-black font-bold">
            {viewerWallet.substring(0, 6)}...
          </span>
        </div>

        <ArrowRight className="h-5 w-5 text-pink-600 animate-pulse shrink-0" />

        <div className="flex flex-col text-right">
          <span className="text-[10px] font-pixel text-emerald-700 uppercase">CREATOR</span>
          <span className="text-emerald-700 font-bold">
            {creatorWallet.substring(0, 6)}...
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        
        {/* Paid Seconds */}
        <div className="flex flex-col p-2.5 bg-amber-100 border-3 border-black shadow-[3px_3px_0_#000000]">
          <span className="text-[9px] font-pixel uppercase text-slate-700">TIME</span>
          <span className="text-2xl font-arcade font-bold text-black mt-0.5">
            {sessionState.secondsPaid}s
          </span>
        </div>

        {/* Total MON Paid */}
        <div className="flex flex-col p-2.5 bg-pink-100 border-3 border-black shadow-[3px_3px_0_#000000]">
          <span className="text-[9px] font-pixel uppercase text-pink-700">PAID</span>
          <span className="text-2xl font-arcade font-bold text-black mt-0.5">
            {formattedPaidMon} <span className="text-xs text-slate-600">MON</span>
          </span>
        </div>

        {/* Monad Transactions Count */}
        <div className="flex flex-col p-2.5 bg-green-100 border-3 border-black shadow-[3px_3px_0_#000000]">
          <span className="text-[9px] font-pixel uppercase text-emerald-800">TXS</span>
          <span className="text-2xl font-arcade font-bold text-black mt-0.5">
            {logs.length}
          </span>
        </div>

      </div>

      {/* Live Transaction Ticker Feed */}
      <div className="flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-pixel uppercase text-black">SUBSECOND SETTLEMENT LOG</span>
          <span className="text-sm font-arcade text-emerald-800 font-bold">{logs.length} CONFIRMED</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[250px] custom-scrollbar">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-4 border-dashed border-black bg-white">
              <Gamepad2 className="h-8 w-8 text-pink-600 mb-2 animate-bounce" />
              <p className="text-xs font-pixel text-black">PRESS PLAY TO START STREAMING PAYMENTS</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 bg-white border-3 border-black hover:bg-yellow-100 transition-all font-arcade text-base shadow-[2px_2px_0_#000000]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center bg-pink-400 text-black font-pixel text-[9px] font-bold border border-black">
                    #{log.secondNumber}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-bold text-emerald-700">
                      <span>{log.amountEth} MON</span>
                      <span className="text-xs text-slate-600">→ Creator</span>
                    </div>
                    <span className="text-xs text-black font-mono">
                      Tx: {log.txHash.substring(0, 8)}...{log.txHash.substring(log.txHash.length - 6)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-green-400 text-black border border-black font-pixel text-[8px] font-bold">
                    OK
                  </span>
                  <a
                    href={`https://testnet.monadexplorer.com/tx/${log.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 bg-yellow-300 text-black border border-black hover:bg-pink-300 transition-all"
                    title="View on Monad Explorer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
