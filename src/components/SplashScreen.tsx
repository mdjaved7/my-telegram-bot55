import React, { useEffect, useState } from 'react';
import { SPLASH_POSTERS, LoadingScreenConfig } from '../data/stories';
import { StoryPoster } from './StoryPoster';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  lang: 'hi' | 'en';
  config?: LoadingScreenConfig;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, lang, config }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const durationMs = (config?.durationSec || 3) * 1000;

  useEffect(() => {
    const rotateTimer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SPLASH_POSTERS.length);
    }, 900);

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearInterval(rotateTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish, durationMs]);

  // Compute relative position [-2, -1, 0, 1, 2] for the 5-card fan
  const getRelativeOffset = (idx: number) => {
    const total = SPLASH_POSTERS.length;
    let diff = (idx - activeIndex + total) % total;
    if (diff > Math.floor(total / 2)) {
      diff -= total;
    }
    return diff;
  };

  const titleText = config?.title || 'WELCOME TO ALL STORY FM';
  const subtitleText =
    config?.subtitle ||
    'Your automated store inside Telegram for premium audio and video story series — delivered instantly to your chat.';

  return (
    <div className="fixed inset-0 z-50 bg-[#050507] text-white flex flex-col items-center justify-center px-6 select-none">
      {/* Fanned 5-Card Carousel */}
      <div className="relative w-full max-w-md h-64 flex items-center justify-center mb-8">
        {SPLASH_POSTERS.map((poster, idx) => {
          const offset = getRelativeOffset(idx);
          const translateX = offset * 48;
          const rotate = offset * 9;
          const scale = offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.88 : 0.76;
          const zIndex = 20 - Math.abs(offset) * 5;
          const opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.18;

          return (
            <div
              key={poster.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                transform: `translateX(${translateX}px) rotate(${rotate}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className="absolute w-36 h-52 rounded-2xl overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.85)] border border-white/15 transition-all duration-500 ease-out cursor-pointer"
            >
              <StoryPoster
                image={poster.image}
                posterTitle={poster.title}
                posterSubtitle={poster.subtitle}
                filter={poster.filter}
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>

      {/* WELCOME TO ALL STORY FM Banner */}
      <div className="w-full max-w-sm border-y border-zinc-800 py-3 mb-4 text-center">
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-zinc-100 uppercase">
          {titleText}
        </h1>
      </div>

      <p className="max-w-sm text-center text-xs sm:text-sm text-zinc-400 leading-relaxed mb-8">
        {subtitleText}
      </p>

      {/* Spoke Spinner + Instant Skip Button */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-7 h-7" aria-label="Loading store">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              style={{
                transform: `rotate(${i * 45}deg) translate(0, -9px)`,
                animationDelay: `${i * 0.1}s`,
              }}
              className="absolute left-1/2 top-1/2 w-0.5 h-2 -ml-[1px] -mt-1 bg-zinc-300 rounded-full animate-pulse"
            />
          ))}
        </div>

        <button
          onClick={onFinish}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{lang === 'hi' ? 'स्टोर में प्रवेश करें' : 'Enter Store Now'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
