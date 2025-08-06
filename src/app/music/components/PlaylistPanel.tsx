'use client';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  cover: string;
}

interface PlaylistPanelProps {
  playlist: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  onClose: () => void;
}

export function PlaylistPanel({ playlist, currentTrack, onTrackSelect, onClose }: PlaylistPanelProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-96 bg-black/40 backdrop-blur-md border-l border-white/10 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white">Playlist</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="p-4 space-y-2">
          {playlist.map((track, index) => (
            <div
              key={track.id}
              onClick={() => onTrackSelect(track)}
              className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                currentTrack?.id === track.id
                  ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30'
                  : 'hover:bg-white/10'
              }`}
            >
              {/* Track Number / Playing Indicator */}
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {currentTrack?.id === track.id ? (
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-green-400 animate-pulse"></div>
                    <div className="w-1 h-4 bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-4 bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 group-hover:text-white">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Album Art */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-lg">🎵</span>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  currentTrack?.id === track.id ? 'text-green-400' : 'text-white'
                }`}>
                  {track.title}
                </p>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
              </div>

              {/* Duration */}
              <div className="text-sm text-gray-400 ml-2">
                {formatTime(track.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center text-sm text-gray-400">
          {playlist.length} song{playlist.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
