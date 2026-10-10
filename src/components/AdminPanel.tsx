　import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Image,
  Upload,
  Sliders,
  DollarSign,
  BookOpen,
  Send,
  ShieldAlert,
  Save,
  Check,
} from 'lucide-react';
import { StoryItem, PaymentOrder, LoadingScreenConfig } from '../data/stories';
import { StoryPoster } from './StoryPoster';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryItem[];
  onUpdateStories: (stories: StoryItem[]) => void;
  paymentOrders: PaymentOrder[];
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
  loadingConfig: LoadingScreenConfig;
  onUpdateLoadingConfig: (config: LoadingScreenConfig) => void;
  lang: 'hi' | 'en';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  stories,
  onUpdateStories,
  paymentOrders,
  onApproveOrder,
  onRejectOrder,
  loadingConfig,
  onUpdateLoadingConfig,
  lang,
}) => {
  // Password Authentication State (Secret password: 8294991057)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'payments' | 'stories' | 'loading'>('payments');

  // Story Edit/Create State
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [isNewStory, setIsNewStory] = useState(false);

  // Loading Screen Settings Form State
  const [tempLoadingConfig, setTempLoadingConfig] = useState<LoadingScreenConfig>(loadingConfig);
  const [loadingConfigSaved, setLoadingConfigSaved] = useState(false);

  // Screenshot viewer modal
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Verification against secret admin password (masked)
    if (passwordInput === '8294991057') {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError(
        lang === 'hi'
          ? 'गलत पासवर्ड! कृपया सही एडमिन पासवर्ड दर्ज करें।'
          : 'Invalid admin password! Access denied.'
      );
    }
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    if (isNewStory) {
      onUpdateStories([editingStory, ...stories]);
    } else {
      onUpdateStories(stories.map((s) => (s.id === editingStory.id ? editingStory : s)));
    }
    setEditingStory(null);
    setIsNewStory(false);
  };

  const handleDeleteStory = (storyId: string) => {
    if (confirm(lang === 'hi' ? 'क्या आप इस कहानी को हटाना चाहते हैं?' : 'Delete this story?')) {
      onUpdateStories(stories.filter((s) => s.id !== storyId));
    }
  };

  const handleCreateNewStory = () => {
    const newId = `story-${Date.now()}`;
    const newStoryTemplate: StoryItem = {
      id: newId,
      titleHi: 'नई ऑडियो सीरीज़',
      titleEn: 'New Audio Series',
      posterTitle: 'NEW AUDIO SERIES',
      posterSubtitle: 'ALL STORY FM',
      platform: 'Pocket FM',
      genreHi: 'फैंटेसी',
      genreEn: 'Fantasy',
      categoryKey: 'fantasy',
      totalEpisodes: 500,
      price: 149,
      originalPrice: 1499,
      discountPercent: 90,
      image: stories[0]?.image || '',
      accentGradient: 'from-amber-950 via-zinc-900 to-black',
      synopsisHi: 'यहाँ कहानी का विस्तृत विवरण (डिस्क्रिप्शन) लिखें...',
      synopsisEn: 'Write the story synopsis and plot details here...',
      authorHandle: '@AllStoryFM',
      episodePacks: [
        {
          id: 'all',
          labelHi: 'सभी एपिसोड (1 - 500)',
          labelEn: 'Full Series (1 - 500)',
          range: '1-500',
          price: 149,
          originalPrice: 1499,
        },
      ],
    };
    setEditingStory(newStoryTemplate);
    setIsNewStory(true);
  };

  // मल्टीपल फाइल्स (Cover, QR, Audio) अपलोड करने के लिए नया फंक्शन
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file && editingStory) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditingStory({ ...editingStory, [fieldName]: reader.result } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLoadingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLoadingConfig(tempLoadingConfig);
    setLoadingConfigSaved(true);
    setTimeout(() => setLoadingConfigSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121216] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#16161f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
              FM
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>All Story FM Admin Panel</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full font-mono">
                  v2.4
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {lang === 'hi'
                  ? 'पेमेंट वेरिफिकेशन, कहानियाँ अपलोड, कवर्स और लोडिंग स्क्रीन कंट्रोल'
                  : 'Payment Verifications, Story Management & Splash Settings'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Password Authentication Modal if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'hi' ? 'एडमिन पैनल पासवर्ड' : 'Admin Panel Authentication'}
            </h3>
            <p className="text-xs text-zinc-400">
              {lang === 'hi'
                ? 'सुरक्षित एडमिन एक्सेस के लिए कृपया 10-अंकों का गुप्त पासवर्ड दर्ज करें।'
                : 'Please enter the secret password to manage payments and story catalog.'}
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3 pt-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 pr-10 font-mono text-center tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'लॉगिन करें' : 'Unlock Admin Panel'}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-[#16161f]/50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('payments');
                  setEditingStory(null);
                }}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'payments'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>
                  {lang === 'hi' ? 'पेमेंट वेरिफिकेशन' : 'Payment Verifications'} (
                  {paymentOrders.filter((o) => o.status === 'pending').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('stories');
                  setEditingStory(null);
                }}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'stories'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {lang === 'hi' ? 'कहानियाँ और कवर्स (Stories)' : 'Story Management'} (
                  {stories.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('loading');
                  setEditingStory(null);
                }}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'loading'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>
                  {lang === 'hi' ? 'वेबसाइट लोडिंग स्क्रीन' : 'Loading Screen'}
                </span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: Payment Verification Queue */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {lang === 'hi'
                          ? 'उपयोगकर्ताओं के पेमेंट और स्क्रीनशॉट रिक्वेस्ट्स'
                          : 'Payment Verification Queue'}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {lang === 'hi'
                          ? 'जब आप वेरीफाई करेंगे, बॉट तुरंत यूजर को पूरी कहानी और सारे एपिसोड्स भेज देगा।'
                          : 'Approve to automatically authorize and trigger full episode delivery via Telegram Bot.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {paymentOrders.length === 0 ? (
                      <div className="py-12 text-center text-zinc-500 text-xs">
                        {lang === 'hi' ? 'कोई नया पेमेंट रिक्वेस्ट नहीं है।' : 'No payment requests found.'}
                      </div>
                    ) : (
                      paymentOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            order.status === 'pending'
                              ? 'bg-[#181824] border-amber-500/40'
                              : order.status === 'approved'
                              ? 'bg-emerald-950/20 border-emerald-600/30'
                              : 'bg-rose-950/20 border-rose-800/30'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              {/* Screenshot Thumbnail */}
                              <div
                                onClick={() => setViewScreenshotUrl(order.screenshotUrl)}
                                className="w-16 h-20 rounded-xl overflow-hidden bg-black border border-zinc-700 shrink-0 cursor-pointer relative group"
                              >
                                <img
                                  src={order.screenshotUrl}
                                  alt="Payment Screenshot"
                                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                  View
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-zinc-400">
                                    #{order.id}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      order.status === 'pending'
                                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                        : order.status === 'approved'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white">
                                  {order.storyTitle}
                                </h4>
                                <div className="text-xs text-zinc-300 tabular-nums">
                                  <span>Amount: </span>
                                  <span className="font-extrabold text-amber-400">
                                    ₹{order.amount}
                                  </span>
                                  <span className="text-zinc-500"> · </span>
                                  <span>UTR: </span>
                                  <span className="font-mono text-zinc-200">{order.utr}</span>
                                </div>
                                <div className="text-xs text-zinc-400">
                                  <span>User: </span>
                                  <span className="text-zinc-200">{order.userContact}</span>
                                  <span className="text-zinc-500"> · </span>
                                  <span>{order.timestamp}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {order.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onApproveOrder(order.id)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                      {lang === 'hi'
                                        ? 'वेरीफाई करें और एपिसोड भेजें'
                                        : 'Approve & Send Episodes'}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onRejectOrder(order.id)}
                                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-rose-900 text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>{lang === 'hi' ? 'अस्वीकार' : 'Reject'}</span>
                                  </button>
                                </>
                              ) : order.status === 'approved' ? (
                                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                                  <Check className="w-4 h-4" />
                                  <span>
                                    {lang === 'hi'
                                      ? 'वेरीफाइड! बॉट पर डिलीवर हो गया'
                                      : 'Verified & Delivered in Bot'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs font-semibold text-rose-400">
                                  {lang === 'hi' ? 'अस्वीकृत' : 'Rejected'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Story & Cover Management */}
              {activeTab === 'stories' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {lang === 'hi'
                          ? 'कहानियों का कैटलॉग और कवर मैनेजमेंट'
                          : 'Story Catalog & Cover Artwork'}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {lang === 'hi'
                          ? 'कवर इमेज अपलोड करें, विवरण (डिस्क्रिप्शन) लिखें, कुल एपिसोड और डिस्काउंट सेट करें।'
                          : 'Change covers without editing code, update synopsis, episode counts, and pricing.'}
                      </p>
                    </div>

                    {!editingStory && (
                      <button
                        type="button"
                        onClick={handleCreateNewStory}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'नई कहानी जोड़ें' : 'Add New Story'}</span>
                      </button>
                    )}
                  </div>

                  {/* Story Edit / Add Form */}
                  {editingStory ? (
                    <form
                      onSubmit={handleSaveStory}
                      className="p-5 rounded-2xl bg-[#181822] border border-amber-500/40 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <h4 className="text-sm font-bold text-white">
                          {isNewStory
                            ? lang === 'hi'
                              ? 'नई कहानी जोड़ें'
                              : 'Add New Story'
                            : lang === 'hi'
                            ? `कहानी संपादित करें: ${editingStory.titleHi}`
                            : `Edit Story: ${editingStory.titleEn}`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingStory(null)}
                          className="text-zinc-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            शीर्षक (हिंदी) / Title (Hindi):
                          </label>
                          <input
                            type="text"
                            value={editingStory.titleHi}
                            onChange={(e) =>
                              setEditingStory({ ...editingStory, titleHi: e.target.value })
                            }
                            required
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            Title (English):
                          </label>
                          <input
                            type="text"
                            value={editingStory.titleEn}
                            onChange={(e) =>
                              setEditingStory({ ...editingStory, titleEn: e.target.value })
                            }
                            required
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            प्लेटफ़ॉर्म (Platform):
                          </label>
                          <select
                            value={editingStory.platform}
                            onChange={(e) =>
                              setEditingStory({
                                ...editingStory,
                                platform: e.target.value as StoryItem['platform'],
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                          >
                            <option value="Pocket FM">Pocket FM</option>
                            <option value="Kuku FM">Kuku FM</option>
                            <option value="Pratilipi FM">Pratilipi FM</option>
                            <option value="Stories Light">Stories Light</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            शैली / Genre (Hindi):
                          </label>
                          <input
                            type="text"
                            value={editingStory.genreHi}
                            onChange={(e) =>
                              setEditingStory({ ...editingStory, genreHi: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            कुल एपिसोड्स (Total Episodes):
                          </label>
                          <input
                            type="number"
                            value={editingStory.totalEpisodes}
                            onChange={(e) =>
                              setEditingStory({
                                ...editingStory,
                                totalEpisodes: Number(e.target.value),
                              })
                            }
                            required
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white tabular-nums"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              ऑफ़र मूल्य (₹):
                            </label>
                            <input
                              type="number"
                              value={editingStory.price}
                              onChange={(e) =>
                                setEditingStory({
                                  ...editingStory,
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              मूल मूल्य (MRP):
                            </label>
                            <input
                              type="number"
                              value={editingStory.originalPrice}
                              onChange={(e) =>
                                setEditingStory({
                                  ...editingStory,
                                  originalPrice: Number(e.target.value),
                                })
                              }
                              className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                              छूट % (Off):
                            </label>
                            <input
                              type="number"
                              value={editingStory.discountPercent}
                              onChange={(e) =>
                                setEditingStory({
                                  ...editingStory,
                                  discountPercent: Number(e.target.value),
                                })
                              }
                              className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white tabular-nums"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cover Image Upload & URL */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          कवर इमेज (Cover Image Upload or URL):
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-20 rounded-xl overflow-hidden bg-black border border-zinc-700 shrink-0">
                            {editingStory.image ? (
                              <img
                                src={editingStory.image}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Image className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingStory.image}
                              onChange={(e) =>
                                setEditingStory({ ...editingStory, image: e.target.value })
                              }
                              placeholder="Image URL..."
                              className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                            />
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>डिवाइस से कवर इमेज अपलोड करें</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'image')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Upload & URL */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          QR कोड (QR Image Upload or URL):
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-20 rounded-xl overflow-hidden bg-black border border-zinc-700 shrink-0">
                            {(editingStory as any).qrImage ? (
                              <img
                                src={(editingStory as any).qrImage}
                                alt="QR preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Image className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={(editingStory as any).qrImage || ''}
                              onChange={(e) =>
                                setEditingStory({ ...editingStory, qrImage: e.target.value } as any)
                              }
                              placeholder="QR Image URL..."
                              className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                            />
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>QR कोड अपलोड करें</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'qrImage')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Audio File Upload & URL */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          ऑडियो फ़ाइल (Audio URL or Upload):
                        </label>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={(editingStory as any).audioUrl || ''}
                            onChange={(e) =>
                              setEditingStory({ ...editingStory, audioUrl: e.target.value } as any)
                            }
                            placeholder="Audio File URL..."
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>ऑडियो अपलोड करें</span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleFileUpload(e, 'audioUrl')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Description / Synopsis (Hindi & English) */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          कहानी का विवरण / डिस्क्रिप्शन (Hindi Synopsis):
                        </label>
                        <textarea
                          rows={2}
                          value={editingStory.synopsisHi}
                          onChange={(e) =>
                            setEditingStory({ ...editingStory, synopsisHi: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Story Synopsis (English):
                        </label>
                        <textarea
                          rows={2}
                          value={editingStory.synopsisEn}
                          onChange={(e) =>
                            setEditingStory({ ...editingStory, synopsisEn: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingStory(null)}
                          className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Story & Cover</span>
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* Stories Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stories.map((story) => (
                      <div
                        key={story.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#14141c] border border-zinc-800"
                      >
                        <div className="w-14 h-18 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={story.image}
                            alt={story.titleEn}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {story.titleHi}
                          </h4>
                          <div className="text-[11px] text-zinc-400">
                            {story.platform} · {story.totalEpisodes} Ep
                          </div>
                          <div className="text-xs font-bold text-amber-400 mt-1 tabular-nums">
                            ₹{story.price}{' '}
                            <span className="text-[10px] text-emerald-400">
                              ({story.discountPercent}% OFF)
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStory(story);
                              setIsNewStory(false);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                            title="Edit Story"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStory(story.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900 text-zinc-400 hover:text-rose-200"
                            title="Delete Story"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Website Loading Screen Settings */}
              {activeTab === 'loading' && (
                <div className="max-w-xl mx-auto space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {lang === 'hi'
                        ? 'वेबसाइट लोडिंग (Splash) स्क्रीन सेटिंग्स'
                        : 'Website Splash & Loading Screen Settings'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {lang === 'hi'
                        ? 'लोडिंग स्क्रीन को चालू/बंद करें, शीर्षक, उप-शीर्षक और सेकंड सेट करें।'
                        : 'Configure the welcome intro splash screen that appears when the app opens.'}
                    </p>
                  </div>

                  <form onSubmit={handleSaveLoadingConfig} className="space-y-4">
                    {/* Toggle Enabled */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {lang === 'hi' ? 'लोडिंग स्क्रीन सक्रिय करें' : 'Enable Loading Screen'}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {lang === 'hi'
                            ? 'ऐप खुलते ही 5-कार्ड रोटेटिंग वेलकम स्क्रीन दिखाएं'
                            : 'Show 5-card fanned carousel on app launch'}
                        </div>
                      </div>
                     <input
                        type="checkbox"
                        checked={tempLoadingConfig.enabled}
                        onChange={(e) =>
                          setTempLoadingConfig({
                            ...tempLoadingConfig,
                            enabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        मुख्य वेलकम हेडर (Title):
                      </label>
                      <input
                        type="text"
                        value={tempLoadingConfig.title}
                        onChange={(e) =>
                          setTempLoadingConfig({
                            ...tempLoadingConfig,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        उप-शीर्षक (Subtitle / Description):
                      </label>
                      <textarea
                        rows={3}
                        value={tempLoadingConfig.subtitle}
                        onChange={(e) =>
                          setTempLoadingConfig({
                            ...tempLoadingConfig,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        ऑटो-क्लोज़ अवधि (सेकंड):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={tempLoadingConfig.durationSec}
                        onChange={(e) =>
                          setTempLoadingConfig({
                            ...tempLoadingConfig,
                            durationSec: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white tabular-nums"
                      />
                    </div>

                    {loadingConfigSaved && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-xs text-emerald-300 text-center font-semibold">
                        {lang === 'hi'
                          ? 'लोडिंग स्क्रीन सेटिंग्स सफलतापूर्वक सेव हो गईं!'
                          : 'Splash screen settings saved successfully!'}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'सेटिंग्स सेव करें' : 'Save Splash Settings'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full-view screenshot preview modal */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-lg w-full bg-zinc-900 rounded-2xl overflow-hidden p-2">
            <button
              type="button"
              onClick={() => setViewScreenshotUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewScreenshotUrl}
              alt="Payment Screenshot Full View"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
