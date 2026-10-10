import React, { useEffect, useState } from 'react';
import {
  X,
  ShoppingCart,
  Heart,
  Send,
  Play,
  CheckCircle2,
  BookOpen,
  QrCode,
} from 'lucide-react';
import { StoryItem } from '../data/stories';
import { StoryPoster } from './StoryPoster';

interface StoryDetailModalProps {
  story: StoryItem | null;
  onClose: () => void;
  lang: 'hi' | 'en';
  isPurchased: boolean;
  isInCart: boolean;
  isWishlisted: boolean;
  onAddToCart: (story: StoryItem, packRange?: string) => void;
  onToggleWishlist: (storyId: string) => void;
  onOpenBotDelivery: (story: StoryItem) => void;
  onOpenSamplePlayer: (story: StoryItem) => void;
  onOpenDirectPayment: (story: StoryItem, amount: number) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  onClose,
  lang,
  isPurchased,
  isInCart,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onOpenBotDelivery,
  onOpenSamplePlayer,
  onOpenDirectPayment,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('all');

  useEffect(() => {
    setSelectedPackId('all');
  }, [story]);

  if (!story) return null;

  const currentPack =
    story.episodePacks.find((p) => p.id === selectedPackId) ||
    story.episodePacks[0];

  const packPrice = currentPack?.price || story.price;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Top Close & Wishlist controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{story.platform}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'hi' ? story.genreHi : story.genreEn}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{story.totalEpisodes} Ep</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(story.id)}
              aria-label="Toggle wishlist"
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex gap-4">
            <div className="w-28 h-40 sm:w-32 sm:h-44 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg">
              <StoryPoster
                image={story.image}
                posterTitle={story.posterTitle}
                posterSubtitle={story.posterSubtitle}
                filter={story.posterFilter}
                accentGradient={story.accentGradient}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {lang === 'hi' ? story.titleHi : story.titleEn}
                </h2>
                <div className="flex items-baseline gap-2 mt-1 tabular-nums">
                  <span className="text-base font-extrabold text-amber-400">
                    ₹{story.price}
                  </span>
                  <span className="text-xs text-zinc-500 line-through">
                    ₹{story.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {story.discountPercent}% OFF
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                  {lang === 'hi' ? story.synopsisHi : story.synopsisEn}
                </p>
              </div>

              {/* Sample Audio Preview Launcher Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSamplePlayer(story);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black shadow transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {lang === 'hi'
                      ? 'प्ले करें (सैंपल 1, 2, 3 + क्लाइमेक्स)'
                      : 'Play Preview (Ep 1, 2, 3 + Climax)'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Episode Pack Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              {lang === 'hi' ? 'एपिसोड पैक चुनें:' : 'Select Episode Pack:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {story.episodePacks.map((pack) => {
                const active = pack.id === currentPack?.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {lang === 'hi' ? pack.labelHi : pack.labelEn}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                        {lang === 'hi' ? 'इंस्टेंट बॉट डिलीवरी' : 'Instant Bot Delivery'}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2 tabular-nums">
                      <div className="text-sm font-bold text-white">₹{pack.price}</div>
                      <div className="text-[11px] text-zinc-500 line-through">
                        ₹{pack.originalPrice}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Info Strip */}
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'hi'
                  ? 'पेमेंट और एडमिन वेरिफिकेशन के बाद सभी MP3 फाइल्स सीधे टेलीग्राम चैट में आ जाएंगी।'
                  : 'All MP3 files are unlocked and sent to your Telegram chat upon admin approval.'}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 bg-[#16161a] border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
          {isPurchased ? (
            <button
              type="button"
              onClick={() => {
                onOpenBotDelivery(story);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {lang === 'hi'
                  ? 'स्टोरी एपिसोड प्राप्त करें (Telegram Bot)'
                  : 'Get Story Episodes in Bot'}
              </span>
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <>
              {/* Direct UPI Payment Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDirectPayment(story, packPrice);
                }}
                className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {lang === 'hi'
                    ? `पेमेंट करें (₹${packPrice})`
                    : `Direct Pay (₹${packPrice})`}
                </span>
              </button>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={() => {
                  onAddToCart(story, currentPack?.range);
                  onClose();
                }}
                className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isInCart ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? 'बैग में है' : 'In Bag'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'कार्ट में जोड़ें' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
