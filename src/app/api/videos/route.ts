import { NextResponse } from 'next/server';
import { Video } from '@/lib/types';
import { DEMO_VIDEOS } from '@/lib/videos';

// Shared global in-memory video list across all users on Vercel
let globalVideos: Video[] = [...DEMO_VIDEOS];

export async function GET() {
  return NextResponse.json(globalVideos);
}

export async function POST(request: Request) {
  try {
    const newVideo: Video = await request.json();
    if (newVideo && newVideo.id) {
      // Add to global list if not already present
      const exists = globalVideos.some((v) => v.id === newVideo.id);
      if (!exists) {
        globalVideos = [newVideo, ...globalVideos];
      }
    }
    return NextResponse.json({ success: true, videos: globalVideos });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid video payload' }, { status: 400 });
  }
}
