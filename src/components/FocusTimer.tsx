import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useVoicePrompts } from '@/hooks/useVoicePrompts';

interface FocusTimerProps {
  isActive: boolean;
  isPaused: boolean;
  userName: string;
  onTimeUpdate: (timeLeft: number, totalTime: number) => void;
  onComplete: () => void;
  onVoicePrompt: (message: string) => void;
  elevenlabsApiKey?: string;
}

export const FocusTimer = ({ 
  isActive, 
  isPaused, 
  userName, 
  onTimeUpdate, 
  onComplete, 
  onVoicePrompt,
  elevenlabsApiKey 
}: FocusTimerProps) => {
  const TOTAL_TIME = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [hasSpokenHalfway, setHasSpokenHalfway] = useState(false);
  const [hasSpokenFiveMin, setHasSpokenFiveMin] = useState(false);
  
  const { speak } = useVoicePrompts({ 
    elevenlabsApiKey,
    voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakMessage = useCallback((message: string) => {
    speak(message);
    onVoicePrompt(message);
  }, [speak, onVoicePrompt]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(TOTAL_TIME);
      setHasSpokenHalfway(false);
      setHasSpokenFiveMin(false);
      return;
    }

    // Start message with user's name
    speakMessage(`Focus session started. Don't touch your phone, ${userName}.`);

    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          // Voice prompts at specific intervals with user's name
          if (newTime === Math.floor(TOTAL_TIME / 2) && !hasSpokenHalfway) {
            speakMessage(`You're halfway there, ${userName}. Keep going!`);
            setHasSpokenHalfway(true);
          }
          
          if (newTime === 5 * 60 && !hasSpokenFiveMin) {
            speakMessage(`Only 5 minutes left, stay strong, ${userName}!`);
            setHasSpokenFiveMin(true);
          }
          
          if (newTime <= 0) {
            speakMessage(`Great job, ${userName}! Time for a break.`);
            onComplete();
            return 0;
          }
          
          onTimeUpdate(newTime, TOTAL_TIME);
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, userName, speakMessage, hasSpokenHalfway, hasSpokenFiveMin, onTimeUpdate, onComplete]);

  if (!isActive) return null;

  const progress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-6 min-w-[200px] text-center shadow-2xl">
        <div className="mb-4">
          <h3 className="text-foreground text-sm font-medium mb-2">Focus Session</h3>
          <div className="text-3xl font-bold text-coach-blue mb-2">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <motion.div
            className="bg-gradient-to-r from-coach-blue to-coach-green h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>
    </motion.div>
  );
};