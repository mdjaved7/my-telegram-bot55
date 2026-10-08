// Telegram WebApp initialize
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// Hindi Text-to-Speech function
function speakWelcomeMessage() {
  if (!('speechSynthesis' in window)) {
    console.warn("Is browser me Speech Synthesis support nahi hai.");
    return;
  }

  // Pehle se chal rahe speech ko stop karein
  window.speechSynthesis.cancel();

  const messageText = "Welcome to ALL STORY FM par aapka swagat hai";
  const utterance = new SpeechSynthesisUtterance(messageText);

  // Language Hindi set karein
  utterance.lang = "hi-IN";
  utterance.rate = 0.95; // Thoda natural speed
  utterance.pitch = 1.0;

  // Available voices me se Hindi voice select karne ki koshish karein
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang.includes("hi") || v.lang.includes("HI"));
  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Page load hone par voices load karein
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Button click par audio bolna start hoga
const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  speakWelcomeMessage();
  startBtn.innerText = "EXPLORING...";
});

// Screen open hote hi auto-play ki koshish (kuch browsers allow karte hain)
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    speakWelcomeMessage();
  }, 600);
});
