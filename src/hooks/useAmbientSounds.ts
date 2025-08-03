import { useCallback, useRef, useState } from "react";

type AmbientSoundType = "white-noise" | "rain" | "forest" | "cafe" | "ocean";

interface AmbientSoundConfig {
  type: AmbientSoundType;
  volume: number;
  loop: boolean;
}

export const useAmbientSounds = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSoundType | null>(
    null
  );

  const soundUrls = {
    "white-noise": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Placeholder
    rain: "https://www.soundjay.com/misc/sounds/rain-01.wav", // Placeholder
    forest: "https://www.soundjay.com/misc/sounds/bird-1.wav", // Placeholder
    cafe: "https://www.soundjay.com/misc/sounds/coffee-1.wav", // Placeholder
    ocean: "https://www.soundjay.com/misc/sounds/ocean-1.wav", // Placeholder
  };

  const generateWhiteNoise = useCallback(() => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1;

    whiteNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return { whiteNoise, gainNode, audioContext };
  }, []);

  const playSound = useCallback(
    (config: AmbientSoundConfig) => {
      stopSound();

      if (config.type === "white-noise") {
        const { whiteNoise, gainNode } = generateWhiteNoise();
        gainNode.gain.value = config.volume;
        whiteNoise.start();

        audioRef.current = whiteNoise as any;
        setIsPlaying(true);
        setCurrentSound(config.type);
        return;
      }

      const audio = new Audio(soundUrls[config.type]);
      audio.volume = config.volume;
      audio.loop = config.loop;

      audio.onended = () => {
        if (!config.loop) {
          setIsPlaying(false);
          setCurrentSound(null);
        }
      };

      audio.onerror = () => {
        console.error("Failed to load ambient sound");
        setIsPlaying(false);
        setCurrentSound(null);
      };

      audio
        .play()
        .then(() => {
          audioRef.current = audio;
          setIsPlaying(true);
          setCurrentSound(config.type);
        })
        .catch((error) => {
          console.error("Failed to play ambient sound:", error);
        });
    },
    [generateWhiteNoise, soundUrls]
  );

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current instanceof HTMLAudioElement) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        // White noise buffer source
        try {
          audioRef.current.stop();
        } catch (error) {
          // Already stopped
        }
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSound(null);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      if (audioRef.current instanceof HTMLAudioElement) {
        audioRef.current.volume = volume;
      } else {
        // White noise gain node
        try {
          (audioRef.current as any).gainNode.gain.value = volume;
        } catch (error) {
          console.error("Failed to set volume:", error);
        }
      }
    }
  }, []);

  return {
    playSound,
    stopSound,
    setVolume,
    isPlaying,
    currentSound,
    availableSounds: Object.keys(soundUrls) as AmbientSoundType[],
  };
};
