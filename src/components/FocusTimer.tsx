import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useVoicePrompts } from "@/hooks/useVoicePrompts";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface FocusTimerProps {
  isActive: boolean;
  userName: string;
  onTimeUpdate: (timeLeft: number, totalTime: number) => void;
  onComplete: () => void;
  onVoicePrompt: (message: string) => void;
  onBreakStart?: () => void;
  onBreakComplete?: () => void;
}

type TimerMode = "focus" | "break";

export const FocusTimer = ({
  isActive,
  userName,
  onTimeUpdate,
  onComplete,
  onVoicePrompt,
  onBreakStart,
  onBreakComplete,
}: FocusTimerProps) => {
  const [focusDuration] = useLocalStorage("focusCoach_focusDuration", 25);
  const [breakDuration] = useLocalStorage("focusCoach_breakDuration", 5);
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [totalTime, setTotalTime] = useState(focusDuration * 60);
  const [hasSpokenHalfway, setHasSpokenHalfway] = useState(false);
  const [hasSpokenFiveMin, setHasSpokenFiveMin] = useState(false);
  const [hasSpokenBreakStart, setHasSpokenBreakStart] = useState(false);

  const { speak } = useVoicePrompts();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const speakMessage = useCallback(
    (message: string) => {
      speak(message);
      onVoicePrompt(message);
    },
    [speak, onVoicePrompt]
  );

  const startBreak = useCallback(() => {
    setTimerMode("break");
    setTimeLeft(breakDuration * 60);
    setTotalTime(breakDuration * 60);
    setHasSpokenBreakStart(false);
    speakMessage(
      `Great job, ${userName}! Time for a ${breakDuration}-minute break.`
    );
    onBreakStart?.();
  }, [breakDuration, userName, speakMessage, onBreakStart]);

  const startFocus = useCallback(() => {
    setTimerMode("focus");
    setTimeLeft(focusDuration * 60);
    setTotalTime(focusDuration * 60);
    setHasSpokenHalfway(false);
    setHasSpokenFiveMin(false);
    speakMessage(`Break is over, ${userName}. Let's get back to work!`);
    onBreakComplete?.();
  }, [focusDuration, userName, speakMessage, onBreakComplete]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(focusDuration * 60);
      setTotalTime(focusDuration * 60);
      setTimerMode("focus");
      setHasSpokenHalfway(false);
      setHasSpokenFiveMin(false);
      setHasSpokenBreakStart(false);
      return;
    }

    // Start message with user's name
    if (timerMode === "focus") {
      speakMessage(
        `Focus session started. Don't touch your phone, ${userName}.`
      );
    }

    const timer = setInterval(() => {
      // Timer runs continuously - never pauses for distractions
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;

        if (timerMode === "focus") {
          // Voice prompts at specific intervals with user's name
          if (newTime === Math.floor(totalTime / 2) && !hasSpokenHalfway) {
            speakMessage(`You're halfway there, ${userName}. Keep going!`);
            setHasSpokenHalfway(true);
          }

          if (newTime === 5 * 60 && !hasSpokenFiveMin) {
            speakMessage(`Only 5 minutes left, stay strong, ${userName}!`);
            setHasSpokenFiveMin(true);
          }

          if (newTime <= 0) {
            startBreak();
            return 0;
          }
        } else if (timerMode === "break") {
          if (newTime === Math.floor(totalTime / 2) && !hasSpokenBreakStart) {
            speakMessage(`Halfway through your break, ${userName}.`);
            setHasSpokenBreakStart(true);
          }

          if (newTime <= 0) {
            startFocus();
            return 0;
          }
        }

        onTimeUpdate(newTime, totalTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isActive,
    userName,
    speakMessage,
    hasSpokenHalfway,
    hasSpokenFiveMin,
    hasSpokenBreakStart,
    onTimeUpdate,
    timerMode,
    totalTime,
    startBreak,
    startFocus,
    onBreakStart,
    onBreakComplete,
  ]);

  if (!isActive) return null;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const isBreak = timerMode === "break";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 sm:top-6 z-40 px-4 sm:px-0"
    >
      <div
        className={`backdrop-blur-lg border border-glass-border rounded-xl p-4 sm:p-6 min-w-[180px] sm:min-w-[200px] text-center shadow-2xl ${
          isBreak ? "bg-orange-500/20" : "bg-glass-bg"
        }`}
      >
        <div className="mb-3 sm:mb-4">
          <h3 className="text-foreground text-xs sm:text-sm font-medium mb-2">
            {isBreak ? "Break Time" : "Focus Session"}
          </h3>
          <div
            className={`text-2xl sm:text-3xl font-bold mb-2 ${
              isBreak ? "text-orange-400" : "text-coach-blue"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mb-2">
          <motion.div
            className={`h-1.5 sm:h-2 rounded-full ${
              isBreak
                ? "bg-gradient-to-r from-orange-400 to-orange-600"
                : "bg-gradient-to-r from-coach-blue to-coach-green"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </p>

        {/* Mode indicator */}
        <div className="mt-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isBreak
                ? "bg-orange-500/20 text-orange-300"
                : "bg-coach-blue/20 text-coach-blue"
            }`}
          >
            {isBreak ? "☕ Break" : "🎯 Focus"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
