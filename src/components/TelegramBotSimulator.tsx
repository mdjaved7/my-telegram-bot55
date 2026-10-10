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

// === यहाँ अपनी Telegram Bot डिटेल्स डालें ===
const TELEGRAM_BOT_TOKEN = '8728549558:AAHTxCvjVMDihe-noxI0h-8TfnHQL1qWzI0';
const TELEGRAM_CHAT_ID = '6598432032';

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

  // === असली Telegram API पर डेटा भेजने का फंक्शन ===
  const sendToRealTelegram = async (file: DeliveredEpisodeFile) => {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') return; // अगर टोकन नहीं है तो स्किप करें
    
    const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🎧 नई फाइल: ${file.title}\n👤 लेखक: ${file.author}\n⏱ अवधि: ${file.duration}\n💾 साइज़: ${file.sizeMb}`
        })
      });
    } catch (error) {
      console.error('Telegram API Error:', error);
    }
  };

  useEffect(() => {
    const baseEp = activeStory.id === 'super-siddharth' ? 470 : 401;
    const initial: DeliveredEpisodeFile[] = Array.from({ length: 8 }).map((_, i) =>
      buildEpisodeFile(activeStory, baseEp + i, i)
    );
    setDeliveredFiles(initial);
    setDeliveredCount(8);
    setTotalInBatch(31);
  }, [activeStory]);

  const startBatchDelivery = (batchLabel: string, startEp: number, count: number) => {
    setSelectedBatch(batchLabel);
    setIsDelivering(true);
    setTotalInBatch(count);
    setDeliveredCount(0);
    setDeliveredFiles([]);
  };

  useEffect(() => {
    if (autoStartDeliveryCounter > 0) {
      const startEp = activeStory.id === 'super-siddharth' ? 470 : 401;
      startBatchDelivery('401 - 431', startEp, 31);
    }
  }, [autoStartDeliveryCounter, activeStory]);

  // Stream episode files one by one and send to Real Telegram Bot
  useEffect(() => {
    if (!isDelivering) return;

    const timer = window.setInterval(() => {
      setDeliveredCount((prev) => {
        const next = prev + 1;
        const baseEp = activeStory.id === 'super-siddharth' ? 470 : 401;
        const newFile = buildEpisodeFile(activeStory, baseEp + prev, prev);
        
        // फाइल जनरेट होते ही Telegram API को कॉल करें
        sendToRealTelegram(newFile);

        setDeliveredFiles((curr) => [...curr, newFile]);

        if (next >= Math.min(totalInBatch, 14)) {
          setIsDelivering(false);
        }
        return next;
      });
    }, 850);

    return () => clearInterval(timer);
  }, [isDelivering, activeStory, totalInBatch]);

  // (बाकी का आपका पूरा UI कोड वैसा ही रहेगा जैसा आपने भेजा था)
  // ... नीचे का सारा JSX कोड पहले जैसा ही काम करेगा ...

  
