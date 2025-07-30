import { useState, useCallback, useRef } from 'react';
import { WebcamBackground } from './WebcamBackground';
import { CoachBox } from './CoachBox';
import { FocusTimer } from './FocusTimer';
import { StartButton } from './StartButton';
import { UserNameInput } from './UserNameInput';
import { AttentionTracker } from './AttentionTracker';
import { SettingsModal } from './SettingsModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Settings } from 'lucide-react';

const COACH_MESSAGES = {
  welcome: (name: string) => `Welcome back, ${name}! Ready to boost your productivity?`,
  starting: (name: string) => `Focus session started. Don't touch your phone, ${name}.`,
  halfway: (name: string) => `You're halfway there, ${name}. Keep going!`,
  fiveMinutes: (name: string) => `Only 5 minutes left, stay strong, ${name}!`,
  complete: (name: string) => `Great job, ${name}! Time for a break.`,
  idle: (name: string) => `Click 'Start Focus' when you're ready to begin your session, ${name}.`,
  distracted: (name: string) => `${name}, eyes on the prize! Stay focused.`,
  refocused: (name: string) => `Welcome back, ${name}! Let's keep going.`,
  paused: (name: string) => `Session paused, ${name}. Focus up to continue!`
};

export const FocusCoach = () => {
  const [userName, setUserName] = useLocalStorage<string>('focusCoach_userName', '');
  const [elevenlabsApiKey, setElevenlabsApiKey] = useLocalStorage<string>('focusCoach_elevenlabsKey', '');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showCoach, setShowCoach] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStats, setSessionStats] = useLocalStorage('focusCoach_stats', { 
    completedSessions: 0, 
    totalFocusTime: 0 
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartStop = useCallback(() => {
    if (isSessionActive) {
      // Stop session
      setIsSessionActive(false);
      setIsSessionPaused(false);
      setCurrentMessage(COACH_MESSAGES.idle(userName));
      setShowCoach(true);
    } else {
      // Start session
      setIsSessionActive(true);
      setIsSessionPaused(false);
      setCurrentMessage(COACH_MESSAGES.starting(userName));
      setShowCoach(true);
      
      // Hide coach message after 5 seconds to minimize distractions
      setTimeout(() => {
        setShowCoach(false);
      }, 5000);
    }
  }, [isSessionActive, userName]);

  const handleVoicePrompt = useCallback((message: string) => {
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
    }
    
    if (coachMessage) {
      setCurrentMessage(coachMessage);
      setShowCoach(true);
      
      // Auto-hide after showing the message (except for completion)
      if (!message.includes("Great job")) {
        setTimeout(() => {
          setShowCoach(false);
        }, 4000);
      }
    }
  }, [userName]);

  const handleSessionComplete = useCallback(() => {
    setIsSessionActive(false);
    setIsSessionPaused(false);
    setCurrentMessage(COACH_MESSAGES.complete(userName));
    setShowCoach(true);
    
    // Update session stats
    setSessionStats(prev => ({
      completedSessions: prev.completedSessions + 1,
      totalFocusTime: prev.totalFocusTime + 25
    }));
    
    // Show completion message longer, then switch to idle
    setTimeout(() => {
      setCurrentMessage(COACH_MESSAGES.idle(userName));
    }, 8000);
  }, [userName, setSessionStats]);

  const handleTimeUpdate = useCallback((timeLeft: number, totalTime: number) => {
    // Could add additional logic here for time-based UI updates
  }, []);

  const handleDistraction = useCallback(() => {
    if (isSessionActive && !isSessionPaused) {
      setIsSessionPaused(true);
      setCurrentMessage(COACH_MESSAGES.distracted(userName));
      setShowCoach(true);
    }
  }, [isSessionActive, isSessionPaused, userName]);

  const handleRefocus = useCallback(() => {
    if (isSessionActive && isSessionPaused) {
      setIsSessionPaused(false);
      setCurrentMessage(COACH_MESSAGES.refocused(userName));
      setShowCoach(true);
      
      // Hide message after showing refocus encouragement
      setTimeout(() => {
        setShowCoach(false);
      }, 3000);
    }
  }, [isSessionActive, isSessionPaused, userName]);

  const handleNameSubmit = useCallback((name: string) => {
    setUserName(name);
    setCurrentMessage(COACH_MESSAGES.welcome(name));
  }, [setUserName]);

  // Initialize welcome message when user name is available
  if (userName && !currentMessage) {
    setCurrentMessage(COACH_MESSAGES.welcome(userName));
  }

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
      />
      
      {/* Dark overlay for better UI visibility */}
      <div className="fixed inset-0 bg-black/20 z-10" />
      
      {/* Settings Button */}
      {!isSessionActive && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-6 right-6 z-50 bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-3 shadow-2xl hover:shadow-coach-blue/20 transition-all duration-300"
        >
          <Settings className="w-5 h-5 text-muted-foreground hover:text-coach-blue transition-colors" />
        </button>
      )}

      {/* Start/Stop Button */}
      <StartButton 
        isActive={isSessionActive} 
        onClick={handleStartStop}
        userName={userName}
        isPaused={isSessionPaused}
      />
      
      {/* Timer (only visible during session) */}
      <FocusTimer
        isActive={isSessionActive}
        isPaused={isSessionPaused}
        userName={userName}
        onTimeUpdate={handleTimeUpdate}
        onComplete={handleSessionComplete}
        onVoicePrompt={handleVoicePrompt}
        elevenlabsApiKey={elevenlabsApiKey}
      />
      
      {/* Coach Box */}
      <CoachBox 
        message={currentMessage}
        isVisible={showCoach}
        userName={userName}
        sessionStats={sessionStats}
      />
      
      {/* Instructions overlay for first-time users */}
      {!isSessionActive && currentMessage === COACH_MESSAGES.welcome(userName) && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-6">
          <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-8 max-w-md text-center shadow-2xl">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              🎯 Focus Coach
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Welcome back, {userName}! Your AI-powered focus companion is ready to help you stay on track with personalized voice guidance and attention tracking.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <p>✓ Live webcam for accountability</p>
              <p>✓ Personalized voice prompts</p>
              <p>✓ Attention tracking with auto-pause</p>
              <p>✓ Sessions completed: {sessionStats.completedSessions}</p>
            </div>
            {!elevenlabsApiKey && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-300">
                  💡 Add your ElevenLabs API key in settings for premium AI voice!
                </p>
              </div>
            )}
            <button
              onClick={() => setCurrentMessage(COACH_MESSAGES.idle(userName))}
              className="mt-6 px-4 py-2 bg-coach-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
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
        elevenlabsApiKey={elevenlabsApiKey}
        onSaveApiKey={setElevenlabsApiKey}
        userName={userName}
        onUserNameChange={setUserName}
      />
    </div>
  );
};