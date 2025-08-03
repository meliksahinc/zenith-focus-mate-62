import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';

interface StartButtonProps {
  isActive: boolean;
  onClick: () => void;
  userName?: string;
}

export const StartButton = ({ isActive, onClick, userName }: StartButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-3 sm:p-4 shadow-2xl hover:shadow-coach-blue/20 transition-all duration-300">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
            isActive 
              ? 'bg-destructive text-destructive-foreground' 
              : 'bg-gradient-to-r from-coach-blue to-coach-green text-white'
          }`}>
            {isActive ? (
              <Square className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>
          
          <div className="text-left hidden sm:block">
            <div className="text-foreground font-semibold text-lg">
              {isActive ? 'Stop Session' : 'Start Focus'}
            </div>
            <div className="text-muted-foreground text-sm">
              {isActive 
                ? 'End current session' 
                : (userName ? `Ready, ${userName}?` : '25 minute session')
              }
            </div>
          </div>
          
          {/* Mobile text */}
          <div className="text-left sm:hidden">
            <div className="text-foreground font-semibold text-sm">
              {isActive ? 'Stop' : 'Start'}
            </div>
          </div>
        </div>
        
        {/* Pulsing ring for inactive state */}
        {!isActive && (
          <div className="absolute inset-0 rounded-xl border-2 border-coach-blue animate-ping opacity-30"></div>
        )}
      </div>
    </motion.button>
  );
};