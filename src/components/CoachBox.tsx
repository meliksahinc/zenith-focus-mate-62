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
  const [displayMessage, setDisplayMessage] = useState(message || "Welcome!");
  
  useEffect(() => {
    if (message && message.trim()) {
      setDisplayMessage(message);
    }
  }, [message]);

  // Always show the box, just change opacity

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
        }`}
      >
      <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-4 sm:p-6 max-w-sm mx-auto sm:mx-0 shadow-2xl">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-coach-blue to-coach-green rounded-full flex items-center justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-coach-blue rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-xs sm:text-sm leading-relaxed font-medium">
              {displayMessage}
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-coach-green rounded-full ${
          isVisible ? 'animate-ping' : ''
        }`}></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-coach-blue rounded-full animate-pulse"></div>
      </div>
      </motion.div>
    </div>
  );
};