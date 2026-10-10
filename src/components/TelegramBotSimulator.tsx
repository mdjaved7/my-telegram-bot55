import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Send,
  Play,
  Pause,
  Share2,
  ExternalLink,
  FolderDown,
  StopCircle,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { StoryItem } from '../data/stories';
import { StoryPoster } from './StoryPoster';
import { audioEngine } from '../utils/audioPlayer';

export interface DeliveredEpisodeFile {
  id: string;
  epNumber: number;
  title: string;
  author: string;
  duration: string;
  sizeMb: string;
  storyId: string;
}

interface TelegramBotSimulatorProps {
  activeStory: StoryItem;
  purchasedStories: StoryItem[];
  onSelectStoryForDelivery: (story: StoryItem) => void;
  onOpenMiniApp: () => void;
  lang: 'hi' | 'en';
  autoStartDeliveryCounter: number;
}

export const TelegramBotSimulator: React.FC<TelegramBotSimulatorProps> = ({
  activeStory,
  purchasedStories,
  onSelectStoryForDelivery,
  onOpenMiniApp,
  lang,
  autoStartDeliveryCounter,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>('401 - 431');
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveredCount, setDeliveredCount] = useState(8);
  const [totalInBatch, setTotalInBatch] = useState(31);
  const [deliveredFiles, setDeliveredFiles] = useState<DeliveredEpisodeFile[]>([]);
  const [playingFileId, setPlayingFileId] = useState<string | null>(null);
  const [playElapsedSec, setPlayElapsedSec] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [translatedToEn, setTranslatedToEn] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const effectiveLang = translatedToEn ? 'en' : lang;

  // Build initial or active story batch files
  const buildEpisodeFile = (story: StoryItem, epNum: number, idx: number): DeliveredEpisodeFile => {
    const mins = 9 + (epNum % 3);
    const secs = (epNum * 17) % 60;
    const durStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const sizeStr = `${(9.2 + ((epNum * 3) % 18) / 10).toFixed(1)} MB`;
    return {
      id: `${story.id}-ep-${epNum}-${idx}`,
      epNumber: epNum,
      title: `${epNum} - ${story.titleEn} By JeetX`,
      author: `Ep / By ${story.authorHandle || '@MrJeetX'}`,
      duration: durStr,
      sizeMb: sizeStr,
      storyId: story.id,
    };
  };

  // Trigger live streaming delivery when user clicks a batch button or arrives from "Get Story Episodes"
  const startBatchDelivery = (batchLabel: string, startEp: number, count: number) => {
    setSelectedBatch(batchLabel);
    setIsDelivering(true);
    setTotalInBatch(count);
    setDeliveredCount(0);
    setDeliveredFiles([]);
  };

  // Seed default episodes on first mount or when active story changes
  useEffect(() => {
    const baseEp = activeStory.id === 'super-siddharth' ? 470 : 401;
    const initial: DeliveredEpisodeFile[] = Array.from({ length: 8 }).map((_, i) =>
      buildEpisodeFile(activeStory, baseEp + i, i)
    );
    setDeliveredFiles(initial);
    setDeliveredCount(8);
    setTotalInBatch(31);
  }, [activeStory]);

  // Handle external delivery triggers (e.g. from Order Approval or Library)
  useEffect(() => {
    if (autoStartDeliveryCounter > 0) {
      const startEp = activeStory.id === 'super-siddharth' ? 470 : 401;
      startBatchDelivery('401 - 431', startEp, 31);
    }
  }, [autoStartDeliveryCounter, activeStory]);

  // Stream episode files one by one when isDelivering is true
  useEffect(() => {
    if (!isDelivering) return;

    const timer = window.setInterval(() => {
      setDeliveredCount((prev) => {
        const next = prev + 1;
        const baseEp = activeStory.id === 'super-siddharth' ? 470 : 401;
        const newFile = buildEpisodeFile(activeStory, baseEp + prev, prev);
        setDeliveredFiles((curr) => [...curr, newFile]);

        if (next >= Math.min(totalInBatch, 14)) {
          setIsDelivering(false);
        }
        return next;
      });
    }, 850);

    return () => clearInterval(timer);
  }, [isDelivering, activeStory, totalInBatch]);

  // Auto-scroll chat as files stream in
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [deliveredFiles.length, isDelivering]);

  // Handle audio playback timer
  useEffect(() => {
    if (!playingFileId) {
      audioEngine.stop();
      setPlayElapsedSec(0);
      return;
    }
    audioEngine.start(playingFileId.length, activeStory.audioUrl);
    const timer = window.setInterval(() => {
      setPlayElapsedSec((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [playingFileId, activeStory]);

  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  const togglePlayEpisode = (fileId: string) => {
    if (playingFileId === fileId) {
      setPlayingFileId(null);
    } else {
      setPlayElapsedSec(0);
      setPlayingFileId(fileId);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    if (text === '/start' || text.includes('401')) {
      const startEp = activeStory.id === 'super-siddharth' ? 470 : 401;
      startBatchDelivery('401 - 431', startEp, 31);
    } else {
      startBatchDelivery(text, 1, 25);
    }
  };

  const batches = [
    { label: '1 - 100', start: 1, count: 100 },
    { label: '101 - 200', start: 101, count: 100 },
    { label: '201 - 300', start: 201, count: 100 },
    { label: '301 - 400', start: 301, count: 100 },
    { label: '401 - 431', start: 470, count: 31 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0e1621] text-zinc-100 rounded-2xl border border-zinc-800/90 overflow-hidden shadow-2xl">
      {/* Telegram Bot Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#17212b] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMiniApp}
            title="Back to Storefront"
            className="p-1.5 rounded-full hover:bg-white/5 text-zinc-300 transition-colors cursor-pointer lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-400/40 shrink-0">
            <img
              src={activeStory.image}
              alt="All Story FM Bot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">All Story FM</div>
            <div className="text-[11px] text-sky-400 font-medium">bot · @AllStoryFMBot</div>
          </div>
        </div>

        {/* Purchased Story Switcher inside Bot Header */}
        <div className="flex items-center gap-2">
          <select
            aria-label="Select story for bot delivery"
            value={activeStory.id}
            onChange={(e) => {
              const found = purchasedStories.find((s) => s.id === e.target.value);
              if (found) {
                onSelectStoryForDelivery(found);
              }
            }}
            className="bg-[#242f3d] text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 border border-white/10 focus:outline-none cursor-pointer max-w-[155px] truncate"
          >
            {purchasedStories.map((s) => (
              <option key={s.id} value={s.id}>
                {effectiveLang === 'hi' ? s.titleHi : s.titleEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translate to English Bar */}
      <button
        type="button"
        onClick={() => setTranslatedToEn((v) => !v)}
        className="flex items-center justify-center gap-2 py-1.5 px-3 bg-[#17212b]/90 hover:bg-[#1e2c3a] border-b border-white/5 text-xs font-medium text-sky-400 transition-colors cursor-pointer shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          {translatedToEn
            ? 'Showing English Translation (Tap for Original Hindi)'
            : 'Translate to English'}
        </span>
      </button>

      {/* Scrollable Telegram Chat Feed */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#0e1621]"
      >
        {/* Date Pill */}
        <div className="flex justify-center">
          <span className="text-[11px] text-zinc-400 bg-[#182533]/90 px-3 py-0.5 rounded-full">
            October 10
          </span>
        </div>

        {/* Welcome Message Card from Bot */}
        <div className="max-w-[92%] bg-[#182533] rounded-2xl rounded-tl-sm overflow-hidden border border-white/5 shadow-md">
          <div className="relative h-36 w-full overflow-hidden">
            <StoryPoster
              image={activeStory.image}
              posterTitle="All Story FM"
              posterSubtitle="Stories that stay with you"
              className="w-full h-full"
            />
          </div>
          <div className="p-3.5 space-y-2 text-xs leading-relaxed text-zinc-200">
            <p className="font-semibold text-amber-300 text-sm">
              {effectiveLang === 'hi'
                ? 'ऑल स्टोरी एफएम (All Story FM) की दुनिया में आपका स्वागत है!'
                : 'Welcome to the world of All Story FM!'}
            </p>
            <p>
              {effectiveLang === 'hi'
                ? '1️⃣ Pocket FM, Kuku FM, Pratilipi FM और अन्य प्लेटफॉर्म्स से 300+ कहानियाँ हिंदी और अंग्रेजी में एक्सप्लोर करें।'
                : '1️⃣ Explore 300+ stories in Hindi and English from Pocket FM, Kuku FM, Pratilipi FM & more.'}
            </p>
            <p>
              {effectiveLang === 'hi'
                ? '2️⃣ अपनी पसंदीदा कहानियाँ सीधे UPI, Cards, NetBanking या Crypto से खरीदें।'
                : '2️⃣ Purchase your favorite series via UPI, Cards, NetBanking, or Crypto.'}
            </p>
            <p>
              {effectiveLang === 'hi'
                ? '3️⃣ शैली (Genre), प्लेटफ़ॉर्म या भाषा के अनुसार आसानी से कहानियाँ खोजें और तुरंत प्राप्त करें।'
                : '3️⃣ Browse by Genre, Platform, or Language and receive files instantly in chat.'}
            </p>
            <div className="text-right text-[10px] text-zinc-400">1:32 AM</div>
          </div>
        </div>

        {/* Inline Buttons under Welcome Message */}
        <div className="max-w-[92%] space-y-1.5">
          <button
            type="button"
            onClick={onOpenMiniApp}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>🛍️ {effectiveLang === 'hi' ? 'ऐप खोलें (Open App)' : 'Open Store Mini App'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const startEp = activeStory.id === 'super-siddharth' ? 470 : 401;
              startBatchDelivery('401 - 431', startEp, 31);
            }}
            className="w-full py-2 px-4 rounded-xl bg-[#202b36] hover:bg-[#283542] text-zinc-200 font-medium text-xs flex items-center justify-center gap-2 border border-white/5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>
              🛒{' '}
              {effectiveLang === 'hi'
                ? `सक्रिय सीरीज़: ${activeStory.titleHi} (${activeStory.totalEpisodes} Ep)`
                : `Active Series: ${activeStory.titleEn} (${activeStory.totalEpisodes} Ep)`}
            </span>
          </button>
        </div>

        {/* User /start command bubble */}
        <div className="flex justify-end">
          <div className="bg-[#2b5278] text-white px-3.5 py-1.5 rounded-2xl rounded-tr-sm text-xs flex items-center gap-2 shadow">
            <span>/start</span>
            <span className="text-[10px] text-sky-200/80 flex items-center gap-0.5">
              10:40 PM <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
            </span>
          </div>
        </div>

        {/* Bot File Batch Selection Prompt */}
        <div className="max-w-[92%] bg-[#182533] rounded-2xl rounded-tl-sm p-3.5 border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <FolderDown className="w-4 h-4 text-sky-400" />
            <span>{effectiveLang === 'hi' ? 'फ़ाइलें चुनें:' : 'Select Episode Files:'}</span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {effectiveLang === 'hi'
              ? `आप "${activeStory.titleHi}" के कौन से भाग प्राप्त करना चाहते हैं? नीचे दिए गए मेनू बटन का उपयोग करें।`
              : `Which episode batch of "${activeStory.titleEn}" would you like to receive? Use the menu buttons below.`}
          </p>
          <div className="text-right text-[10px] text-zinc-400">10:40 PM</div>
        </div>

        {/* User Selected Batch Message Bubble */}
        {selectedBatch && (
          <div className="flex justify-end">
            <div className="bg-[#2b5278] text-white px-3.5 py-1.5 rounded-2xl rounded-tr-sm text-xs flex items-center gap-2 shadow">
              <span className="tabular-nums font-medium">{selectedBatch}</span>
              <span className="text-[10px] text-sky-200/80 flex items-center gap-0.5">
                10:40 PM <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
              </span>
            </div>
          </div>
        )}

        {/* Bot DM Delivery Progress Card */}
        {selectedBatch && (
          <div className="max-w-[92%] bg-[#182533] rounded-2xl rounded-tl-sm p-3.5 border border-white/5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300">
                {isDelivering
                  ? effectiveLang === 'hi'
                    ? `फ़ाइलें भेजी जा रही हैं... (${deliveredCount}/${totalInBatch})`
                    : `Sending files... (${deliveredCount}/${totalInBatch})`
                  : effectiveLang === 'hi'
                  ? `फ़ाइलें डिलीवर हो गईं (${deliveredCount}/${totalInBatch})`
                  : `Files delivered (${deliveredCount}/${totalInBatch})`}
              </span>
              <span className="text-[10px] text-zinc-400 tabular-nums">edited 10:40 PM</span>
            </div>
            <p className="text-zinc-300">
              {effectiveLang === 'hi'
                ? 'कृपया प्रतीक्षा करें, आपकी ऑडियो फ़ाइलें सीधे चैट में डिलीवर हो रही हैं।'
                : 'Please wait while your audio episode files are delivered directly to your chat.'}
            </p>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, Math.round((deliveredCount / Math.max(1, totalInBatch)) * 100))}%`,
                }}
                className="h-full bg-sky-500 transition-all duration-300"
              />
            </div>

            {isDelivering ? (
              <button
                type="button"
                onClick={() => setIsDelivering(false)}
                className="w-full py-2 rounded-xl bg-[#243447] hover:bg-[#2c3f56] text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{effectiveLang === 'hi' ? 'डिलीवरी रोकें' : 'Stop Delivery'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const startEp = activeStory.id === 'super-siddharth' ? 470 : 401;
                  startBatchDelivery(selectedBatch, startEp, 31);
                }}
                className="w-full py-2 rounded-xl bg-[#243447] hover:bg-[#2c3f56] text-sky-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {effectiveLang === 'hi'
                    ? 'पुनः बैच स्ट्रीम करें (Replay Live Delivery)'
                    : 'Replay Live Batch Stream'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Streamed Audio Episode Bubbles */}
        <div className="space-y-2">
          {deliveredFiles.map((file) => {
            const isPlaying = playingFileId === file.id;
            return (
              <div key={file.id} className="flex items-center gap-2 max-w-[95%]">
                <div
                  onClick={() => togglePlayEpisode(file.id)}
                  className={`flex-1 flex items-center gap-3 p-2.5 rounded-2xl rounded-tl-sm border transition-colors cursor-pointer ${
                    isPlaying
                      ? 'bg-[#1f3247] border-sky-500/40'
                      : 'bg-[#182533] hover:bg-[#1c2b3b] border-white/5'
                  }`}
                >
                  {/* Circular Play Button with thumbnail ring */}
                  <button
                    type="button"
                    aria-label={isPlaying ? 'Pause episode' : 'Play episode'}
                    className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-sky-500 text-white shadow-md cursor-pointer"
                  >
                    <img
                      src={activeStory.image}
                      alt={file.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                    <div className="relative z-10 w-8 h-8 rounded-full bg-sky-500/90 flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Episode Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-[13px] font-semibold text-white truncate">
                      {file.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">{file.author}</div>
                    <div className="flex items-center justify-between mt-0.5 text-[10px] text-sky-300/90 tabular-nums">
                      <span>
                        {isPlaying
                          ? `${formatSeconds(playElapsedSec)} / ${file.duration}`
                          : `0:00 / ${file.duration}`}{' '}
                        · {file.sizeMb}
                      </span>
                      <span className="text-zinc-400">10:41 PM</span>
                    </div>
                  </div>
                </div>

                {/* Telegram Share Arrow Button */}
                <button
                  type="button"
                  onClick={() => togglePlayEpisode(file.id)}
                  title="Play / Forward Episode"
                  className="w-8 h-8 rounded-full bg-[#182533]/80 hover:bg-[#223346] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telegram Reply Keyboard Batch Selector */}
      <div className="bg-[#17212b] border-t border-white/10 p-2.5 space-y-2 shrink-0">
        {/* Message Input Bar */}
        <form onSubmit={handleSendCommand} className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMiniApp}
            className="px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <span>Open App</span>
          </button>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={
              effectiveLang === 'hi'
                ? 'कमांड लिखें (/start या 401-431)...'
                : 'Message @AllStoryFMBot (/start)...'
            }
            className="flex-1 bg-[#0e1621] text-xs text-white placeholder-zinc-500 px-3.5 py-2 rounded-full border border-white/5 focus:outline-none focus:border-sky-500/50"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Batch Reply Buttons Grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {batches.slice(0, 4).map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => startBatchDelivery(b.label, b.start, b.count)}
              className={`py-2 px-3 rounded-lg text-xs font-medium tabular-nums flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                selectedBatch === b.label
                  ? 'bg-sky-600/30 border border-sky-500/50 text-white'
                  : 'bg-[#232e3c] hover:bg-[#2b3849] text-zinc-200'
              }`}
            >
              <span>🗃️ {b.label}</span>
            </button>
          ))}
        </div>

        {/* Highlighted 401 - 431 row */}
        <button
          type="button"
          onClick={() =>
            startBatchDelivery(
              '401 - 431',
              activeStory.id === 'super-siddharth' ? 470 : 401,
              31
            )
          }
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold tabular-nums flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            selectedBatch === '401 - 431'
              ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200'
              : 'bg-[#232e3c] hover:bg-[#2b3849] text-zinc-100'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-bold">
            NEW
          </span>
          <span>401 - 431</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() =>
              startBatchDelivery(
                `1 - ${activeStory.totalEpisodes}`,
                1,
                activeStory.totalEpisodes
              )
            }
            className="py-2 px-2.5 rounded-lg bg-[#232e3c] hover:bg-[#2b3849] text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
          >
            <span>
              🗂️{' '}
              {effectiveLang === 'hi'
                ? 'सभी फ़ाइलें (Full Delivery)'
                : 'Full Delivery'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsDelivering(false)}
            className="py-2 px-2.5 rounded-lg bg-[#8c2d38] hover:bg-[#a33441] text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>« {effectiveLang === 'hi' ? 'रद्द करें' : 'Cancel'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
