'use client';

import { Navigation } from './components/Navigation';
import { useEffect, useState } from 'react';

interface Wallpaper {
  id: string;
  fileName: string;
  displayName: string;
  size: string;
  resolution: string;
  path: string;
  category: string;
  url: string;
  isActive?: boolean;
}

// Get dynamic API base URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  }
  return 'http://localhost:5000'; // Fallback for SSR
};

export default function HomePage() {
  const [activeWallpaper, setActiveWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveWallpaper();
    // Auto refresh every 3 seconds to detect wallpaper changes from mobile controller
    const interval = setInterval(fetchActiveWallpaper, 3000);
    return () => clearInterval(interval);
    <Navigation />
  }, []);

  const fetchActiveWallpaper = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log('🌐 Using API URL:', `${apiBaseUrl}/api/wallpapers`);

      const response = await fetch('/api/wallpapers');
      const data = await response.json();

      if (data.success) {
        const active = data.wallpapers.find((w: Wallpaper) => w.isActive) || data.wallpapers[0];
        setActiveWallpaper(active);
        console.log('�� Active wallpaper:', active?.displayName);
      }
    } catch (err) {
      console.error('Wallpaper fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white text-xl">Loading wallpaper...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="relative min-h-screen overflow-hidden">
        {activeWallpaper && (
          <video
            key={activeWallpaper.id}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src={activeWallpaper.url} type="video/mp4" />
          </video>
        )}

        {/* Subtle overlay for better text visibility */}
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 z-10"></div>

        {/* Minimal header with wallpaper info */}
        <div className="relative z-20 min-h-screen flex flex-col justify-end">
          <div className="p-6 bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-3xl font-bold text-white mb-2">SmartMonitor</h1>
            {activeWallpaper && (
              <div className="text-white/90">
                <p className="text-lg">{activeWallpaper.displayName}</p>
                <p className="text-sm opacity-70">{activeWallpaper.resolution} • {activeWallpaper.category}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
