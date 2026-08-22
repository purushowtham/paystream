'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Zap, AlertTriangle, PlusCircle, Gamepad2 } from 'lucide-react';
import { Video } from '../lib/types';
import { paymentEngineInstance } from '../lib/payment-engine';

interface VideoPlayerProps {
  video: Video;
  userWallet: `0x${string}`;
  vaultBalanceWei: bigint;
  onOpenDepositModal: () => void;
  isSessionActive: boolean;
  onStartSession: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  userWallet,
  vaultBalanceWei,
  onOpenDepositModal,
  isSessionActive,
  onStartSession,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLowBalance, setIsLowBalance] = useState<boolean>(false);

  useEffect(() => {
    if (videoRef.current) {
      paymentEngineInstance.setVideoElement(videoRef.current);
    }
  }, [videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setIsLowBalance(false);
    }
  }, [video]);

  const handlePlayPause = () => {
    if (!isSessionActive) {
      onStartSession();
      return;
    }

    if (vaultBalanceWei <= 0n) {
      setIsLowBalance(true);
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setIsLowBalance(false);
        }).catch((err) => {
          console.warn('Video playback error:', err);
        });
      }
    }
  };

  return (
    <div className="relative overflow-hidden border-4 border-black bg-yellow-100 shadow-[8px_8px_0_#000000] aspect-video">
      
      {/* Real HTML5 Video Player */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="h-full w-full object-contain bg-white"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        controls={isSessionActive && vaultBalanceWei > 0n}
        playsInline
      />

      {/* 1. LOW BALANCE OVERLAY */}
      {isLowBalance && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-amber-100/95 p-6 text-center border-4 border-black">
          <div className="flex h-16 w-16 items-center justify-center bg-yellow-300 border-4 border-black shadow-[4px_4px_0_#000000] mb-4">
            <AlertTriangle className="h-8 w-8 text-black" />
          </div>
          <h3 className="text-xl font-pixel text-red-600 mb-2 uppercase">GAME OVER: 0 MON!</h3>
          <p className="max-w-md text-2xl font-arcade font-bold text-black mb-6">
            INSERT MON COIN TO CONTINUE WATCHING {video.title}.
          </p>
          <button
            onClick={onOpenDepositModal}
            className="pixel-btn-green px-6 py-3 text-xs"
          >
            + INSERT MON COIN
          </button>
        </div>
      )}

      {/* 2. INITIAL SESSION APPROVAL RETRO ARCADE OVERLAY */}
      {!isSessionActive && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-pink-100/95 p-6 text-center border-4 border-black">
          <div className="flex h-16 w-16 items-center justify-center bg-yellow-300 border-4 border-black shadow-[4px_4px_0_#000000] mb-4">
            <Gamepad2 className="h-8 w-8 text-black animate-bounce" />
          </div>

          <h3 className="text-xl font-pixel text-black mb-3">
            PRESS START TO PLAY 🕹️
          </h3>

          <div className="flex flex-col items-center gap-1 mb-6 bg-white border-4 border-black px-6 py-3 font-arcade text-2xl text-black">
            <div className="font-bold text-pink-600">
              RATE: <span className="text-black font-pixel text-sm">{video.pricePerSecondEth} MON / SEC</span>
            </div>
            <div className="text-sm font-mono text-black">
              CREATOR: {video.creatorAddress}
            </div>
          </div>

          <button
            onClick={() => {
              onStartSession();
              if (videoRef.current) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
            }}
            className="pixel-btn-yellow px-8 py-4 text-xs uppercase"
          >
            ▶ START MONAD STREAM
          </button>
        </div>
      )}

      {/* RETRO ARCADE RATE BADGE */}
      {isSessionActive && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-yellow-300 border-3 border-black text-xs font-pixel text-black shadow-[3px_3px_0_#000000]">
          <Zap className="h-4 w-4 text-black fill-black animate-pulse" />
          <span>⚡ {video.pricePerSecondEth} MON/SEC</span>
          {isPlaying && (
            <span className="h-3 w-3 bg-emerald-500 border border-black animate-ping" />
          )}
        </div>
      )}

    </div>
  );
};
