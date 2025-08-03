import { useState, useCallback, useRef, useEffect } from "react";
import { WebcamBackground } from "./WebcamBackground";
import { CoachBox } from "./CoachBox";
import { FocusTimer } from "./FocusTimer";
import { StartButton } from "./StartButton";
import { UserNameInput } from "./UserNameInput";
import { AttentionTracker } from "./AttentionTracker";
import { SettingsModal } from "./SettingsModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { useAmbientSounds } from "@/hooks/useAmbientSounds";
import { Settings } from "lucide-react";
import { useVoicePrompts } from "@/hooks/useVoicePrompts";

const COACH_MESSAGES = {
  welcome: (name: string) =>
    `Welcome back, ${name}! Ready to boost your productivity?`,
  starting: (name: string) =>
    `Focus session started. Don't touch your phone, ${name}.`,
  halfway: (name: string) => `You're halfway there, ${name}. Keep going!`,
  fiveMinutes: (name: string) => `Only 5 minutes left, stay strong, ${name}!`,
  complete: (name: string) => `Great job, ${name}! Time for a break.`,
  idle: (name: string) =>
    `Click 'Start Focus' when you're ready to begin your session, ${name}.`,
  distracted: (name: string) => `${name}, eyes on the prize! Stay focused.`,
  refocused: (name: string) => `Welcome back, ${name}! Let's keep going.`,
  paused: (name: string) => `Session paused, ${name}. Focus up to continue!`,
};

