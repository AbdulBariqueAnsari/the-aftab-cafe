import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { X, Sparkles } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.showAnnouncement || !settings.announcementBanner || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 text-xs sm:text-sm py-2 px-4 shadow-inner relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center font-medium">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse hidden sm:inline" />
          <span>{settings.announcementBanner}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-200 hover:text-white transition-colors p-1 rounded-full hover:bg-amber-600/50"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
