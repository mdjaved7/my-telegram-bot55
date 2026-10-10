import React, { useState } from 'react';
import { Send, Heart, Library, X, ShoppingCart } from 'lucide-react';
import { StoryItem } from '../data/stories';
import { StoryPoster } from './StoryPoster';

interface LibraryViewProps {
  purchasedStories: StoryItem[];
  wishlistedStories: StoryItem[];
  lang: 'hi' | 'en';
  onViewStoryDetails: (story: StoryItem) => void;
  onDeliverToTelegramBot: (story: StoryItem) => void;
  onAddToCart: (story: StoryItem) => void;
  onRemoveWishlist: (storyId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  purchasedStories,
  wishlistedStories,
  lang,
  onViewStoryDetails,
  onDeliverToTelegramBot,
  onAddToCart,
  onRemoveWishlist,
}) => {
  const [subTab, setSubTab] = useState<'purchased' | 'wishlist'>('purchased');
  const [showReadyBanner, setShowReadyBanner] = useState(true);

  return (
    <div className="pb-24 space-y-4 pt-2">
      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setSubTab('purchased')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
            subTab === 'purchased'
              ? 'bg-white text-black border-white shadow'
              : 'bg-[#141418] text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>
            {lang === 'hi'
              ? `खरीदी गईं · ${purchasedStories.length}`
              : `Purchased · ${purchasedStories.length}`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('wishlist')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
            subTab === 'wishlist'
              ? 'bg-white text-black border-white shadow'
              : 'bg-[#141418] text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>
            {lang === 'hi'
              ? `विशलिस्ट ${wishlistedStories.length > 0 ? `· ${wishlistedStories.length}` : ''}`
              : `Wishlist ${wishlistedStories.length > 0 ? `· ${wishlistedStories.length}` : ''}`}
          </span>
        </button>
      </div>

      {/* Ready Notification Banner */}
      {subTab === 'purchased' && showReadyBanner && purchasedStories.length > 0 && (
        <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#141418] border border-zinc-800 text-xs text-zinc-300">
          <span>
            {lang === 'hi'
              ? 'आपकी खरीदी गई कहानी तैयार है! सुनने के लिए टैप करें।'
              : 'Your purchased story series is ready! Tap below to receive & listen.'}
          </span>
          <button
            type="button"
            onClick={() => setShowReadyBanner(false)}
            className="text-zinc-500 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Purchased Stories List */}
      {subTab === 'purchased' ? (
        <div className="space-y-3.5">
          {purchasedStories.map((story) => (
            <div
              key={story.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#0d281e] via-[#0a1f17] to-[#081611] border border-emerald-800/40 shadow-lg space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
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
                  <h3 className="text-base font-bold text-white truncate">
                    {lang === 'hi' ? story.titleHi : story.titleEn}
                  </h3>
                  <p className="text-xs text-zinc-300">
                    {story.platform} · {lang === 'hi' ? story.genreHi : story.genreEn}
                  </p>
                  <div className="flex items-center gap-2 pt-1 tabular-nums">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                      MINI APP
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-sm font-bold text-white">₹{story.price}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <button
                  type="button"
                  onClick={() => onViewStoryDetails(story)}
                  className="sm:col-span-5 py-2.5 px-4 rounded-full border border-emerald-700/60 hover:bg-emerald-900/30 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {lang === 'hi' ? 'और देखें' : 'View Details'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeliverToTelegramBot(story)}
                  className="sm:col-span-7 py-2.5 px-4 rounded-full bg-white hover:bg-zinc-200 text-xs font-bold text-black flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
                >
                  <span>
                    {lang === 'hi'
                      ? 'स्टोरी एपिसोड प्राप्त करें'
                      : 'Get Story Episodes'}
                  </span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : wishlistedStories.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <Heart className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-semibold text-zinc-300">
            {lang === 'hi' ? 'आपकी विशलिस्ट खाली है' : 'Your wishlist is empty'}
          </div>
          <p className="text-xs text-zinc-500">
            {lang === 'hi'
              ? 'अपनी पसंदीदा कहानियों को बाद में खरीदने के लिए यहाँ सेव करें।'
              : 'Save your favorite audio series here to purchase later.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wishlistedStories.map((story) => (
            <div
              key={story.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#131316] border border-zinc-800"
            >
              <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0">
                <StoryPoster
                  image={story.image}
                  posterTitle={story.posterTitle}
                  filter={story.posterFilter}
                  compact
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {lang === 'hi' ? story.titleHi : story.titleEn}
                </h4>
                <div className="text-xs text-zinc-400">
                  {story.platform} · ₹{story.price}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onAddToCart(story)}
                    className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'कार्ट में जोड़ें' : 'Add to Cart'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveWishlist(story.id)}
                    className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
