/** Resolves with available voices, with a 1-second fallback timeout. */
function waitVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const timer = setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
    function handler() {
      clearTimeout(timer);
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(window.speechSynthesis.getVoices());
    }
    window.speechSynthesis.addEventListener("voiceschanged", handler);
  });
}

/** Returns a Japanese voice: exact ja-JP > ja* prefix > null. */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const exact = voices.find((v) => v.lang === "ja-JP");
  if (exact) return exact;
  const prefix = voices.find((v) => v.lang.startsWith("ja"));
  return prefix ?? null;
}

/** Returns true if the browser supports SpeechSynthesis. */
export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Prime the TTS engine on iOS Safari by speaking a silent utterance.
 * Must be called inside a user-gesture handler (e.g. pointerdown).
 */
export function primeTts(): void {
  if (!isTtsAvailable()) return;
  const utterance = new SpeechSynthesisUtterance("");
  utterance.volume = 0;
  window.speechSynthesis.speak(utterance);
}

/**
 * Speak the given text in Japanese.
 * Cancels any ongoing speech first to prevent queue build-up.
 * Returns true on success, false if TTS is unavailable.
 */
export async function speak(text: string, rate = 1.0): Promise<boolean> {
  if (!isTtsAvailable()) return false;

  window.speechSynthesis.cancel();

  const voices = await waitVoices();
  const voice = pickVoice(voices);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = rate;
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
  return true;
}
