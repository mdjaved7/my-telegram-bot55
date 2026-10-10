import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Upload,
  Image,
  Send,
  AlertCircle,
} from 'lucide-react';
import { StoryItem, PaymentOrder } from '../data/stories';
import { StoryPoster } from './StoryPoster';

interface PaymentModalProps {
  story: StoryItem | null;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayment: (order: PaymentOrder) => void;
  lang: 'hi' | 'en';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  story,
  amount,
  isOpen,
  onClose,
  onSubmitPayment,
  lang,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [userContact, setUserContact] = useState('');
  const [screenshotData, setScreenshotData] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !story) return null;

  const upiId = 'allstoryfm@upi';
  const upiPayLink = `upi://pay?pa=${upiId}&pn=AllStoryFM&am=${amount}&cu=INR&tn=Order_${story.id}`;
  // Default generated QR URL
  const defaultQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiPayLink
  )}&color=000000&bgcolor=ffffff`;

  // Story-specific QR code uploaded by admin, or dynamic fallback
  const activeQrCodeUrl = story.qrImage && story.qrImage.trim() !== '' ? story.qrImage : defaultQrCodeUrl;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotData(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseMockScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 400, 600);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(200, 120, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', 200, 128);
      ctx.fillText(`₹${amount}.00`, 200, 200);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Paid to All Story FM', 200, 230);
      ctx.fillText(story.titleEn, 200, 260);
      const utr = '4288' + Math.floor(10000000 + Math.random() * 90000000);
      ctx.fillText(`UTR: ${utrNumber || utr}`, 200, 310);
      ctx.font = '12px sans-serif';
      ctx.fillText('Payment Successful via UPI', 200, 350);
      setScreenshotData(canvas.toDataURL('image/png'));
      if (!utrNumber) {
        setUtrNumber(utr);
      }
      setErrorMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() && !screenshotData) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया पेमेंट का UTR नंबर या स्क्रीनशॉट दर्ज करें।'
          : 'Please enter the 12-digit UTR or upload payment screenshot.'
      );
      return;
    }

    setIsSubmitting(true);
    const newOrder: PaymentOrder = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      storyId: story.id,
      storyTitle: `${story.titleHi} (${story.titleEn})`,
      storyImage: story.image,
      amount,
      utr: utrNumber.trim() || 'UPI-REF-' + Math.floor(10000000 + Math.random() * 90000000),
      screenshotUrl:
        screenshotData ||
        'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600&auto=format&fit=crop&q=80',
      userContact: userContact.trim() || '+91 98765 00000 (@User)',
      status: 'pending',
      timestamp: 'Just now',
      adminNote: 'Submitted for verification by user',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitPayment(newOrder);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#121216] border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#16161c]">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === 'hi' ? 'UPI पेमेंट और स्क्रीनशॉट' : 'UPI Payment & Screenshot'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Order Summary Strip */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
            <div className="w-14 h-16 rounded-xl overflow-hidden shrink-0">
              <StoryPoster
                image={story.image}
                posterTitle={story.posterTitle}
                filter={story.posterFilter}
                accentGradient={story.accentGradient}
                compact
                className="w-full h-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-zinc-400">All Story FM Series</div>
              <div className="text-sm font-bold text-white truncate">
                {lang === 'hi' ? story.titleHi : story.titleEn}
              </div>
              <div className="text-xs text-amber-400 font-semibold mt-0.5">
                {story.totalEpisodes} {lang === 'hi' ? 'पूरे एपिसोड्स' : 'Full Episodes'}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-zinc-400">Payable Amount</div>
              <div className="text-lg font-black text-white tabular-nums">₹{amount}</div>
            </div>
          </div>

          {/* QR Code and UPI ID Box */}
          <div className="p-4 rounded-2xl bg-[#171720] border border-amber-500/30 flex flex-col items-center text-center space-y-3">
            <div className="text-xs font-semibold text-zinc-300">
              {lang === 'hi'
                ? 'GPay, PhonePe, Paytm या किसी भी UPI ऐप से स्कैन करके ₹' + amount + ' का भुगतान करें:'
                : 'Scan with any UPI app to pay ₹' + amount + ':'}
            </div>

            {/* QR Code Graphic with Story-specific or dynamic code */}
            <div className="relative p-3 bg-white rounded-2xl shadow-lg">
              <img
                src={activeQrCodeUrl}
                alt="UPI QR Code"
                className="w-44 h-44 object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-2 py-0.5 bg-black/90 text-amber-400 font-black text-[9px] rounded-md border border-amber-400/50 shadow">
                  All Story FM
                </div>
              </div>
            </div>

            {story.qrImage && (
              <div className="text-[11px] text-emerald-400 font-medium">
                ✓ {lang === 'hi' ? 'इस सीरीज़ का समर्पित क्यूआर कोड लोड किया गया' : 'Dedicated QR code loaded for this story'}
              </div>
            )}

            {/* UPI ID Copy Field */}
            <div className="w-full max-w-xs flex items-center justify-between p-2 rounded-xl bg-black/60 border border-zinc-700 text-xs">
              <span className="font-mono text-zinc-300 select-all">{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form: UTR / Reference Number & Screenshot Upload */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {lang === 'hi'
                  ? 'पेमेंट UTR / ट्रांसैक्शन रेफरेंस नंबर (12 अंक):'
                  : 'UPI UTR / Transaction Reference Number:'}
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="Ex: 428819239102"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {lang === 'hi'
                  ? 'आपका टेलीग्राम यूजरनेम या चैट आईडी (ऑटोमैटिक डिलीवरी के लिए):'
                  : 'Your Telegram Handle or Chat ID (for automated delivery):'}
              </label>
              <input
                type="text"
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
                placeholder="@username या +91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            {/* Screenshot Upload / Capture */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {lang === 'hi'
                  ? 'पेमेंट का स्क्रीनशॉट अपलोड करें:'
                  : 'Upload Payment Screenshot:'}
              </label>

              {screenshotData ? (
                <div className="relative p-2 rounded-xl bg-zinc-900 border border-emerald-500/50 flex items-center gap-3">
                  <img
                    src={screenshotData}
                    alt="Receipt Preview"
                    className="w-14 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'स्क्रीनशॉट चयनित' : 'Screenshot Ready'}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {lang === 'hi'
                        ? 'एडमिन वेरिफिकेशन के लिए तैयार'
                        : 'Ready for admin verification'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScreenshotData('')}
                    className="p-1.5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 text-xs font-medium text-zinc-300 cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'hi' ? 'गैलरी से चुनें' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleUseMockScreenshot}
                    className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    <Image className="w-4 h-4 text-sky-400" />
                    <span>{lang === 'hi' ? 'ऑटो रसीद बनाएं' : 'Sample Receipt'}</span>
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              <span className="font-semibold text-zinc-200">
                {lang === 'hi' ? '📌 प्रोसेस: ' : '📌 Process: '}
              </span>
              {lang === 'hi'
                ? 'स्क्रीनशॉट सबमिट करने के बाद रिक्वेस्ट सीधे एडमिन पैनल में जाएगी। एडमिन के वेरीफाई करते ही टेलीग्राम बॉट अपने आप आपको सारे एपिसोड भेज देगा।'
                : 'After submission, admin verifies payment in Admin Panel and the Telegram Bot automatically sends all episodes to your chat.'}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>{lang === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {lang === 'hi'
                      ? 'स्क्रीनशॉट सबमिट करें (एडमिन वेरिफिकेशन)'
                      : 'Submit Screenshot for Verification'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
