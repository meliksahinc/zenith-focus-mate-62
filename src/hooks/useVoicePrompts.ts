import { useCallback, useRef } from 'react';

interface VoicePromptsConfig {
  elevenlabsApiKey?: string;
  voiceId?: string;
}

export const useVoicePrompts = (config?: VoicePromptsConfig) => {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  const speakWithElevenLabs = useCallback(async (text: string) => {
    if (!config?.elevenlabsApiKey) {
      // Fallback to Web Speech API if no ElevenLabs key
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
      return;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + (config.voiceId || 'EXAVITQu4vr4xnSDxMaL'), {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      isPlayingRef.current = true;

      audio.onended = () => {
        isPlayingRef.current = false;
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Voice synthesis failed:', error);
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  }, [config?.elevenlabsApiKey, config?.voiceId]);

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    isPlayingRef.current = false;
  }, []);

  const isPlaying = () => isPlayingRef.current;

  return {
    speak: speakWithElevenLabs,
    stopSpeaking,
    isPlaying,
  };
};