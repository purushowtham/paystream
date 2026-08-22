'use client';

import React, { useState, useRef } from 'react';
import { DollarSign, Clock, Layers, Video as VideoIcon, Zap, CheckCircle2, PlusCircle, Sparkles, Wallet, Upload, Film, FileVideo, CloudUpload } from 'lucide-react';
import { Video } from '../lib/types';
import { videoStorageService } from '../lib/video-storage';
import { uploadVideoToCloudinary } from '../lib/cloudinary';
import { formatEther } from 'viem';

interface CreatorDashboardProps {
  videos: Video[];
  creatorWallet: `0x${string}`;
  setCreatorWallet: (address: `0x${string}`) => void;
  onAddVideo: (video: Video, videoBlob?: Blob) => void;
  totalEarningsWei: bigint;
  totalSecondsPaid: number;
  totalTransactionsCount: number;
}

export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const blobUrl = URL.createObjectURL(file);
    video.src = blobUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg'));
        } else {
          resolve('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
        }
      } catch (e) {
        resolve('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
      }
    };

    video.onerror = () => {
      resolve('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
    };
  });
};

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  videos,
  creatorWallet,
  setCreatorWallet,
  onAddVideo,
  totalEarningsWei,
  totalSecondsPaid,
  totalTransactionsCount,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerSecondEth, setPricePerSecondEth] = useState('0.001');
  const [cloudName, setCloudName] = useState('dvg1bkx8s');
  const [uploadPreset, setUploadPreset] = useState('ml_default');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedEarnings = parseFloat(formatEther(totalEarningsWei)).toFixed(4);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsUploading(true);

    let finalVideoUrl = videoPreviewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    let finalThumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

    if (selectedFile) {
      // 1. Generate real thumbnail from video frame
      try {
        finalThumbnailUrl = await generateVideoThumbnail(selectedFile);
      } catch (e) {
        console.warn('Thumbnail generation fallback');
      }

      // 2. Upload to Cloudinary account dvg1bkx8s
      try {
        const cloudUrl = await uploadVideoToCloudinary(selectedFile, cloudName, 'Urs001opPwT0ydkE5QACD5FxwtY', uploadPreset);
        if (cloudUrl && cloudUrl.startsWith('http')) {
          finalVideoUrl = cloudUrl;
        } else {
          finalVideoUrl = URL.createObjectURL(selectedFile);
        }
      } catch (err) {
        finalVideoUrl = URL.createObjectURL(selectedFile);
      }
    }

    const newVideo: Video = {
      id: Date.now(),
      title: title,
      description: description || 'Uploaded creator video streaming live on Monad testnet.',
      creatorAddress: creatorWallet,
      creatorName: 'Creator (' + creatorWallet.substring(0, 6) + ')',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbnailUrl,
      durationSeconds: 300,
      pricePerSecondEth: pricePerSecondEth,
      viewsCount: 1,
      category: 'Development',
      uploadedAt: 'Just now',
    };

    await videoStorageService.saveVideo(newVideo, selectedFile || undefined);

    onAddVideo(newVideo, selectedFile || undefined);
    setIsUploading(false);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setVideoPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-6 font-arcade text-black">
      
      {/* Creator Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-pink-300 border-4 border-black shadow-[8px_8px_0_#000000]">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            alt="Creator Avatar"
            className="h-16 w-16 border-4 border-black object-cover"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-pixel text-black">CREATOR STAGE 🕹️</h2>
              <CheckCircle2 className="h-5 w-5 text-black fill-yellow-300" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Wallet className="h-4 w-4 text-black" />
              <span className="text-base text-black font-bold">
                PAYOUT WALLET: {creatorWallet}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="pixel-btn-yellow px-5 py-3 text-xs"
          >
            + UPLOAD REAL VIDEO FILE
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 bg-green-200 border-4 border-black shadow-[6px_6px_0_#000000]">
          <div className="flex items-center justify-between text-slate-700 text-xs font-pixel">
            <span>TOTAL EARNED</span>
            <DollarSign className="h-5 w-5 text-emerald-800" />
          </div>
          <div className="mt-2 text-3xl font-bold font-arcade text-black">
            {formattedEarnings} <span className="text-sm text-slate-700">MON</span>
          </div>
          <span className="text-xs text-slate-700 font-arcade mt-1 block">MONAD TESTNET SUBSECOND EARNINGS</span>
        </div>

        <div className="p-5 bg-amber-200 border-4 border-black shadow-[6px_6px_0_#000000]">
          <div className="flex items-center justify-between text-slate-700 text-xs font-pixel">
            <span>WATCH TIME</span>
            <Clock className="h-5 w-5 text-black" />
          </div>
          <div className="mt-2 text-3xl font-bold font-arcade text-black">
            {totalSecondsPaid} <span className="text-sm text-slate-700">SECONDS</span>
          </div>
          <span className="text-xs text-slate-700 font-arcade mt-1 block">PAID ACTUAL PLAYBACK TIME</span>
        </div>

        <div className="p-5 bg-pink-200 border-4 border-black shadow-[6px_6px_0_#000000]">
          <div className="flex items-center justify-between text-slate-700 text-xs font-pixel">
            <span>MONAD TXS</span>
            <Layers className="h-5 w-5 text-pink-800" />
          </div>
          <div className="mt-2 text-3xl font-bold font-arcade text-black">
            {totalTransactionsCount} <span className="text-sm text-slate-700">TXS</span>
          </div>
          <span className="text-xs text-slate-700 font-arcade mt-1 block">1 TX PER PAID SECOND ON MONAD</span>
        </div>

      </div>

      {/* Cloudinary Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-yellow-100/95 p-4">
          <div className="w-full max-w-lg bg-yellow-200 border-4 border-black p-6 shadow-[10px_10px_0_#000000]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-pixel text-black flex items-center gap-2">
                <CloudUpload className="h-5 w-5 text-pink-600 animate-bounce" />
                UPLOAD REAL VIDEO FILE
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs font-pixel text-slate-700 hover:text-black"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="flex flex-col gap-4 mt-2">
              
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 border-4 border-dashed border-black bg-white cursor-pointer hover:bg-pink-100 transition-all text-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Film className="h-10 w-10 text-pink-600 animate-bounce" />
                    <span className="text-sm font-pixel text-black truncate">{selectedFile.name}</span>
                    <span className="text-xs text-emerald-800 font-arcade font-bold">UPLOADING TO CLOUDINARY ({cloudName})</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-black" />
                    <span className="text-sm font-pixel text-black">SELECT MP4 / WEBM VIDEO FILE</span>
                    <span className="text-xs text-slate-700">TARGET CLOUD: dvg1bkx8s</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-pixel text-black">VIDEO TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Masterclass: Parallel EVM on Monad"
                  className="w-full mt-1 bg-white border-3 border-black px-4 py-2 text-base text-black font-arcade focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-pixel text-black">DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video content..."
                  className="w-full mt-1 bg-white border-3 border-black px-4 py-2 text-base text-black font-arcade focus:outline-none h-16"
                />
              </div>

              <div>
                <label className="text-xs font-pixel text-black">PRICE PER SECOND (MON / SEC)</label>
                <input
                  type="text"
                  required
                  value={pricePerSecondEth}
                  onChange={(e) => setPricePerSecondEth(e.target.value)}
                  className="w-full mt-1 bg-white border-3 border-black px-4 py-2 text-base font-mono text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-pixel text-slate-700 hover:text-black"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="pixel-btn-magenta px-6 py-3 text-xs"
                >
                  {isUploading ? 'UPLOADING...' : 'SAVE & PUBLISH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos List Table */}
      <div className="bg-amber-100 border-4 border-black p-5 shadow-[8px_8px_0_#000000]">
        <h3 className="text-sm font-pixel text-black mb-4 flex items-center gap-2">
          <VideoIcon className="h-5 w-5 text-pink-600" />
          ACTIVE CREATOR CATALOG ({videos.length} VIDEOS)
        </h3>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm font-arcade">
            <thead>
              <tr className="border-b-4 border-black text-black font-pixel text-[10px]">
                <th className="pb-2 pl-2">VIDEO TITLE</th>
                <th className="pb-2">CREATOR WALLET</th>
                <th className="pb-2">RATE / SEC</th>
                <th className="pb-2">VIEWS</th>
                <th className="pb-2 pr-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-300 text-black">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-white/60 transition-colors">
                  <td className="py-3 pl-2 font-bold text-black flex items-center gap-3">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-10 w-16 border-2 border-black object-cover"
                    />
                    <span className="max-w-xs line-clamp-1">{video.title}</span>
                  </td>
                  <td className="py-3 font-mono text-black font-bold">
                    {video.creatorAddress.substring(0, 6)}...
                  </td>
                  <td className="py-3 font-mono text-pink-700 font-bold">{video.pricePerSecondEth} MON/s</td>
                  <td className="py-3 font-mono">{video.viewsCount.toLocaleString()}</td>
                  <td className="py-3 pr-2">
                    <span className="px-2.5 py-1 bg-green-400 text-black border border-black font-pixel text-[8px] font-bold">
                      LIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
