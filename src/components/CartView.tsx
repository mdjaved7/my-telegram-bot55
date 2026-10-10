import React, { useState } from 'react';
import {
  Heart,
  X,
  Zap,
  Bot,
  Tag,
  ArrowRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import { CouponItem, StoryItem } from '../data/stories';
import { StoryPoster } from './StoryPoster';

export interface CartEntry {
  story: StoryItem;
  packRange: string;
  selected: boolean;
}

interface CartViewProps {
  items: CartEntry[];
  lang: 'hi' | 'en';
  autoDelivery: boolean;
  onToggleAutoDelivery: () => void;
  onToggleItemSelect: (storyId: string) => void;
  onRemoveItem: (storyId: string) => void;
  onMoveToWishlist: (storyId: string) => void;
  onCheckout: () => void;
  onExploreStories: () => void;
  onOpenCoupons: () => void;
  appliedCoupon: CouponItem | null;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  lang,
  autoDelivery,
  onToggleAutoDelivery,
  onToggleItemSelect,
  onRemoveItem,
  onMoveToWishlist,
  onCheckout,
  onExploreStories,
  onOpenCoupons,
  appliedCoupon,
}) => {
  const [activeSectionTab, setActiveSectionTab] = useState<'items' | 'coupons' | 'price'>('items');
  const [itemToRemove, setItemToRemove] = useState<StoryItem | null>(null);

  const selectedItems = items.filter((item) => item.selected);
  const totalOriginal = selectedItems.reduce((acc, i) => acc + i.story.originalPrice, 0);
  const subtotal = selectedItems.reduce((acc, i) => acc + i.story.price, 0);

  const couponSavings =
    appliedCoupon && subtotal >= appliedCoupon.minOrder
      ? Math.min(
          appliedCoupon.maxDiscount,
          Math.round((subtotal * appliedCoupon.discountPercent) / 100)
        )
      : 0;

  const finalPayable = Math.max(0, subtotal - couponSavings);
  const totalSaved = Math.max(0, totalOriginal - finalPayable);

  if (items.length === 0) {
    return (
      <div className="min-h-[68vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          <div className="text-xl sm:text-2xl font-medium text-zinc-300 mb-1">
            {lang === 'hi' ? 'आपका कार्ट' : 'Your Cart is'}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'hi' ? 'खाली है' : 'Empty'}
          </div>
        </div>
        <button
          type="button"
          onClick={onExploreStories}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-zinc-600 hover:border-zinc-400 bg-zinc-900/60 hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
        >
          <span>{lang === 'hi' ? 'कहानियाँ देखें' : 'Explore Stories'}</span>
          <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 space-y-4">
      {/* Bag Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-white">
          {lang === 'hi' ? `आपका बैग (${items.length})` : `Your Bag (${items.length})`}
        </h2>
        <button
          type="button"
          onClick={onExploreStories}
          aria-label="Back to stories"
          className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3 Step Tabs (आइटम | कूपन और ऑफ़र | मूल्य विवरण) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveSectionTab('items')}
          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap truncate ${
            activeSectionTab === 'items'
              ? 'bg-zinc-900 border-zinc-600 text-white'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {lang === 'hi' ? 'आइटम' : 'Items'}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSectionTab('coupons');
            onOpenCoupons();
          }}
          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap truncate ${
            activeSectionTab === 'coupons'
              ? 'bg-zinc-900 border-zinc-600 text-white'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {lang === 'hi' ? 'कूपन और ऑफ़र' : 'Coupons & Offers'}
        </button>
        <button
          type="button"
          onClick={() => setActiveSectionTab('price')}
          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap truncate ${
            activeSectionTab === 'price'
              ? 'bg-zinc-900 border-zinc-600 text-white'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {lang === 'hi' ? 'मूल्य विवरण' : 'Price Details'}
        </button>
      </div>

      {/* Green Savings Banner */}
      {totalSaved > 0 && (
        <div className="py-2.5 px-4 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-center text-xs font-medium text-emerald-300 tabular-nums">
          {lang === 'hi'
            ? `वाह! आपने इस ऑर्डर पर ₹${totalSaved} की बचत की`
            : `Awesome! You saved ₹${totalSaved} on this order`}
        </div>
      )}

      {/* Selection + Auto-Delivery Toggle Row (00:28 in video) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-white">
              {lang === 'hi' ? `आपका बैग (${items.length})` : `Your Bag (${items.length})`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 tabular-nums">
              <CheckSquare className="w-3.5 h-3.5 text-white" />
              <span>
                {selectedItems.length}/{items.length}{' '}
                {lang === 'hi' ? 'आइटम चयनित' : 'items selected'}
              </span>
            </div>
          </div>

          {/* Auto-Delivery Switch */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-200">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              {lang === 'hi' ? 'ऑटो डिलीवरी' : 'Auto Delivery'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoDelivery}
              onClick={onToggleAutoDelivery}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                autoDelivery ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  autoDelivery ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {autoDelivery && (
          <div className="py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
            <span className="font-semibold text-white">
              {lang === 'hi' ? 'ऑटो डिलीवरी: ' : 'Auto Delivery: '}
            </span>
            {lang === 'hi'
              ? 'ऑन करने पर स्टोरी सीधे टेलीग्राम पर मिलेगी।'
              : 'When enabled, story episodes are delivered directly to your Telegram chat.'}
          </div>
        )}
      </div>

      {/* Cart Item Cards */}
      <div className="space-y-3">
        {items.map(({ story, packRange, selected }) => (
          <div
            key={story.id}
            className="relative flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#131316] border border-zinc-800/90"
          >
            <button
              type="button"
              onClick={() => onToggleItemSelect(story.id)}
              aria-label="Select item"
              className="mt-1 text-white cursor-pointer"
            >
              {selected ? (
                <CheckSquare className="w-4 h-4 text-white" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <StoryPoster
                image={story.image}
                posterTitle={story.posterTitle}
                filter={story.posterFilter}
                accentGradient={story.accentGradient}
                compact
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-sm font-bold text-white truncate">
                {lang === 'hi' ? story.titleHi : story.titleEn}
              </h3>
              <p className="text-xs text-zinc-400">
                {story.platform} · Ep {packRange}
              </p>

              <div className="flex items-baseline gap-2 mt-1.5 tabular-nums">
                <span className="text-sm font-bold text-white">₹{story.price}</span>
                <span className="text-xs text-zinc-500 line-through">
                  ₹{story.originalPrice}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {story.discountPercent}% OFF
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                <Bot className="w-3.5 h-3.5 text-sky-400" />
                <span>{lang === 'hi' ? 'बॉट द्वारा डिलीवरी' : 'Delivery via Telegram Bot'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setItemToRemove(story)}
              aria-label="Remove from bag"
              className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Price Details Card (मूल्य विवरण — matches 00:28 in video) */}
      <div className="p-4 rounded-2xl bg-[#131316] border border-zinc-800/90 space-y-3">
        <h3 className="text-sm font-bold text-white">
          {lang === 'hi' ? 'मूल्य विवरण' : 'Price Details'}
        </h3>

        <div className="flex items-center justify-between text-sm font-bold text-white pb-2 border-b border-zinc-800 tabular-nums">
          <span>{lang === 'hi' ? 'कुल' : 'Total Payable'}</span>
          <span>₹{finalPayable}</span>
        </div>

        <div className="space-y-2 text-xs text-zinc-300 tabular-nums">
          <div className="flex items-center justify-between">
            <span>{lang === 'hi' ? 'आपकी देय राशि (MRP)' : 'Total MRP'}</span>
            <span>₹{totalOriginal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{lang === 'hi' ? 'बैग छूट' : 'Bag Discount'}</span>
            <span className="text-emerald-400 font-semibold">
              -₹{totalOriginal - subtotal}
            </span>
          </div>
          {couponSavings > 0 && (
            <div className="flex items-center justify-between">
              <span>
                {lang === 'hi'
                  ? `कूपन छूट (${appliedCoupon?.code})`
                  : `Coupon (${appliedCoupon?.code})`}
              </span>
              <span className="text-emerald-400 font-semibold">-₹{couponSavings}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>
              {lang === 'hi' ? 'प्लेटफ़ॉर्म शुल्क ' : 'Platform Fee '}
              <button
                type="button"
                onClick={onOpenCoupons}
                className="underline font-semibold text-zinc-200 cursor-pointer"
              >
                {lang === 'hi' ? 'अधिक जानें' : 'Learn more'}
              </button>
            </span>
            <span className="text-emerald-400 font-semibold">
              {lang === 'hi' ? 'मुफ़्त' : 'FREE'}
            </span>
          </div>
        </div>

        {totalSaved > 0 && (
          <div className="py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-center text-xs font-medium text-emerald-300 tabular-nums">
            {lang === 'hi'
              ? `वाह! आपने इस ऑर्डर पर ₹${totalSaved} की बचत की`
              : `You saved ₹${totalSaved} on this order`}
          </div>
        )}
      </div>

      {/* Bottom Sticky Checkout CTA (Matches 00:28 in video) */}
      <div className="sticky bottom-16 z-20 pt-2 space-y-2 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        {totalSaved > 0 && (
          <div className="py-2 px-3 rounded-xl bg-emerald-900/50 border border-emerald-600/40 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-300 tabular-nums">
            <Tag className="w-3.5 h-3.5 fill-current" />
            <span>
              {lang === 'hi'
                ? `आप इस ऑर्डर पर ₹${totalSaved} बचा रहे हैं`
                : `You are saving ₹${totalSaved} on this order`}
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={selectedItems.length === 0}
          onClick={onCheckout}
          className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-between shadow-xl transition-colors cursor-pointer tabular-nums"
        >
          <span>
            {lang === 'hi' ? 'चेकआउट के लिए आगे बढ़ें' : 'Proceed to Checkout'}
          </span>
          <span className="flex items-center gap-2 text-base font-extrabold">
            ₹{finalPayable}
            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </span>
        </button>
      </div>

      {/* Remove from Bag Confirmation Bottom Sheet (Matches 00:29 in video) */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#141417] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">
                {lang === 'hi' ? 'बैग से हटाएं?' : 'Remove from Bag?'}
              </h4>
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <img
                src={itemToRemove.image}
                alt={itemToRemove.titleEn}
                referrerPolicy="no-referrer"
                className="w-12 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {lang === 'hi' ? itemToRemove.titleHi : itemToRemove.titleEn}
                </div>
                <div className="text-xs text-zinc-400">{itemToRemove.platform}</div>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              {lang === 'hi'
                ? 'क्या आप वाकई इस कहानी को अपने बैग से हटाना चाहते हैं?'
                : 'Are you sure you want to remove this story series from your bag?'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onRemoveItem(itemToRemove.id);
                  setItemToRemove(null);
                }}
                className="py-3 px-4 rounded-full border border-zinc-700 hover:border-zinc-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'हटाएं' : 'Remove'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onMoveToWishlist(itemToRemove.id);
                  setItemToRemove(null);
                }}
                className="py-3 px-4 rounded-full bg-white hover:bg-zinc-200 text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>
                  {lang === 'hi' ? 'विशलिस्ट में भेजें' : 'Move to Wishlist'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
