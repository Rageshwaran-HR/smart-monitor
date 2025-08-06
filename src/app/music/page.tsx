'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MusicPlayer } from './components/MusicPlayer';
import { AudioVisualizer } from './components/AudioVisualizer';
import { Navigation } from '../components/Navigation';
import { PlaylistPanel } from './components/PlaylistPanel';
import axios from 'axios';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  cover: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  is_playing: boolean;
  progress_ms: number;
}

export default function MusicPage() {
  const router = useRouter();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Spotify-related state
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [mirrorEnabled, setMirrorEnabled] = useState(false);
  const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [piConnected, setPiConnected] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingMirrorStatus, setCheckingMirrorStatus] = useState(true);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Check mirror status and handle navigation
  const checkMirrorStatusAndNavigate = async () => {
    try {
      setCheckingMirrorStatus(true);
      console.log("🔍 Checking mirror status...");
      
      const response = await fetch(`${API_BASE_URL}/api/pi/spotify-credentials/status`);
      const data = await response.json();

      if (data.success) {
        console.log("📊 Mirror Status:", data.mirrorEnabled);
        
        if (data.mirrorEnabled) {
          console.log("✅ Mirror already enabled, staying on music page");
          setMirrorEnabled(true);
          setPiConnected(data.credentialsSent && !data.credentialsExpired);
          return false; // Don't navigate, stay here
        } else {
          console.log("🔄 Mirror not enabled, enabling and staying...");
          await enableMirrorMode();
          return false; // Stay on music page after enabling
        }
      } else {
        console.log("⚠️ Could not check mirror status, enabling...");
        await enableMirrorMode();
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking mirror status:', error);
      // If we can't check status, try to enable mirror
      await enableMirrorMode();
      return false;
    } finally {
      setCheckingMirrorStatus(false);
    }
  };

  // Enable mirror mode
  const enableMirrorMode = async () => {
    try {
      console.log("🎵 Enabling Spotify mirror mode...");
      
      const response = await fetch(`${API_BASE_URL}/api/pi/spotify-mirror`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mirrorEnabled: true,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Mirror enabled successfully");
        setMirrorEnabled(true);
        return true;
      } else {
        console.error("❌ Failed to enable mirror:", data.error);
        setError("Failed to enable Spotify mirror mode");
        return false;
      }
    } catch (error) {
      console.error('❌ Error enabling mirror mode:', error);
      setError("Error connecting to Pi");
      return false;
    }
  };

  // Get Spotify access token using client credentials
  const getSpotifyToken = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '303680b1b8864939821fc585221aca6f';
      const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '04df353831a14312aa10b8694e8cdd2d';

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (response.ok) {
        const data = await response.json();
        setSpotifyToken(data.access_token);
        setSpotifyConnected(true);
        return data.access_token;
      } else {
        console.error('Failed to get Spotify token');
        return null;
      }
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      return null;
    }
  };

  // Get currently playing track from Spotify API
  const getCurrentSpotifyTrack = async (token: string) => {
    try {
      // First try to get from Pi endpoint
      const response = await fetch(`${API_BASE_URL}/api/spotify/current-song`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.track) {
          setCurrentSpotifyTrack(data.track);
          
          // Convert to our Track format
          const track: Track = {
            id: data.track.id,
            title: data.track.name,
            artist: data.track.artists.map((a: any) => a.name).join(', '),
            album: data.track.album.name,
            duration: Math.floor(data.track.duration_ms / 1000),
            url: '', // Spotify tracks don't have direct URLs
            cover: data.track.album.images[0]?.url || '/default-cover.jpg'
          };

          setCurrentTrack(track);
          setIsPlaying(data.track.is_playing);
          setCurrentTime(Math.floor(data.track.progress_ms / 1000));
          setDuration(Math.floor(data.track.duration_ms / 1000));
          return;
        }
      }

      // Fallback: Use Spotify Web API to get featured playlists
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/browse/featured-playlists?limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.playlists.items.length > 0) {
          const playlistId = searchData.playlists.items[0].id;
          
          // Get tracks from the featured playlist
          const tracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=1`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json();
            if (tracksData.items.length > 0) {
              const spotifyTrack = tracksData.items[0].track;

              const track: Track = {
                id: spotifyTrack.id,
                title: spotifyTrack.name,
                artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
                album: spotifyTrack.album.name,
                duration: Math.floor(spotifyTrack.duration_ms / 1000),
                url: '',
                cover: spotifyTrack.album.images[0]?.url || '/default-cover.jpg'
              };

              setCurrentTrack(track);
              setCurrentSpotifyTrack({
                id: spotifyTrack.id,
                name: spotifyTrack.name,
                artists: spotifyTrack.artists,
                album: spotifyTrack.album,
                duration_ms: spotifyTrack.duration_ms,
                is_playing: false,
                progress_ms: 0
              });
              setIsPlaying(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Spotify track:', error);
    }
  };

  // Send credentials to Pi
  const sendCredentialsToPi = async (token: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/pi/spotify-credentials`, {
        accessToken: token,
        clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '303680b1b8864939821fc585221aca6f',
        clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '04df353831a14312aa10b8694e8cdd2d',
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        console.log('✅ Credentials sent to Pi successfully');
      }
    } catch (error) {
      console.error('Failed to send credentials to Pi:', error);
    }
  };

  // Sample playlist fallback
  const samplePlaylist: Track[] = [
    {
      id: '1',
      title: 'Neon Dreams',
      artist: 'SynthWave Pro',
      album: 'Digital Nights',
      duration: 234,
      url: '/api/audio/track/1',
      cover: '/api/covers/neon-dreams.jpg'
    },
    {
      id: '2',
      title: 'Electric Pulse',
      artist: 'CyberBeats',
      album: 'Future Waves',
      duration: 198,
      url: '/api/audio/track/2',
      cover: '/api/covers/electric-pulse.jpg'
    },
    {
      id: '3',
      title: 'Party Lights',
      artist: 'Bass Master',
      album: 'Club Hits',
      duration: 256,
      url: '/api/audio/track/3',
      cover: '/api/covers/party-lights.jpg'
    }
  ];

  // Initial setup with mirror check
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      
      try {
        // First check mirror status and handle navigation
        const shouldNavigateAway = await checkMirrorStatusAndNavigate();
        
        if (shouldNavigateAway) {
          // If we need to navigate away, don't continue with initialization
          return;
        }

        // Continue with normal initialization since we're staying
        console.log("🎵 Initializing music page...");
        
        // Try to get Spotify token and current track
        const token = await getSpotifyToken();
        if (token) {
          await getCurrentSpotifyTrack(token);
          await sendCredentialsToPi(token);
        }
        
        // Fallback to sample playlist if no Spotify track
        if (!currentTrack) {
          setPlaylist(samplePlaylist);
          setCurrentTrack(samplePlaylist[0]);
        }
      } catch (error) {
        console.error("❌ Error initializing music page:", error);
        setError("Failed to initialize music player");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  // Poll for updates when Spotify is connected
  useEffect(() => {
    if (spotifyConnected && spotifyToken && mirrorEnabled) {
      const interval = setInterval(() => {
        getCurrentSpotifyTrack(spotifyToken);
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [spotifyConnected, spotifyToken, mirrorEnabled]);

  // Initialize Web Audio API for visualization (only for non-Spotify tracks)
  useEffect(() => {
    if (audioRef.current && !audioContext && currentTrack?.url) {
      const ctx = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })?.webkitAudioContext)();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      setAudioContext(ctx);
      setAnalyser(analyserNode);
    }
  }, [audioRef.current, audioContext, currentTrack]);

  const handlePlayPause = () => {
    if (currentSpotifyTrack) {
      // For Spotify tracks, we can't control playback directly
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        if (audioContext?.state === 'suspended') {
          audioContext.resume();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !currentSpotifyTrack) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (time: number) => {
    if (currentSpotifyTrack) return;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTrackSelect = (track: Track) => {
    if (currentSpotifyTrack) return;
    setCurrentTrack(track);
    setCurrentTime(0);
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleNext = () => {
    if (currentSpotifyTrack) return;
    if (currentTrack && playlist.length > 1) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      handleTrackSelect(playlist[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentSpotifyTrack) return;
    if (currentTrack && playlist.length > 1) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      handleTrackSelect(playlist[prevIndex]);
    }
  };

  // Loading screen with mirror status check
  if (loading || checkingMirrorStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-xl">
            {checkingMirrorStatus ? 'Checking Spotify Mirror Status...' : 'Loading Spotify Music...'}
          </p>
          {mirrorEnabled && (
            <p className="text-sm text-green-400 mt-2">✅ Mirror Mode Enabled</p>
          )}
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Background Audio Visualizer */}
        <div className="fixed inset-0 z-0">
          <AudioVisualizer
            analyser={analyser}
            isPlaying={isPlaying}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">♪</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                SmartMonitor Music
              </h1>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-4">
                {spotifyConnected && (
                  <div className="flex items-center space-x-2 text-sm text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Spotify Connected</span>
                  </div>
                )}
                
                {mirrorEnabled && (
                  <div className="flex items-center space-x-2 text-sm text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Mirror Active</span>
                  </div>
                )}
                
                {piConnected && (
                  <div className="flex items-center space-x-2 text-sm text-purple-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>Pi Connected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!currentSpotifyTrack && (
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  Playlist
                </button>
              )}
            </div>
          </header>

          {/* Status Banner */}
          {currentSpotifyTrack && mirrorEnabled && (
            <div className="bg-green-500/20 border-b border-green-500/30 px-6 py-2">
              <p className="text-sm text-green-200">
                🎵 Mirror Mode Active - Live Spotify data via Pi integration
              </p>
            </div>
          )}

          {/* Main Layout */}
          <div className="flex h-[calc(100vh-88px)]">
            {/* Main Player Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {currentTrack && (
                <MusicPlayer
                  track={currentTrack}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  onVolumeChange={handleVolumeChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isSpotifyTrack={!!currentSpotifyTrack}
                />
              )}
            </div>

            {/* Playlist Panel - only show for non-Spotify tracks */}
            {showPlaylist && !currentSpotifyTrack && (
              <PlaylistPanel
                playlist={playlist}
                currentTrack={currentTrack}
                onTrackSelect={handleTrackSelect}
                onClose={() => setShowPlaylist(false)}
              />
            )}
          </div>
        </div>

        {/* Hidden Audio Element - only for non-Spotify tracks */}
        {currentTrack && !currentSpotifyTrack && currentTrack.url && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleNext}
            crossOrigin="anonymous"
          ></audio>
        )}
      </div>
    </div>
  );
}