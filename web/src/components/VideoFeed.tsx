'use client';

import React, { useState } from 'react';
import { Play, Zap, Search, Filter, Wallet } from 'lucide-react';
import { Video } from '../lib/types';

interface VideoFeedProps {
  videos: Video[];
  activeVideo: Video;
  onSelectVideo: (video: Video) => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  activeVideo,
  onSelectVideo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Architecture', 'Core Protocol', 'Economics', 'Development'];

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.creatorAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 font-arcade text-black">
      
      {/* Search & Filter Controls (ZERO Purple, ZERO Blue!) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-yellow-200 border-4 border-black shadow-[6px_6px_0_#000000]">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Search title, creator, or wallet (0x...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-4 border-black pl-10 pr-4 py-2 text-lg font-arcade text-black placeholder-slate-500 focus:outline-none focus:bg-pink-100 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-black hidden sm:block mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 font-pixel text-[10px] uppercase transition-all ${
                selectedCategory === cat
                  ? 'bg-pink-500 text-white border-3 border-black font-bold shadow-[3px_3px_0_#000000]'
                  : 'bg-white text-black hover:bg-amber-200 border-3 border-black shadow-[2px_2px_0_#000000]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const isCurrent = video.id === activeVideo.id;

          return (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className={`group cursor-pointer overflow-hidden border-4 border-black transition-all duration-150 ${
                isCurrent
                  ? 'bg-yellow-300 shadow-[8px_8px_0_#000000] ring-4 ring-pink-500'
                  : 'bg-white hover:bg-amber-100 shadow-[6px_6px_0_#000000] hover:shadow-[9px_9px_0_#000000]'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-yellow-100 border-b-4 border-black">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Price Per Second Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-yellow-300 border-3 border-black text-[10px] font-pixel font-bold text-black shadow-[3px_3px_0_#000000]">
                  <Zap className="h-3 w-3 text-black fill-black" />
                  <span>{video.pricePerSecondEth} MON/S</span>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white border-2 border-black text-xs font-arcade text-black font-bold">
                  {Math.floor(video.durationSeconds / 60)}:
                  {(video.durationSeconds % 60).toString().padStart(2, '0')}
                </div>

                {/* Hover Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-yellow-300/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-12 w-12 items-center justify-center bg-pink-500 border-4 border-black shadow-[4px_4px_0_#000000] group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Information & Creator Wallet */}
              <div className="p-4 flex flex-col gap-3 font-arcade">
                <h4 className="text-xl font-bold text-black line-clamp-2 leading-tight group-hover:text-pink-700 transition-colors">
                  {video.title}
                </h4>

                {/* Creator Avatar & Wallet */}
                <div className="flex items-center justify-between p-2 bg-pink-100 border-3 border-black">
                  <div className="flex items-center gap-2">
                    <img
                      src={video.creatorAvatar}
                      alt={video.creatorName}
                      className="h-7 w-7 border-2 border-black object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-black">{video.creatorName}</span>
                      <span className="text-xs text-black font-mono flex items-center gap-1">
                        <Wallet className="h-3 w-3 text-black" />
                        {video.creatorAddress.substring(0, 6)}...
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-700 font-bold">
                    {video.viewsCount.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
