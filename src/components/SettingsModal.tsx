import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Volume2, Palette, Timer, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useVoicePrompts } from "@/hooks/useVoicePrompts";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  userName,
  onUserNameChange,
}: SettingsModalProps) => {
  const [tempUserName, setTempUserName] = useState(userName);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [voiceRate, setVoiceRate] = useState(0.85);
  const [voicePitch, setVoicePitch] = useState(1.05);
  const [voiceVolume, setVoiceVolume] = useState(0.9);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [ambientSoundsEnabled, setAmbientSoundsEnabled] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  const {
    availableVoices,
    selectedVoice: currentVoice,
    changeVoice,
  } = useVoicePrompts();

  useEffect(() => {
    if (currentVoice) {
      setSelectedVoice(currentVoice);
    }
  }, [currentVoice]);

  const handleSave = () => {
    onUserNameChange(tempUserName);
    if (selectedVoice) {
      changeVoice(selectedVoice);
    }
    onClose();
  };

  const testVoice = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Hello ${tempUserName}, this is your focus coach voice test.`
      );
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      utterance.volume = voiceVolume;
      utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
    }
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
            className="bg-glass-bg backdrop-blur-lg border border-glass-border rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
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

            <div className="space-y-6">
              {/* User Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>User Settings</span>
                </h3>

                <div>
                  <Label htmlFor="userName" className="text-foreground">
                    Your Name
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Voice Settings</span>
                </h3>


                <div>
                  <Label className="text-foreground">Voice Selection</Label>
                  <Select
                    value={selectedVoice?.name}
                    onValueChange={(value) => {
                      const voice = availableVoices.find(
                        (v) => v.name === value
                      );
                      setSelectedVoice(voice || null);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices
                        .filter((voice) => voice.lang.startsWith("en"))
                        .map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-foreground">Speech Rate</Label>
                    <Slider
                      value={[voiceRate]}
                      onValueChange={(value) => setVoiceRate(value[0])}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {voiceRate.toFixed(1)}x
                    </p>
                  </div>

                  <div>
                    <Label className="text-foreground">Voice Pitch</Label>
                    <Slider
                      value={[voicePitch]}
                      onValueChange={(value) => setVoicePitch(value[0])}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {voicePitch.toFixed(1)}x
                    </p>
                  </div>

                  <div>
                    <Label className="text-foreground">Volume</Label>
                    <Slider
                      value={[voiceVolume]}
                      onValueChange={(value) => setVoiceVolume(value[0])}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(voiceVolume * 100)}%
                    </p>
                  </div>

                  <Button
                    onClick={testVoice}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Test Voice
                  </Button>
                </div>
              </div>


              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">
                      Browser Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when sessions start/end
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Ambient Sounds</Label>
                    <p className="text-xs text-muted-foreground">
                      Background white noise during focus
                    </p>
                  </div>
                  <Switch
                    checked={ambientSoundsEnabled}
                    onCheckedChange={setAmbientSoundsEnabled}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={onClose} className="flex-1">
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
