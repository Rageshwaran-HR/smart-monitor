import Image from 'next/image';
import React from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  cover: string;
}

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSpotifyTrack?: boolean;
}

export function MusicPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onNext,
  onPrevious,
  isSpotifyTrack = false
}: MusicPlayerProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSpotifyTrack) return; // Can't seek Spotify tracks
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    onSeek(seekTime);
  };

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl border border-white/10">
      {/* Album Cover */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <Image
            src={track.cover}
            alt={`${track.album} cover`}
            className="w-64 h-64 rounded-2xl shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = '/default-cover.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
        </div>
        
        {/* Track Info */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-white">{track.title}</h2>
          <p className="text-xl text-gray-300 mb-1">{track.artist}</p>
          <p className="text-lg text-gray-400">{track.album}</p>
        </div>
      </div>

      {/* Spotify Indicator */}
      {isSpotifyTrack && (
        <div className="flex items-center justify-center mb-4 text-green-400">
          <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Playing from Spotify</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div
          className={`w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-2 ${
            isSpotifyTrack ? 'cursor-not-allowed opacity-50' : ''
          }`}
          onClick={handleSeekClick}
        >
          <div
            className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        <button
          onClick={onPrevious}
          className={`p-3 rounded-full transition-colors ${
            isSpotifyTrack
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-white/10'
          }`}
          disabled={isSpotifyTrack}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        
        <button
          onClick={onPlayPause}
          className={`p-4 rounded-full bg-gradient-to-r transition-all transform hover:scale-105 ${
            isSpotifyTrack
              ? 'from-green-400 to-green-600 cursor-not-allowed opacity-50'
              : 'from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600'
          }`}
          disabled={isSpotifyTrack}
        >
          {isPlaying ? (
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        
        <button
          onClick={onNext}
          className={`p-3 rounded-full transition-colors ${
            isSpotifyTrack
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-white/10'
          }`}
          disabled={isSpotifyTrack}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* Volume Control - only show for non-Spotify tracks */}
      {!isSpotifyTrack && (
        <div className="flex items-center space-x-4">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <span className="text-sm text-gray-400 min-w-[3rem]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Spotify Notice */}
      {isSpotifyTrack && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-200 text-center">
            🎵 Playback is controlled through your Spotify app. Song information updates automatically.
          </p>
        </div>
      )}
    </div>
  );
}
