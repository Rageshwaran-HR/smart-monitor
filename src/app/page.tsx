'use client';

import { Navigation } from './components/Navigation';
import { GoogleCalendar } from './components/GoogleCalendar';
import { DailyTasks } from './components/DailyTasks';
import { AnalogClock } from './components/AnalogClock';
import  WeatherWidget  from './components/WeatherWidget';
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

// Thought for a good day card
function ThoughtCard() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 shadow-lg text-white text-center max-w-md">
        <span className="text-lg font-semibold">“Every day may not be good, but there is something good in every day.”</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeWallpaper, setActiveWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveWallpaper();
    // Auto refresh every 3 seconds to detect wallpaper changes from mobile controller
    const interval = setInterval(fetchActiveWallpaper, 3000);
    
    return () => {
      clearInterval(interval);
    };
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
      <AnalogClock />
      <GoogleCalendar />
      {/* DailyTasks always visible at top right corner */}
      <div className="fixed top-6 right-6 z-[100]">
        <DailyTasks />
      </div>
      <WeatherWidget />
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
      </div>
      <ThoughtCard />
    </>
  );
}
