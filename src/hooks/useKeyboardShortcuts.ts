import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onStartStop?: () => void;
  onPauseResume?: () => void;
  onSettings?: () => void;
  onMute?: () => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Space bar - Start/Stop
      if (event.code === "Space" && config.onStartStop) {
        event.preventDefault();
        config.onStartStop();
      }

      // Escape - Pause/Resume
      if (event.code === "Escape" && config.onPauseResume) {
        event.preventDefault();
        config.onPauseResume();
      }

      // Ctrl/Cmd + , - Settings
      if (
        (event.ctrlKey || event.metaKey) &&
        event.code === "Comma" &&
        config.onSettings
      ) {
        event.preventDefault();
        config.onSettings();
      }

      // M key - Mute/Unmute
      if (event.code === "KeyM" && config.onMute) {
        event.preventDefault();
        config.onMute();
      }
    },
    [config]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Helper function to show keyboard shortcuts help
    showShortcutsHelp: () => {
      const shortcuts = [
        { key: "Space", action: "Start/Stop Focus Session" },
        { key: "Escape", action: "Pause/Resume Session" },
        { key: "Ctrl/Cmd + ,", action: "Open Settings" },
        { key: "M", action: "Mute/Unmute Voice" },
      ];

      console.log("🎯 Focus Coach Keyboard Shortcuts:");
      shortcuts.forEach(({ key, action }) => {
        console.log(`  ${key}: ${action}`);
      });
    },
  };
};
