import { Video } from './types';
import { DEMO_VIDEOS } from './videos';

const DB_NAME = 'PayStreamVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';
const METADATA_KEY = 'paystream_videos_meta';

export class VideoStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  // Save video metadata globally via Vercel API & localStorage
  public async saveVideo(video: Video, videoBlob?: Blob): Promise<Video> {
    if (videoBlob) {
      try {
        const db = await this.initDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const request = store.put(videoBlob, `video_${video.id}`);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (err) {
        console.warn('Failed to store video blob in IndexedDB', err);
      }
    }

    // 1. Sync to local storage
    const existing = this.getLocalVideos();
    const updated = [video, ...existing.filter((v) => v.id !== video.id)];
    if (typeof window !== 'undefined') {
      localStorage.setItem(METADATA_KEY, JSON.stringify(updated));
    }

    // 2. Sync to global Vercel API endpoint for cross-device visibility
    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video),
      });
    } catch (e) {
      console.warn('Cloud video sync failed', e);
    }

    return video;
  }

  public getLocalVideos(): Video[] {
    if (typeof window === 'undefined') return DEMO_VIDEOS;

    try {
      const storedMeta = localStorage.getItem(METADATA_KEY);
      if (storedMeta) {
        const parsed: Video[] = JSON.parse(storedMeta);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored videos metadata');
    }

    return DEMO_VIDEOS;
  }

  // Load all videos (fetching real-time global API + fallback to local)
  public async loadVideosAsync(): Promise<Video[]> {
    const local = this.getLocalVideos();

    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const remoteVideos: Video[] = await response.json();
        if (remoteVideos && Array.isArray(remoteVideos) && remoteVideos.length > 0) {
          // Merge remote & local without duplicates
          const videoMap = new Map<number, Video>();
          remoteVideos.forEach((v) => videoMap.set(v.id, v));
          local.forEach((v) => videoMap.set(v.id, v));
          const merged = Array.from(videoMap.values());
          if (typeof window !== 'undefined') {
            localStorage.setItem(METADATA_KEY, JSON.stringify(merged));
          }
          return merged;
        }
      }
    } catch (e) {
      console.warn('Using local video cache');
    }

    return local;
  }

  public loadVideos(): Video[] {
    return this.getLocalVideos();
  }

  // Get video playable Blob URL (restores from IndexedDB if stored locally)
  public async getPlayableUrl(video: Video): Promise<string> {
    if (!video.id) return video.videoUrl;

    try {
      const db = await this.initDB();
      const blob = await new Promise<Blob | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(`video_${video.id}`);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });

      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (err) {
      console.warn('Could not retrieve blob from IndexedDB', err);
    }

    return video.videoUrl;
  }

  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(METADATA_KEY);
    }
  }
}

export const videoStorageService = new VideoStorageService();
