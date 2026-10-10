import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  ChevronRight,
  Home,
  LayoutGrid,
  ShoppingBag,
  Library,
  Send,
  Sparkles,
  Check,
  ArrowRight,
  HelpCircle,
  X,
  Lock,
  Play,
  QrCode,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import {
  STORIES,
  LIVE_FEED_EVENTS,
  COUPONS,
  DEFAULT_PAYMENT_ORDERS,
  DEFAULT_LOADING_CONFIG,
  StoryItem,
  CouponItem,
  PaymentOrder,
  LoadingScreenConfig,
} from './data/stories';
import { StoryPoster } from './components/StoryPoster';
import { SplashScreen } from './components/SplashScreen';
import { CartView, CartEntry } from './components/CartView';
import { LibraryView } from './components/LibraryView';
import { TelegramBotSimulator } from './components/TelegramBotSimulator';
import { StoryDetailModal } from './components/StoryDetailModal';
import { CouponModal } from './components/CouponModal';
import { SamplePlayerModal } from './components/SamplePlayerModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminPanel } from './components/AdminPanel';

type NavTab = 'home' | 'categories' | 'cart' | 'library' | 'bot';

export default function App() {
  // LocalStorage-backed Dynamic Stories
  const [stories, setStories] = useState<StoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('asfm_stories');
      return saved ? JSON.parse(saved) : STORIES;
    } catch {
      return STORIES;
    }
  });

  // LocalStorage-backed Payment Orders Queue
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>(() => {
    try {
      const saved = localStorage.getItem('asfm_payment_orders');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_ORDERS;
    } catch {
      return DEFAULT_PAYMENT_ORDERS;
    }
  });

  // LocalStorage-backed Loading Screen Settings
  const [loadingConfig, setLoadingConfig] = useState<LoadingScreenConfig>(() => {
    try {
      const saved = localStorage.getItem('asfm_loading_config');
      return saved ? JSON.parse(saved) : DEFAULT_LOADING_CONFIG;
    } catch {
      return DEFAULT_LOADING_CONFIG;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('asfm_stories', JSON.stringify(stories));
    } catch {
      // ignore
    }
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem('asfm_payment_orders', JSON.stringify(paymentOrders));
    } catch {
      // ignore
    }
  }, [paymentOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('asfm_loading_config', JSON.stringify(loadingConfig));
    } catch {
      // ignore
    }
  }, [loadingConfig]);

  // Loading Screen Active State
  const [showSplash, setShowSplash] = useState<boolean>(() => loadingConfig.enabled);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Pre-populated Cart
  const [cart, setCart] = useState<CartEntry[]>(() => {
    const toxicLove = stories.find((s) => s.id === 'toxic-love') || stories[0];
    return [{ story: toxicLove, packRange: `1-${toxicLove.totalEpisodes}`, selected: true }];
  });

  // Pre-populated Purchased Library
  const [purchasedIds, setPurchasedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asfm_purchased_ids');
      return saved ? JSON.parse(saved) : ['super-siddharth', 'valentine-killer'];
    } catch {
      return ['super-siddharth', 'valentine-killer'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('asfm_purchased_ids', JSON.stringify(purchasedIds));
    } catch {
      // ignore
    }
  }, [purchasedIds]);

  const [wishlistIds, setWishlistIds] = useState<string[]>(['the-beast-guru']);
  const [autoDelivery, setAutoDelivery] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(COUPONS[0]);

  // Episode range selections for Trending cards
  const [trendingPackSelection, setTrendingPackSelection] = useState<Record<string, string>>({});

  // Modals state
  const [detailStory, setDetailStory] = useState<StoryItem | null>(null);
  const [samplePlayerStory, setSamplePlayerStory] = useState<StoryItem | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<{
    story: StoryItem;
    amount: number;
  } | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [botActiveStoryId, setBotActiveStoryId] = useState<string>('super-siddharth');
  const [botDeliveryTrigger, setBotDeliveryTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const purchasedStories = useMemo(
    () => stories.filter((s) => purchasedIds.includes(s.id)),
    [purchasedIds, stories]
  );

  const wishlistedStories = useMemo(
    () => stories.filter((s) => wishlistIds.includes(s.id)),
    [wishlistIds, stories]
  );

  const activeBotStory = useMemo(
    () =>
      stories.find((s) => s.id === botActiveStoryId) ||
      purchasedStories[0] ||
      stories[0],
    [botActiveStoryId, purchasedStories, stories]
  );

  // Handlers
  const handleAddToCart = (story: StoryItem, packRange?: string) => {
    if (purchasedIds.includes(story.id)) {
      handleDeliverToBot(story);
      return;
    }
    const range = packRange || trendingPackSelection[story.id] || `1-${story.totalEpisodes}`;
    setCart((prev) => {
      const exists = prev.some((item) => item.story.id === story.id);
      if (exists) {
        return prev.map((item) =>
          item.story.id === story.id ? { ...item, packRange: range, selected: true } : item
        );
      }
      return [...prev, { story, packRange: range, selected: true }];
    });
    triggerToast(
      lang === 'hi'
        ? `"${story.titleHi}" कार्ट में जोड़ा गया`
        : `"${story.titleEn}" added to bag`
    );
  };

  const handleToggleItemSelect = (storyId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.story.id === storyId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleRemoveFromCart = (storyId: string) => {
    setCart((prev) => prev.filter((item) => item.story.id !== storyId));
    triggerToast(lang === 'hi' ? 'बैग से हटा दिया गया' : 'Removed from bag');
  };

  const handleMoveToWishlist = (storyId: string) => {
    setCart((prev) => prev.filter((item) => item.story.id !== storyId));
    setWishlistIds((prev) => (prev.includes(storyId) ? prev : [...prev, storyId]));
    triggerToast(
      lang === 'hi' ? 'विशलिस्ट में भेजा गया' : 'Moved to Wishlist'
    );
  };

  const handleToggleWishlist = (storyId: string) => {
    setWishlistIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  // Open Direct UPI Payment with QR Code & Screenshot Upload
  const handleOpenDirectPayment = (story: StoryItem, amount?: number) => {
    setPaymentModalData({
      story,
      amount: amount || story.price,
    });
  };

  // When user submits payment screenshot & UTR
  const handleSubmitPaymentOrder = (order: PaymentOrder) => {
    setPaymentOrders((prev) => [order, ...prev]);
    triggerToast(
      lang === 'hi'
        ? 'पेमेंट स्क्रीनशॉट एडमिन को भेजा गया! वेरिफिकेशन होते ही बॉट एपिसोड डिलीवर करेगा।'
        : 'Payment screenshot submitted to admin! Episodes unlock upon verification.'
    );
  };

  // Admin approves payment request
  const handleApproveOrder = (orderId: string) => {
    const order = paymentOrders.find((o) => o.id === orderId);
    if (!order) return;

    setPaymentOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'approved' } : o))
    );

    // Unlock story for user
    if (!purchasedIds.includes(order.storyId)) {
      setPurchasedIds((prev) => [...prev, order.storyId]);
    }

    // Trigger Bot delivery
    setBotActiveStoryId(order.storyId);
    setBotDeliveryTrigger((c) => c + 1);

    triggerToast(
      lang === 'hi'
        ? `ऑर्डर #${orderId} वेरीफाई हो गया! बॉट पर सारे एपिसोड्स भेजे जा रहे हैं।`
        : `Order #${orderId} verified! Streaming all episodes in Telegram Bot.`
    );
  };

  const handleRejectOrder = (orderId: string) => {
    setPaymentOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'rejected' } : o))
    );
    triggerToast(
      lang === 'hi' ? `ऑर्डर #${orderId} अस्वीकार कर दिया गया।` : `Order #${orderId} rejected.`
    );
  };

  const handleCheckout = () => {
    const selected = cart.filter((i) => i.selected);
    if (selected.length === 0) return;

    const firstStory = selected[0].story;
    const subtotal = selected.reduce((acc, i) => acc + i.story.price, 0);
    const couponSavings =
      appliedCoupon && subtotal >= appliedCoupon.minOrder
        ? Math.min(
            appliedCoupon.maxDiscount,
            Math.round((subtotal * appliedCoupon.discountPercent) / 100)
          )
        : 0;
    const finalAmount = Math.max(0, subtotal - couponSavings);

    // Open Payment QR Screen
    handleOpenDirectPayment(firstStory, finalAmount);
  };

  const handleDeliverToBot = (story: StoryItem) => {
    if (!purchasedIds.includes(story.id)) {
      setPurchasedIds((prev) => [...prev, story.id]);
    }
    setBotActiveStoryId(story.id);
    setBotDeliveryTrigger((c) => c + 1);
    setActiveTab('bot');
    triggerToast(
      lang === 'hi'
        ? `@AllStoryFMBot पर "${story.titleHi}" के एपिसोड भेजे जा रहे हैं...`
        : `Streaming "${story.titleEn}" episodes in @AllStoryFMBot...`
    );
  };

  // Filtered stories for search or category tab
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchesCat =
        selectedCategory === 'all' || s.categoryKey === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.titleHi.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.genreHi.toLowerCase().includes(q) ||
        s.genreEn.toLowerCase().includes(q) ||
        s.platform.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [stories, selectedCategory, searchQuery]);

  // Section groupings for Storefront Home
  const popularStories = useMemo(
    () =>
      stories
        .filter((s) => s.popularRank !== undefined)
        .sort((a, b) => (a.popularRank || 99) - (b.popularRank || 99)),
    [stories]
  );
  const trendingStories = useMemo(() => stories.filter((s) => s.isTrending), [stories]);
  const newListings = useMemo(() => stories.filter((s) => s.isNewListing), [stories]);
  const pocketFriendlyStories = useMemo(
    () => stories.filter((s) => s.pocketFriendlyMax !== undefined),
    [stories]
  );
  const mustHaveStories = useMemo(() => stories.filter((s) => s.isMustHave), [stories]);

  const genreSections: {
    key: StoryItem['categoryKey'];
    titleHi: string;
    titleEn: string;
  }[] = [
    { key: 'action', titleHi: 'एक्शन', titleEn: 'Action' },
    { key: 'adventure', titleHi: 'एडवेंचर', titleEn: 'Adventure' },
    { key: 'billionaire', titleHi: 'अरबपति', titleEn: 'Billionaire' },
    { key: 'romance', titleHi: 'अनुबंध विवाह और रोमांस', titleEn: 'Contract Marriage & Romance' },
    { key: 'crime', titleHi: 'क्राइम', titleEn: 'Crime Thriller' },
    { key: 'drama', titleHi: 'ड्रामा', titleEn: 'Drama Series' },
  ];

  const categoriesList = [
    { id: 'all', labelHi: 'सभी कहानियाँ', labelEn: 'All Stories' },
    { id: 'fantasy', labelHi: 'फैंटेसी', labelEn: 'Fantasy' },
    { id: 'action', labelHi: 'एक्शन', labelEn: 'Action' },
    { id: 'adventure', labelHi: 'एडवेंचर', labelEn: 'Adventure' },
    { id: 'billionaire', labelHi: 'अरबपति', labelEn: 'Billionaire' },
    { id: 'romance', labelHi: 'रोमांस', labelEn: 'Romance' },
    { id: 'crime', labelHi: 'क्राइम', labelEn: 'Crime' },
    { id: 'horror', labelHi: 'हॉरर', labelEn: 'Horror' },
    { id: 'drama', labelHi: 'ड्रामा', labelEn: 'Drama' },
  ];

  // Reusable Standard Story Card
  const renderStandardCard = (story: StoryItem) => {
    const isPurchased = purchasedIds.includes(story.id);
    const isInCart = cart.some((c) => c.story.id === story.id);

    return (
      <div
        key={story.id}
        className="group flex flex-col bg-[#121215] rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-zinc-700 transition-all shadow-md"
      >
        <div
          onClick={() => setDetailStory(story)}
          className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer"
        >
          <StoryPoster
            image={story.image}
            posterTitle={story.posterTitle}
            posterSubtitle={story.posterSubtitle}
            platform={story.platform}
            filter={story.posterFilter}
            accentGradient={story.accentGradient}
            className="w-full h-full"
          />

          {/* Quick Play Sample Button Overlay */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSamplePlayerStory(story);
            }}
            title="Play Sample Audio"
            className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-amber-400 border border-amber-400/40 text-[10px] font-bold flex items-center gap-1 shadow-lg cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{lang === 'hi' ? 'प्ले' : 'Play'}</span>
          </button>
        </div>

        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
          <div onClick={() => setDetailStory(story)} className="cursor-pointer">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
              {lang === 'hi' ? story.titleHi : story.titleEn}
            </h3>

            {isPurchased ? (
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{lang === 'hi' ? 'खरीदा गया' : 'Purchased'}</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 mt-1 tabular-nums flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  ₹{story.price}
                </span>
                <span className="text-[11px] text-zinc-500 line-through">
                  ₹{story.originalPrice}
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  {story.discountPercent}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Card Action Buttons: Play Sample vs Buy/Cart */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSamplePlayerStory(story)}
              className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
            >
              <Headphones className="w-3 h-3" />
              <span>{lang === 'hi' ? 'सैंपल सुनें' : 'Preview'}</span>
            </button>

            {isPurchased ? (
              <button
                type="button"
                onClick={() => handleDeliverToBot(story)}
                className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
              >
                <span>{lang === 'hi' ? 'एपिसोड्स' : 'Get Series'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenDirectPayment(story)}
                className="py-1.5 px-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-[11px] font-extrabold flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
              >
                <QrCode className="w-3 h-3 text-emerald-700" />
                <span>{lang === 'hi' ? 'खरीदें' : 'Pay'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col">
      {/* Welcome Splash Screen */}
      {showSplash && (
        <SplashScreen
          lang={lang}
          config={loadingConfig}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-2xl border border-emerald-400/40 whitespace-nowrap animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* TOP BAR CONTRACT: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap"
          >
            All Story FM
          </a>
          <span className="text-[10px] font-extrabold tracking-wider bg-amber-400 text-black px-1.5 py-0.5 rounded uppercase">
            VIP
          </span>
        </div>

        {/* Zone 2: Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'home' ? 'text-white underline underline-offset-8' : ''
            }`}
          >
            {lang === 'hi' ? 'स्टोरफ्रंट' : 'Storefront'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'categories' ? 'text-white underline underline-offset-8' : ''
            }`}
          >
            {lang === 'hi' ? 'कैटेगरीज़' : 'Categories'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              activeTab === 'cart' ? 'text-white underline underline-offset-8' : ''
            }`}
          >
            {lang === 'hi' ? `आपका बैग (${cart.length})` : `Bag (${cart.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              activeTab === 'library' ? 'text-white underline underline-offset-8' : ''
            }`}
          >
            {lang === 'hi'
              ? `लाइब्रेरी (${purchasedStories.length})`
              : `Library (${purchasedStories.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'bot' ? 'text-white underline underline-offset-8' : ''
            }`}
          >
            {lang === 'hi' ? 'टेलीग्राम बॉट' : 'Telegram Bot'}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Admin Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin Panel Button */}
          <button
            type="button"
            onClick={() => setIsAdminPanelOpen(true)}
            title="Open Admin Panel (Password Protected)"
            className="px-3 py-2 text-xs font-bold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {lang === 'hi' ? 'एडमिन पैनल' : 'Admin Panel'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className="px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            @AllStoryFMBot
          </button>
        </div>
      </header>

      {/* Main Responsive Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 pb-24 lg:pb-12">
        {/* Sub-Toolbar: Big Cart Reward + Search + Language Switcher + Admin Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3.5 mb-5 rounded-2xl bg-[#121216] border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/50 shrink-0">
              <img
                src={stories[2]?.image || stories[0]?.image}
                alt="Big Cart Reward"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 group-hover:underline">
                All Story FM Offer · {lang === 'hi' ? '10% की छूट (₹150 तक)' : 'Get 10% off, up to ₹150'}
              </div>
              <div className="text-[11px] text-zinc-400">
                {lang === 'hi'
                  ? '₹1,500+ कार्ट वैल्यू पर मान्य — कूपन देखने के लिए टैप करें'
                  : 'Valid on ₹1,500+ cart value — Tap to view coupons'}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'home' && activeTab !== 'categories') {
                    setActiveTab('categories');
                  }
                }}
                placeholder={
                  lang === 'hi' ? 'कहानी या प्लेटफॉर्म खोजें...' : 'Search stories, Pocket FM...'
                }
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Language Toggle (अ/A) */}
            <button
              type="button"
              onClick={() => setLang((l) => (l === 'hi' ? 'en' : 'hi'))}
              title="Switch Language (Hindi / English)"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'hi' ? 'अ / EN' : 'EN / हिं'}
            </button>

            {/* Welcome Screen Preview Button */}
            <button
              type="button"
              onClick={() => setShowSplash(true)}
              title="Replay Welcome Screen"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {lang === 'hi' ? 'वेलकम स्क्रीन' : 'Intro'}
              </span>
            </button>
          </div>
        </div>

        {/* Main 12-Column Split on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Storefront / Categories / Cart / Library */}
          <div
            className={`${
              activeTab === 'bot' ? 'hidden lg:block lg:col-span-7' : 'lg:col-span-7'
            } space-y-7 min-w-0`}
          >
            {activeTab === 'cart' ? (
              <CartView
                items={cart}
                lang={lang}
                autoDelivery={autoDelivery}
                onToggleAutoDelivery={() => setAutoDelivery((v) => !v)}
                onToggleItemSelect={handleToggleItemSelect}
                onRemoveItem={handleRemoveFromCart}
                onMoveToWishlist={handleMoveToWishlist}
                onCheckout={handleCheckout}
                onExploreStories={() => setActiveTab('home')}
                onOpenCoupons={() => setIsCouponModalOpen(true)}
                appliedCoupon={appliedCoupon}
              />
            ) : activeTab === 'library' ? (
              <LibraryView
                purchasedStories={purchasedStories}
                wishlistedStories={wishlistedStories}
                lang={lang}
                onViewStoryDetails={(story) => setDetailStory(story)}
                onDeliverToTelegramBot={handleDeliverToBot}
                onAddToCart={(story) => handleAddToCart(story)}
                onRemoveWishlist={handleToggleWishlist}
              />
            ) : activeTab === 'categories' || searchQuery.trim() !== '' ? (
              /* Categories & Search Filter View */
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    {lang === 'hi' ? 'शैली के अनुसार कहानियाँ' : 'Browse by Category'}
                  </h2>
                  {searchQuery && (
                    <span className="text-xs text-zinc-400">
                      {filteredStories.length} results for "{searchQuery}"
                    </span>
                  )}
                </div>

                {/* Interactive Category Filter Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedCategory === cat.id
                          ? 'bg-white text-black'
                          : 'bg-[#141418] text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {lang === 'hi' ? cat.labelHi : cat.labelEn}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {filteredStories.map((story) => renderStandardCard(story))}
                </div>
              </div>
            ) : (
              /* HOME STOREFRONT (Pocket FM style layout with Play, Discounts, QR Pay) */
              <div className="space-y-7">
                {/* 1. AP पर लोकप्रिय (Top 3 Ranked Posters) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {lang === 'hi' ? 'ऑल स्टोरी एफएम पर लोकप्रिय' : 'Popular on All Story FM'}
                    </h2>
                    <span className="text-xs text-amber-400 font-semibold">
                      Pocket FM Originals
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {popularStories.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => setDetailStory(story)}
                        className="group cursor-pointer space-y-1.5"
                      >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800">
                          <StoryPoster
                            image={story.image}
                            posterTitle={story.posterTitle}
                            posterSubtitle={story.posterSubtitle}
                            filter={story.posterFilter}
                            accentGradient={story.accentGradient}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex items-end justify-between gap-1 px-0.5">
                          <span className="font-display text-3xl sm:text-4xl font-black leading-none rank-stroke select-none">
                            {story.popularRank}
                          </span>
                          <div className="text-right min-w-0">
                            <div className="text-[11px] font-semibold text-amber-400 truncate">
                              {lang === 'hi' ? story.genreHi : story.genreEn}
                            </div>
                            <div className="text-[11px] text-zinc-300 truncate">
                              {story.platform}
                            </div>
                            <div className="text-[10px] text-zinc-500 tabular-nums">
                              {story.totalEpisodes} Ep
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Red Coupon & Special Offers Banner */}
                <div
                  onClick={() => setIsCouponModalOpen(true)}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#8f1d1d] via-[#b91c1c] to-[#7f1d1d] border border-red-500/30 flex items-center justify-between gap-4 shadow-lg cursor-pointer hover:brightness-105 transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-extrabold text-white">
                      {lang === 'hi' ? 'कूपन और ऑफ़र' : 'Coupons & Special Offers'}
                    </div>
                    <div className="text-xs text-red-100/90 truncate">
                      {lang === 'hi'
                        ? 'कहानियों और भारी बचत का खजाना! · Tap to view coupons'
                        : 'Tap to view coupons & special discounts'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl bg-black/85 hover:bg-black text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {lang === 'hi' ? 'सभी देखें' : 'View All'}
                  </button>
                </div>

                {/* 3. अभी ट्रेंडिंग (Trending Now — with Quick Play Preview & Direct Buy) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {lang === 'hi' ? 'अभी ट्रेंडिंग (Trending Now)' : 'Trending Now'}
                    </h2>
                    <span className="text-xs text-emerald-400 font-bold">
                      90%+ Discount
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {trendingStories.map((story) => {
                      const currentRange =
                        trendingPackSelection[story.id] || `1-${story.totalEpisodes}`;
                      return (
                        <div
                          key={story.id}
                          className="flex flex-col bg-[#121215] rounded-2xl border border-zinc-800/90 overflow-hidden"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden">
                            <div
                              onClick={() => setDetailStory(story)}
                              className="w-full h-full cursor-pointer"
                            >
                              <StoryPoster
                                image={story.image}
                                posterTitle={story.posterTitle}
                                posterSubtitle={story.posterSubtitle}
                                filter={story.posterFilter}
                                accentGradient={story.accentGradient}
                                className="w-full h-full"
                              />
                            </div>

                            {/* Top-left Quick Add (+) button */}
                            <button
                              type="button"
                              onClick={() => handleAddToCart(story, currentRange)}
                              aria-label="Quick add to cart"
                              className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white border border-white/25 flex items-center justify-center shadow cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Play sample trigger */}
                            <button
                              type="button"
                              onClick={() => setSamplePlayerStory(story)}
                              className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 hover:bg-black text-amber-400 border border-amber-400/30 text-[9px] font-bold flex items-center gap-1 shadow cursor-pointer"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{lang === 'hi' ? 'प्ले' : 'Play'}</span>
                            </button>
                          </div>

                          <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <h3
                                onClick={() => setDetailStory(story)}
                                className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer"
                              >
                                {lang === 'hi' ? story.titleHi : story.titleEn}
                              </h3>
                              <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
                                <span className="text-xs sm:text-sm font-extrabold text-white">
                                  ₹{story.price}
                                </span>
                                <span className="text-[11px] text-zinc-500 line-through">
                                  ₹{story.originalPrice}
                                </span>
                              </div>
                            </div>

                            {/* Episode Dropdown + Cart/Buy Row */}
                            <div className="flex items-center gap-1.5">
                              <select
                                aria-label="Select episodes"
                                value={currentRange}
                                onChange={(e) =>
                                  setTrendingPackSelection((prev) => ({
                                    ...prev,
                                    [story.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1.5 text-[11px] font-medium text-zinc-200 focus:outline-none cursor-pointer truncate"
                              >
                                <option value={`1-${story.totalEpisodes}`}>
                                  {lang === 'hi' ? 'एपिसोड चुनें' : 'All Ep'}
                                </option>
                                {story.episodePacks.map((p) => (
                                  <option key={p.id} value={p.range}>
                                    Ep {p.range} (₹{p.price})
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleOpenDirectPayment(story)}
                                title="Pay with UPI QR"
                                className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black shrink-0 cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 4. LIVE FEED Scrolling Purchase Marquee */}
                <div className="flex items-center rounded-xl bg-[#121215] border border-zinc-800 overflow-hidden py-2 px-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-amber-400 text-black text-[10px] font-extrabold tracking-wider uppercase shrink-0 mr-3">
                    LIVE FEED
                  </span>
                  <div className="overflow-hidden flex-1">
                    <div className="animate-marquee flex items-center gap-8 text-xs font-medium text-amber-300/95 whitespace-nowrap">
                      {[...LIVE_FEED_EVENTS, ...LIVE_FEED_EVENTS].map((ev, i) => (
                        <span key={i} className="inline-flex items-center gap-2">
                          <span className="font-bold text-white">{ev.user}</span>
                          <span>{lang === 'hi' ? ev.actionHi : ev.actionEn}</span>
                          <span className="text-zinc-600">•</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. नई लिस्टिंग (New Listings) */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {lang === 'hi' ? 'नई लिस्टिंग' : 'New Listings'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{lang === 'hi' ? 'सभी' : 'All'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {newListings.map((story) => renderStandardCard(story))}
                  </div>
                </section>

                {/* 6. Partner Banner */}
                <div className="rounded-2xl bg-[#f5f5f4] text-zinc-900 p-3.5 flex items-center justify-between gap-2 shadow">
                  <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold whitespace-nowrap">
                    {lang === 'hi' ? 'द्वारा संचालित' : 'Powered By'}
                  </span>
                  <div className="flex items-center gap-3 font-display text-xs sm:text-sm font-extrabold tracking-wider uppercase text-zinc-900">
                    <span>ALL STORY FM</span>
                    <span className="text-zinc-400">|</span>
                    <span>BOT AUTOMATION</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold whitespace-nowrap">
                    {lang === 'hi' ? 'अटूट पार्टनर्स' : 'Official Platform'}
                  </span>
                </div>

                {/* 7. पॉकेट फ्रेंडली कीमत (Pocket Friendly Price 2x3 Grid) */}
                <section className="space-y-4 pt-1">
                  <div className="text-center">
                    <div className="inline-block px-6 py-1.5 rounded-xl bg-gradient-to-b from-amber-200 to-amber-400 text-black font-extrabold text-sm sm:text-base shadow">
                      {lang === 'hi' ? 'पॉकेट फ्रेंडली कीमत' : 'Pocket Friendly Price'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {pocketFriendlyStories.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => setDetailStory(story)}
                        className="group rounded-2xl overflow-hidden bg-[#141418] border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <StoryPoster
                            image={story.image}
                            posterTitle={story.posterTitle}
                            filter={story.posterFilter}
                            accentGradient={story.accentGradient}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="bg-zinc-100 text-zinc-900 text-[10px] font-bold text-center py-1">
                          {lang === 'hi' ? 'न्यूनतम 28% छूट' : 'Min 28% OFF'}
                        </div>
                        <div className="bg-red-600 text-white text-xs font-extrabold text-center py-1.5 tabular-nums">
                          {lang === 'hi'
                            ? `₹${story.pocketFriendlyMax} के अंदर`
                            : `Under ₹${story.pocketFriendlyMax}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 8. मस्ट-हैव्स: STORIES WE ❤️ LOVE */}
                <section className="space-y-3 pt-2">
                  <div className="text-center space-y-0.5">
                    <div className="text-xs font-semibold text-zinc-400">
                      {lang === 'hi' ? 'मस्ट-हैव्स' : 'Must-Haves'}
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-wide text-white uppercase">
                      STORIES WE <span className="text-red-500">♥</span> LOVE
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {mustHaveStories.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => setDetailStory(story)}
                        className="group cursor-pointer space-y-1.5"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                          <StoryPoster
                            image={story.image}
                            posterTitle={story.posterTitle}
                            posterSubtitle={story.posterSubtitle}
                            platform={story.platform}
                            filter={story.posterFilter}
                            accentGradient={story.accentGradient}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="text-center text-xs font-semibold text-zinc-300">
                          {lang === 'hi' ? story.genreHi : story.genreEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 9. Genre Sections */}
                {genreSections.map((sec) => {
                  const sectionStories = stories
                    .filter((s) => s.categoryKey === sec.key)
                    .slice(0, 3);
                  if (sectionStories.length === 0) return null;

                  return (
                    <section key={sec.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-white">
                          {lang === 'hi' ? sec.titleHi : sec.titleEn}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(sec.key);
                            setActiveTab('categories');
                          }}
                          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{lang === 'hi' ? 'सभी देखें' : 'See All'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {sectionStories.map((story) => renderStandardCard(story))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Interactive Telegram Bot Simulator */}
          <div
            className={`${
              activeTab === 'bot' ? 'block' : 'hidden lg:block'
            } lg:col-span-5 lg:sticky lg:top-20 h-[78vh] min-h-[580px]`}
          >
            <TelegramBotSimulator
              activeStory={activeBotStory}
              purchasedStories={purchasedStories}
              onSelectStoryForDelivery={(story) => {
                setBotActiveStoryId(story.id);
                setBotDeliveryTrigger((c) => c + 1);
              }}
              onOpenMiniApp={() => setActiveTab('home')}
              lang={lang}
              autoStartDeliveryCounter={botDeliveryTrigger}
            />
          </div>
        </div>
      </main>

      {/* Floating View Cart Pill + Guide Pill above Bottom Bar */}
      {activeTab !== 'cart' && activeTab !== 'bot' && (
        <div className="fixed bottom-16 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center relative">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-[#1c1c21]/95 hover:bg-zinc-800 border border-zinc-700 shadow-2xl backdrop-blur-md cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
                  <img
                    src={cart[cart.length - 1].story.image}
                    alt="Cart item"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left pr-1">
                  <div className="text-xs font-bold text-white leading-tight">
                    {lang === 'hi' ? 'कार्ट देखें' : 'View Cart'}
                  </div>
                  <div className="text-[10px] text-zinc-400 tabular-nums">
                    {cart.length} {lang === 'hi' ? 'आइटम' : 'Item(s)'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="pointer-events-auto absolute right-4 px-3.5 py-2 rounded-full bg-[#1c1c21]/95 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white shadow-xl cursor-pointer"
            >
              Guide
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0f]/95 backdrop-blur-md border-t border-zinc-800/90 lg:hidden">
        <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer ${
              activeTab === 'home' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">
              {lang === 'hi' ? 'होम' : 'Home'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer ${
              activeTab === 'categories' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">
              {lang === 'hi' ? 'कैटेगरीज़' : 'Categories'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`relative flex flex-col items-center justify-center py-1 cursor-pointer ${
              activeTab === 'cart' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-0.5 right-4 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                {cart.length}
              </span>
            )}
            <span className="text-[10px] font-medium mt-0.5">
              {lang === 'hi' ? 'कार्ट' : 'Cart'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer ${
              activeTab === 'library' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">
              {lang === 'hi' ? 'लाइब्रेरी' : 'Library'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer ${
              activeTab === 'bot' ? 'text-sky-400' : 'text-zinc-500'
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">
              {lang === 'hi' ? 'बॉट चैट' : 'Bot Chat'}
            </span>
          </button>
        </div>
      </nav>

      {/* Story Detail Modal */}
      <StoryDetailModal
        story={detailStory}
        onClose={() => setDetailStory(null)}
        lang={lang}
        isPurchased={detailStory ? purchasedIds.includes(detailStory.id) : false}
        isInCart={detailStory ? cart.some((c) => c.story.id === detailStory.id) : false}
        isWishlisted={detailStory ? wishlistIds.includes(detailStory.id) : false}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        onOpenBotDelivery={handleDeliverToBot}
        onOpenSamplePlayer={(s) => setSamplePlayerStory(s)}
        onOpenDirectPayment={(s, amount) => handleOpenDirectPayment(s, amount)}
      />

      {/* Free Sample Audio Player Modal */}
      <SamplePlayerModal
        story={samplePlayerStory}
        onClose={() => setSamplePlayerStory(null)}
        onBuyFullSeries={(s) => handleOpenDirectPayment(s)}
        lang={lang}
      />

      {/* UPI QR Payment & Screenshot Upload Modal */}
      <PaymentModal
        isOpen={paymentModalData !== null}
        story={paymentModalData?.story || null}
        amount={paymentModalData?.amount || 0}
        onClose={() => setPaymentModalData(null)}
        onSubmitPayment={handleSubmitPaymentOrder}
        lang={lang}
      />

      {/* Secret Password-Protected Admin Panel (Password: 8294991057) */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        stories={stories}
        onUpdateStories={(newStories) => setStories(newStories)}
        paymentOrders={paymentOrders}
        onApproveOrder={handleApproveOrder}
        onRejectOrder={handleRejectOrder}
        loadingConfig={loadingConfig}
        onUpdateLoadingConfig={(newConfig) => setLoadingConfig(newConfig)}
        lang={lang}
      />

      {/* Coupons Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(c) => {
          setAppliedCoupon(c);
          triggerToast(
            lang === 'hi'
              ? `कूपन ${c.code} लागू किया गया!`
              : `Coupon ${c.code} applied!`
          );
        }}
        lang={lang}
      />

      {/* How It Works Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#141418] border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  All Story FM Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
              <p>
                <strong>1. {lang === 'hi' ? 'सैंपल प्ले:' : 'Free Preview:'}</strong>{' '}
                {lang === 'hi'
                  ? 'पेमेंट करने से पहले किसी भी कहानी का "प्ले" बटन दबाकर एपिसोड 1, 2, 3 और क्लाइमेक्स टीज़र मुफ़्त में सुनें।'
                  : 'Tap "Play" on any story to listen to free sample episodes 1, 2, 3 and the climax teaser.'}
              </p>
              <p>
                <strong>2. {lang === 'hi' ? 'पेमेंट और स्क्रीनशॉट:' : 'Payment & Verification:'}</strong>{' '}
                {lang === 'hi'
                  ? 'QR कोड से भुगतान करें और UTR या स्क्रीनशॉट अपलोड करें। यह सीधे एडमिन के पास वेरिफिकेशन के लिए जाता है।'
                  : 'Pay via UPI QR and upload your transaction reference / screenshot for admin review.'}
              </p>
              <p>
                <strong>3. {lang === 'hi' ? 'एडमिन पैनल:' : 'Admin Panel:'}</strong>{' '}
                {lang === 'hi'
                  ? 'ऊपर "एडमिन पैनल" पर टैप करें। गुप्त पासवर्ड से लॉगिन करके पेमेंट वेरिफाई करें, कहानियों के कवर्स व विवरण बदलें।'
                  : 'Log into the Admin Panel with your secret password to verify payments and update story artwork.'}
              </p>
              <p>
                <strong>4. {lang === 'hi' ? 'ऑटोमेटेड बॉट डिलीवरी:' : 'Automated Bot Delivery:'}</strong>{' '}
                {lang === 'hi'
                  ? 'वेरिफिकेशन होते ही बॉट अपने आप सारे ऑडियो एपिसोड्स यूजर को स्ट्रीम कर देता है।'
                  : 'Once verified, the Telegram Bot immediately delivers all episodes in batch.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs cursor-pointer"
            >
              {lang === 'hi' ? 'समझ गया' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
