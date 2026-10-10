import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Lock,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { StoryItem } from '../data/stories';
import { StoryPoster } from './StoryPoster';
import { audioEngine } from '../utils/audioPlayer';

interface SamplePlayerModalProps {
  story: StoryItem | null;
  onClose: () => void;
  onBuyFullSeries: (story: StoryItem) => void;
  lang: 'hi' | 'en';
}

export const SamplePlayerModal: React.FC<SamplePlayerModalProps> = ({
  story,
  onClose,
  onBuyFullSeries,
  lang,
}) => {
  const [playingEp, setPlayingEp] = useState<number | null>(1);
  const [progressSec, setProgressSec] = useState(0);

  useEffect(() => {
    if (!story) {
      setPlayingEp(null);
      audioEngine.stop();
      return;
    }
    setPlayingEp(1);
    setProgressSec(0);
    audioEngine.start(1, story.audioUrl);
  }, [story]);

  useEffect(() => {
    if (playingEp === null) {
      audioEngine.stop();
      return;
    }
    audioEngine.start(playingEp, story?.audioUrl);
    const interval = window.setInterval(() => {
      setProgressSec((p) => p + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [playingEp, story]);

  useEffect(() => {
    return () => audioEngine.stop();
  }, []);

  if (!story) return null;

  const sampleEpisodes = [
    {
      epNum: 1,
      titleHi: 'एपिसोड 1: रहस्यमयी शुरुआत (The Beginning)',
      titleEn: 'Episode 1: The Awakening',
      duration: '9:42',
      isLocked: false,
      tagHi: 'फ्री प्रीव्यू',
      tagEn: 'Free Preview',
    },
    {
      epNum: 2,
      titleHi: 'एपिसोड 2: खतरे का साया (The Rising Storm)',
      titleEn: 'Episode 2: The Rising Storm',
      duration: '10:15',
      isLocked: false,
      tagHi: 'फ्री प्रीव्यू',
      tagEn: 'Free Preview',
    },
    {
      epNum: 3,
      titleHi: 'एपिसोड 3: गहरा राज़ (The Dark Secret)',
      titleEn: 'Episode 3: The Dark Secret',
      duration: '9:08',
      isLocked: false,
      tagHi: 'फ्री प्रीव्यू',
      tagEn: 'Free Preview',
    },
    {
      epNum: story.totalEpisodes,
      titleHi: `एपिसोड ${story.totalEpisodes}: महा-क्लाइमेक्स टीज़र (Grand Finale)`,
      titleEn: `Episode ${story.totalEpisodes}: Grand Finale Teaser`,
      duration: '11:20',
      isLocked: false,
      tagHi: 'क्लाइमेक्स टीज़र',
      tagEn: 'Climax Teaser',
    },
  ];

  const lockedRemaining = Math.max(0, story.totalEpisodes - 3);

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#121216] border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-[#16161c]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{lang === 'hi' ? 'ऑडियो स्टोरी प्लेयर' : 'Audio Story Preview'}</span>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                All Story FM
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              audioEngine.stop();
              onClose();
            }}
            className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Lead Banner with Mini Visualizer */}
        <div className="p-4 bg-gradient-to-b from-[#181822] to-[#121216] border-b border-zinc-800 flex items-center gap-4">
          <div className="w-20 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg">
            <StoryPoster
              image={story.image}
              posterTitle={story.posterTitle}
              filter={story.posterFilter}
              accentGradient={story.accentGradient}
              compact
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              {story.platform} · {lang === 'hi' ? story.genreHi : story.genreEn}
            </div>
            <h2 className="text-base font-bold text-white truncate">
              {lang === 'hi' ? story.titleHi : story.titleEn}
            </h2>
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-zinc-300" />
              <span className="font-semibold text-zinc-200 tabular-nums">
                {lang === 'hi'
                  ? `कुल ${story.totalEpisodes} एपिसोड्स`
                  : `Total ${story.totalEpisodes} Episodes`}
              </span>
            </div>

            {/* Active playing indicator */}
            {playingEp !== null && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
                <span>
                  {lang === 'hi'
                    ? `एपिसोड ${playingEp} बज रहा है (${formatSec(progressSec)})`
                    : `Playing Ep ${playingEp} (${formatSec(progressSec)})`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Episode List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-xs font-semibold text-zinc-400 px-1">
            {lang === 'hi'
              ? 'मुफ़्त सैंपल एपिसोड्स (फ्री प्रीव्यू):'
              : 'Free Sample Episodes:'}
          </div>

          {sampleEpisodes.map((ep) => {
            const isCurrent = playingEp === ep.epNum;
            return (
              <div
                key={ep.epNum}
                onClick={() => {
                  if (isCurrent) {
                    setPlayingEp(null);
                  } else {
                    setPlayingEp(ep.epNum);
                    setProgressSec(0);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md'
                    : 'bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    aria-label={isCurrent ? 'Pause' : 'Play'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow ${
                      isCurrent
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                    }`}
                  >
                    {isCurrent ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {lang === 'hi' ? ep.titleHi : ep.titleEn}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                      <span>{ep.duration}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-medium">
                        {lang === 'hi' ? ep.tagHi : ep.tagEn}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                    FREE
                  </span>
                </div>
              </div>
            );
          })}

          {/* Locked Episodes Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-900/40 space-y-2 mt-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>
                {lang === 'hi'
                  ? `बाकी सभी ${lockedRemaining} एपिसोड्स लॉक हैं`
                  : `Remaining ${lockedRemaining} Episodes are Locked`}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {lang === 'hi'
                ? `इस कहानी में कुल ${story.totalEpisodes} एपिसोड्स हैं। जब तक आप पूरी कहानी का भुगतान नहीं करेंगे, बाकी सभी भाग लॉक रहेंगे। पेमेंट करने के बाद टेलीग्राम बॉट से सभी एपिसोड एक साथ प्राप्त करें!`
                : `This series contains ${story.totalEpisodes} full episodes. All remaining episodes are unlocked upon payment and delivered instantly to your Telegram chat.`}
            </p>
          </div>
        </div>

        {/* Bottom CTA: Buy Full Series */}
        <div className="p-4 bg-[#141418] border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-300 px-1 tabular-nums">
            <span>
              {lang === 'hi' ? 'ऑफर मूल्य (छूट सहित):' : 'Discounted Price:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-amber-400">₹{story.price}</span>
              <span className="text-xs text-zinc-500 line-through">
                ₹{story.originalPrice}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {story.discountPercent}% OFF
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.stop();
              onClose();
              onBuyFullSeries(story);
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {lang === 'hi'
                ? `पूरी सीरीज़ खरीदें (₹${story.price}) — सभी ${story.totalEpisodes} एपिसोड्स अनलॉक करें`
                : `Buy Full Series (₹${story.price}) — Unlock All ${story.totalEpisodes} Episodes`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