export const FocusCoach = () => {
  const [userName, setUserName] = useLocalStorage<string>(
    "focusCoach_userName",
    ""
  );
  const [notificationsEnabled] = useLocalStorage(
    "focusCoach_notifications",
    true
  );
  const [ambientSoundsEnabled] = useLocalStorage(
    "focusCoach_ambientSounds",
    false
  );
  const [focusDuration] = useLocalStorage("focusCoach_focusDuration", 25);
  const [breakDuration] = useLocalStorage("focusCoach_breakDuration", 5);

  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Debug isSessionActive changes
  useEffect(() => {
    console.log("🔄 isSessionActive changed to:", isSessionActive);
  }, [isSessionActive]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showCoach, setShowCoach] = useState(true);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStats, setSessionStats] = useLocalStorage("focusCoach_stats", {
    completedSessions: 0,
    totalFocusTime: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Hooks
  const {
    sendFocusStartNotification,
    sendFocusCompleteNotification,
    sendBreakStartNotification,
    sendBreakCompleteNotification,
    sendDistractionNotification,
    requestPermission,
  } = useNotifications();

  const { playSound, stopSound, currentSound } = useAmbientSounds();
  const { speak } = useVoicePrompts();

  // Request notification permission on first load
  useEffect(() => {
    if (notificationsEnabled) {
      requestPermission();
    }
  }, [notificationsEnabled, requestPermission]);

  const handleStartStop = useCallback(() => {
    console.log(
      "🎯 handleStartStop called - isSessionActive:",
      isSessionActive
    );
    if (isSessionActive) {
      // Stop session
      console.log("🛑 Stopping session");
      setIsSessionActive(false);
      setCurrentMessage(COACH_MESSAGES.welcome(userName));
      setShowCoach(true);
      setShowWelcomeScreen(true);

      // Stop ambient sounds
      stopSound();

      // Send notification
      if (notificationsEnabled) {
        sendFocusCompleteNotification(userName);
      }
    } else {
      // Start session
      console.log("▶️ Starting session - BEFORE setIsSessionActive(true)");
      setIsSessionActive(true);
      console.log("▶️ Starting session - AFTER setIsSessionActive(true)");
      setCurrentMessage(COACH_MESSAGES.starting(userName));
      setShowCoach(true);

      // Start ambient sounds if enabled
      if (ambientSoundsEnabled) {
        playSound({ type: "white-noise", volume: 0.3, loop: true });
      }

      // Send notification
      if (notificationsEnabled) {
        sendFocusStartNotification(userName);
      }

      // Hide coach message after 5 seconds to minimize distractions
      setTimeout(() => {
        setShowCoach(false);
      }, 5000);
    }
  }, [
    isSessionActive,
    userName,
    stopSound,
    playSound,
    ambientSoundsEnabled,
    notificationsEnabled,
    sendFocusStartNotification,
    sendFocusCompleteNotification,
  ]);

  const handleVoicePrompt = useCallback(
    (message: string) => {
      // Update coach message when voice prompts are triggered
      let coachMessage = "";

      if (message.includes("halfway")) {
        coachMessage = COACH_MESSAGES.halfway(userName);
      } else if (message.includes("5 minutes")) {
        coachMessage = COACH_MESSAGES.fiveMinutes(userName);
      } else if (message.includes("Great job")) {
        coachMessage = COACH_MESSAGES.complete(userName);
      } else if (message.includes("started")) {
        coachMessage = COACH_MESSAGES.starting(userName);
      } else if (message.includes("break")) {
        coachMessage = `Time for a ${breakDuration}-minute break, ${userName}!`;
      } else if (message.includes("Let's get back")) {
        coachMessage = `Break is over, ${userName}. Let's get back to work!`;
      } else if (
        message.includes("neredesin") ||
        message.includes("can't see you") ||
        message.includes("where did you go")
      ) {
        // Attention tracker messages - don't override these
        return;
      } else if (
        message.includes("Welcome back") ||
        message.includes("You're back") ||
        message.includes("focused again")
      ) {
        // Refocus messages - don't override these
        return;
      }

      if (coachMessage) {
        setCurrentMessage(coachMessage);
        setShowCoach(true);

        // Auto-hide after showing the message (except for completion)
        if (!message.includes("Great job") && !message.includes("break")) {
          setTimeout(() => {
            setShowCoach(false);
          }, 4000);
        }
      }
    },
    [userName, breakDuration]
  );

  const handleSessionComplete = useCallback(() => {
    setIsSessionActive(false);
    setCurrentMessage(COACH_MESSAGES.complete(userName));
    setShowCoach(true);

    // Stop ambient sounds
    stopSound();

    // Update session stats
    setSessionStats((prev) => ({
      completedSessions: prev.completedSessions + 1,
      totalFocusTime: prev.totalFocusTime + focusDuration,
    }));

    // Send notification
    if (notificationsEnabled) {
      sendFocusCompleteNotification(userName);
    }

    // Show completion message longer, then switch to idle
    setTimeout(() => {
      setCurrentMessage(COACH_MESSAGES.idle(userName));
    }, 8000);
  }, [
    userName,
    setSessionStats,
    focusDuration,
    stopSound,
    notificationsEnabled,
    sendFocusCompleteNotification,
  ]);

  const handleBreakStart = useCallback(() => {
    // Send break notification
    if (notificationsEnabled) {
      sendBreakStartNotification(userName, breakDuration);
    }
  }, [
    userName,
    breakDuration,
    notificationsEnabled,
    sendBreakStartNotification,
  ]);

  const handleBreakComplete = useCallback(() => {
    // Send break complete notification
    if (notificationsEnabled) {
      sendBreakCompleteNotification(userName);
    }
  }, [userName, notificationsEnabled, sendBreakCompleteNotification]);

  const handleTimeUpdate = useCallback(
    (timeLeft: number, totalTime: number) => {
      // Could add additional logic here for time-based UI updates
    },
    []
  );

  const handleDistraction = useCallback(
    (awayTime?: number) => {
      console.log(
        "🎯 handleDistraction called - isSessionActive:",
        isSessionActive,
        "awayTime:",
        awayTime
      );
      if (isSessionActive) {
        // Session continues running - never pauses for distractions
        // AttentionTracker handles the message generation and speaking
        
        // Send distraction notification
        if (notificationsEnabled) {
          sendDistractionNotification(userName);
        }
      } else {
        console.log(
          "❌ handleDistraction ignored - session not active or paused"
        );
      }
    },
    [
      isSessionActive,
      notificationsEnabled,
      sendDistractionNotification,
    ]
  );

  const handleRefocus = useCallback((awayTime?: number) => {
    console.log("🎯 handleRefocus called - isSessionActive:", isSessionActive);
    if (isSessionActive) {
      // AttentionTracker handles the message generation and speaking
      console.log("✅ User refocused - AttentionTracker handled the message");
    } else {
      console.log("❌ handleRefocus ignored - session not active");
    }
  }, [isSessionActive]);

  const handleNameSubmit = useCallback(
    (name: string) => {
      setUserName(name);
      setCurrentMessage(COACH_MESSAGES.welcome(name));
      setShowWelcomeScreen(true);
    },
    [setUserName]
  );

  // Initialize welcome message when user name is available
  useEffect(() => {
    if (userName && !currentMessage) {
      setCurrentMessage(COACH_MESSAGES.welcome(userName));
      setShowWelcomeScreen(true);
    }
  }, [userName, currentMessage]);

  // Show name input if no user name is stored
  if (!userName) {
    return <UserNameInput onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Webcam Background */}
      <WebcamBackground ref={videoRef} />

      {/* Attention Tracker */}
      <AttentionTracker
        videoElement={videoRef.current}
        onDistraction={handleDistraction}
        onRefocus={handleRefocus}
        isActive={isSessionActive}
        userName={userName}
      />

      {/* Dark overlay for better UI visibility */}
      <div className="fixed inset-0 bg-black/20 z-10" />

      {/* Settings Button */}
      {!isSessionActive && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-2 sm:p-3 shadow-2xl hover:shadow-coach-blue/20 transition-all duration-300"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-coach-blue transition-colors" />
        </button>
      )}

      {/* Ambient Sound Indicator */}
      {ambientSoundsEnabled && currentSound && (
        <div className="fixed top-16 left-4 sm:top-6 sm:left-6 z-50 bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-2 shadow-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground hidden sm:inline">Ambient Sound</span>
            <span className="text-xs text-muted-foreground sm:hidden">🎵</span>
          </div>
        </div>
      )}

      {/* Start/Stop Button */}
      <StartButton
        isActive={isSessionActive}
        onClick={handleStartStop}
        userName={userName}
      />

      {/* Timer (only visible during session) */}
      <FocusTimer
        isActive={isSessionActive}
        userName={userName}
        onTimeUpdate={handleTimeUpdate}
        onComplete={handleSessionComplete}
        onVoicePrompt={handleVoicePrompt}
        onBreakStart={handleBreakStart}
        onBreakComplete={handleBreakComplete}
      />

      {/* Coach Box */}
      <CoachBox
        message={currentMessage}
        isVisible={showCoach}
        userName={userName}
        sessionStats={sessionStats}
      />

      {/* Instructions overlay for timer selection */}
      {!isSessionActive && showWelcomeScreen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-6 sm:p-8 max-w-sm sm:max-w-md text-center shadow-2xl overflow-y-auto max-h-screen">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              🎯 Pomodoro.site
            </h1>
            <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Welcome back, {userName}! Your AI-powered focus companion is ready
              to help you stay on track with personalized voice guidance and
              attention tracking.
            </p>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground mb-4">
              <p>✓ Live webcam for accountability</p>
              <p>✓ Personalized voice prompts</p>
              <p>✓ Attention tracking with auto-pause</p>
              <p>✓ {focusDuration}-minute focus sessions</p>
              <p>✓ {breakDuration}-minute breaks</p>
              <p>✓ Sessions completed: {sessionStats.completedSessions}</p>
            </div>

            {/* Timer Settings */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm font-medium text-foreground mb-2 sm:mb-3">
                Focus Duration
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[15, 25, 45, 60].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => {
                      localStorage.setItem(
                        "focusCoach_focusDuration",
                        duration.toString()
                      );
                      // Reload to apply changes
                      window.location.reload();
                    }}
                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                      focusDuration === duration
                        ? "bg-coach-blue text-white"
                        : "bg-glass-bg border border-glass-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {duration}m
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-medium text-foreground mb-2 sm:mb-3">
                Break Duration
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[3, 5, 10, 15].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => {
                      localStorage.setItem(
                        "focusCoach_breakDuration",
                        duration.toString()
                      );
                      // Reload to apply changes
                      window.location.reload();
                    }}
                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                      breakDuration === duration
                        ? "bg-orange-500 text-white"
                        : "bg-glass-bg border border-glass-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {duration}m
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentMessage(COACH_MESSAGES.idle(userName));
                setShowWelcomeScreen(false);
              }}
              className="mt-4 sm:mt-6 px-4 py-2 bg-coach-blue text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Let's Focus! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userName={userName}
        onUserNameChange={setUserName}
      />
    </div>
  );
};
