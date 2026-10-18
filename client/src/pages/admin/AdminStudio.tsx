import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { WebsiteSettings } from '../../types';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle,
  Eye,
  Image as ImageIcon,
  DollarSign,
  Phone,
  Shield,
} from 'lucide-react';

export const AdminStudio: React.FC = () => {
  const { token, isSuperAdmin } = useAuth();
  const { settings, refreshSettings } = useSettings();

  const [form, setForm] = useState<WebsiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (field: keyof WebsiteSettings, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await refreshSettings();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all website branding and personalization settings to factory defaults?')) {
      return;
    }

    try {
      const res = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await refreshSettings();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to reset settings');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-500" />
            <span>Website Personalization Studio</span>
          </h1>
          <p className="text-xs text-stone-400">
            Customize cafe branding, hero imagery, announcement banners, and tax rates without code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Website personalization settings saved and live immediately!</span>
        </div>
      )}

      {/* Main Settings Form with Live Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Identity & Hero Section */}
          <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Brand Identity & Hero Banner</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Cafe Name</label>
                <input
                  type="text"
                  value={form.cafeName}
                  onChange={(e) => handleChange('cafeName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-stone-300 font-semibold block mb-1">Homepage Hero Headline</label>
                <input
                  type="text"
                  value={form.heroHeadline}
                  onChange={(e) => handleChange('heroHeadline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-stone-300 font-semibold block mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={form.heroSubtitle}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-stone-300 font-semibold block mb-1">Hero Background Image URL</label>
                <input
                  type="text"
                  value={form.heroImage}
                  onChange={(e) => handleChange('heroImage', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Announcement Ribbon</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showAnnouncement}
                  onChange={(e) => handleChange('showAnnouncement', e.target.checked)}
                  className="rounded border-stone-700 text-amber-600 focus:ring-0"
                />
                <span className="font-semibold">Display announcement banner at top of site</span>
              </label>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Banner Announcement Text</label>
                <input
                  type="text"
                  value={form.announcementBanner}
                  onChange={(e) => handleChange('announcementBanner', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Financials, Taxes & Ordering Rules */}
          <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Financials, Taxes & Orders</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">GST Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.taxRatePercent}
                  onChange={(e) => handleChange('taxRatePercent', parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Service Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.serviceChargePercent}
                  onChange={(e) => handleChange('serviceChargePercent', parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requireCustomerPhone}
                    onChange={(e) => handleChange('requireCustomerPhone', e.target.checked)}
                    className="rounded border-stone-700 text-amber-600 focus:ring-0"
                  />
                  <span>Mandatory Customer Phone Number during checkout</span>
                </label>
              </div>
            </div>
          </div>

          {/* Contact Details & Hours */}
          <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Contact Information & Opening Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="text-stone-300 font-semibold block mb-1">Cafe Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => handleChange('openingHours', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Public Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={form.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-sm text-stone-400 uppercase tracking-wider">
            Live Preview Simulation
          </h3>

          <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl sticky top-6">
            {form.showAnnouncement && form.announcementBanner && (
              <div className="p-2 bg-amber-700 text-stone-100 text-[10px] text-center font-medium">
                {form.announcementBanner}
              </div>
            )}

            <div className="relative h-44 w-full bg-stone-900">
              <img
                src={form.heroImage}
                alt="Hero Preview"
                className="w-full h-full object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  {form.cafeName}
                </span>
                <h4 className="font-serif font-bold text-base text-amber-100">{form.heroHeadline}</h4>
                <p className="text-[10px] text-amber-200/80">{form.heroSubtitle}</p>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs text-stone-300">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Tagline</span>
                <p className="font-serif text-sm text-amber-200">{form.tagline}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-stone-800">
                <div>
                  <span className="text-stone-500 block">GST Rate</span>
                  <span className="font-bold text-white">{form.taxRatePercent}%</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Phone Required</span>
                  <span className="font-bold text-white">{form.requireCustomerPhone ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 space-y-0.5">
                <p>{form.address}</p>
                <p>{form.openingHours}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
