import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserNameInputProps {
  onNameSubmit: (name: string) => void;
}

export const UserNameInput = ({ onNameSubmit }: UserNameInputProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🎯 Focus Coach
          </h1>
          <p className="text-muted-foreground">
            Welcome! Let's personalize your focus experience.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              What's your name?
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-coach-blue to-coach-green text-white"
            disabled={!name.trim()}
          >
            Let's Focus! 🚀
          </Button>
        </form>
        
        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>Your name will be used for personalized voice prompts and encouragement.</p>
        </div>
      </div>
    </motion.div>
  );
};