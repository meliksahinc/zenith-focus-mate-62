import { useCallback, useRef, useState, useEffect } from "react";


interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export const useVoicePrompts = () => {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  // En iyi İngilizce sesleri bul
  const getBestEnglishVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Google") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Alex"))
    );

    // Öncelik sırası: Google > Samantha > Alex > İlk İngilizce ses
    const preferredVoice =
      englishVoices.find((voice) => voice.name.includes("Google")) ||
      englishVoices.find((voice) => voice.name.includes("Samantha")) ||
      englishVoices.find((voice) => voice.name.includes("Alex")) ||
      englishVoices[0];

    return (
      preferredVoice ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      voices[0]
    );
  }, []);

  // Sesleri yükle
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      setSelectedVoice(getBestEnglishVoice());
    };

    if ("speechSynthesis" in window) {
      // Sesler yüklendiğinde
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [getBestEnglishVoice]);

  const speakWithWebSpeech = useCallback(
    (text: string, settings?: Partial<VoiceSettings>) => {
      if (!("speechSynthesis" in window)) return;

      // Mevcut konuşmayı durdur
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Varsayılan ayarlar - daha insansı
      utterance.rate = settings?.rate ?? 0.85; // Biraz yavaş
      utterance.pitch = settings?.pitch ?? 1.05; // Hafif yüksek ton
      utterance.volume = settings?.volume ?? 0.9; // Yüksek ses
      utterance.voice =
        settings?.voice ?? selectedVoice ?? getBestEnglishVoice();

      // Daha doğal konuşma için ayarlar
      utterance.onstart = () => {
        isPlayingRef.current = true;
      };

      utterance.onend = () => {
        isPlayingRef.current = false;
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        isPlayingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, getBestEnglishVoice]
  );


  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    isPlayingRef.current = false;
  }, []);

  const isPlaying = () => isPlayingRef.current;

  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak: speakWithWebSpeech,
    speakWithWebSpeech,
    stopSpeaking,
    isPlaying,
    availableVoices,
    selectedVoice,
    changeVoice,
  };
};
