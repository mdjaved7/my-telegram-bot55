import React, { useState } from 'react';
import { Headphones } from 'lucide-react';

interface StoryPosterProps {
  image: string;
  posterTitle: string;
  posterSubtitle?: string;
  platform?: string;
  filter?: string;
  accentGradient?: string;
  className?: string;
  compact?: boolean;
}

export const StoryPoster: React.FC<StoryPosterProps> = ({
  image,
  posterTitle,
  posterSubtitle,
  platform,
  filter,
  accentGradient = 'from-amber-950/90 via-zinc-900 to-black',
  className = '',
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden select-none bg-gradient-to-b ${accentGradient} ${className}`}
    >
      {!imgError ? (
        <img
          src={image}
          alt={posterTitle}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={filter ? { filter } : undefined}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
          <Headphones className="w-7 h-7 text-amber-400/70 mb-1.5" />
          <span className="text-[10px] font-semibold text-zinc-300 line-clamp-2">
            {posterTitle}
          </span>
        </div>
      )}

      {/* Measured contrast scrim for poster typography legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20 pointer-events-none" />

      {/* Top platform mark if not compact */}
      {!compact && platform && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/65 backdrop-blur-xs text-[9px] font-semibold tracking-wider text-amber-300/95 uppercase pointer-events-none">
          {platform}
        </div>
      )}

      {/* Poster Title Lockup at bottom */}
      {!compact && (
        <div className="absolute inset-x-2 bottom-2.5 text-center pointer-events-none">
          {posterSubtitle && (
            <div className="text-[8px] font-semibold tracking-[0.18em] text-amber-300/90 uppercase mb-0.5 drop-shadow">
              {posterSubtitle}
            </div>
          )}
          <div
            style={{ fontFamily: 'var(--font-serif-poster)' }}
            className="text-xs sm:text-sm font-bold tracking-wide text-white leading-tight uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] line-clamp-2"
          >
            {posterTitle}
          </div>
        </div>
      )}
    </div>
  );
};
