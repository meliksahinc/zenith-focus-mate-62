import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  elevenlabsApiKey: string;
  onSaveApiKey: (key: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  elevenlabsApiKey, 
  onSaveApiKey, 
  userName, 
  onUserNameChange 
}: SettingsModalProps) => {
  const [tempApiKey, setTempApiKey] = useState(elevenlabsApiKey);
  const [tempUserName, setTempUserName] = useState(userName);

  const handleSave = () => {
    onSaveApiKey(tempApiKey);
    onUserNameChange(tempUserName);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-coach-blue" />
                <h2 className="text-xl font-bold text-foreground">Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="userName" className="text-foreground">Your Name</Label>
                <Input
                  id="userName"
                  type="text"
                  value={tempUserName}
                  onChange={(e) => setTempUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="apiKey" className="text-foreground">ElevenLabs API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your ElevenLabs API key (optional)"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your free API key from{' '}
                  <a 
                    href="https://elevenlabs.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-coach-blue hover:underline"
                  >
                    elevenlabs.io
                  </a>
                  {' '}for premium AI voice prompts
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-coach-blue to-coach-green text-white"
              >
                Save Settings
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};