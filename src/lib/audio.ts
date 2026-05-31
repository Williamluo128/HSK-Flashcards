let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

export function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickChineseVoice(): SpeechSynthesisVoice | undefined {
  if (cachedVoices.length === 0) refreshVoices();
  return (
    cachedVoices.find((v) => /zh[-_]CN/i.test(v.lang)) ??
    cachedVoices.find((v) => /^zh/i.test(v.lang)) ??
    cachedVoices.find((v) => /chinese|mandarin|普通话|中文/i.test(v.name))
  );
}

/** Returns true if there is any Chinese voice available. */
export function hasChineseVoice(): boolean {
  return !!pickChineseVoice();
}

/**
 * Speak Chinese text using the Web Speech API.
 * Returns false if speech synthesis is unavailable.
 */
export function speak(text: string): boolean {
  if (!hasSpeech() || !text) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  const voice = pickChineseVoice();
  if (voice) utt.voice = voice;
  utt.lang = voice?.lang ?? "zh-CN";
  utt.rate = 0.85;
  utt.pitch = 1;
  synth.speak(utt);
  return true;
}
