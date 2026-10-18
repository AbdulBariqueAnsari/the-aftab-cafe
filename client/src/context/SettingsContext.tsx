import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings } from '../types';

interface SettingsContextType {
  settings: WebsiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: WebsiteSettings = {
  id: 1,
  cafeName: 'THE AFTAB',
  tagline: 'Every Sip, A Little Sunshine.',
  heroHeadline: 'THE AFTAB — Every Sip, A Little Sunshine.',
  heroSubtitle: 'Freshly Brewed. Beautifully Served.',
  heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
  announcementBanner: '☀️ Welcome to THE AFTAB. Enjoy 10% off with code SUNSHINE10!',
  showAnnouncement: true,
  primaryColor: '#2C1810',
  accentColor: '#C67D3A',
  darkModeEnabled: false,
  phone: '+91 98765 43210',
  email: 'hello@theaftabcafe.com',
  address: '42 Sunshine Boulevard, Heritage Quarter, New Delhi, India 110001',
  openingHours: 'Mon – Sun: 8:00 AM – 11:00 PM',
  currencySymbol: '₹',
  taxRatePercent: 5.0,
  serviceChargePercent: 0.0,
  minOrderAmount: 0.0,
  requireCustomerPhone: false,
  allowDineIn: true,
  allowTakeaway: true,
  enableReviews: true,
  instagramUrl: 'https://instagram.com/theaftabcafe',
  facebookUrl: 'https://facebook.com/theaftabcafe',
  twitterUrl: 'https://twitter.com/theaftabcafe',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: false,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
