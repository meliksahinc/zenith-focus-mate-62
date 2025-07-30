import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

interface CoachBoxProps {
  message: string;
  isVisible: boolean;
  userName?: string;
  sessionStats?: {
    completedSessions: number;
    totalFocusTime: number;
  };
}

// Simple animated avatar data (you can replace with actual Lottie file)
const avatarAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Simple Avatar",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 1,
      nm: "Face",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      sw: 80,
      sh: 80,
      sc: "#3b82f6",
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

export const CoachBox = ({ message, isVisible, userName, sessionStats }: CoachBoxProps) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  
  useEffect(() => {
    if (message !== currentMessage) {
      // Delay message update to sync with animation
      const timer = setTimeout(() => {
        setCurrentMessage(message);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [message, currentMessage]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-6 max-w-sm shadow-2xl">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-coach-blue to-coach-green rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-coach-blue rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-foreground text-sm leading-relaxed font-medium"
              >
                {currentMessage}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-coach-green rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-coach-blue rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );
};