import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Navigation } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Visit Us</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-950 dark:text-amber-50">
            Find THE AFTAB
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            We are nestled in the heritage quarter. Drop by for hot kulhad chai, artisan pour-overs, or quiet reading.
          </p>
        </div>

        {/* Info & Map Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Details Card */}
          <div className="space-y-6 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-amber-100">
              Cafe Information
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-amber-100">Our Address</h4>
                  <p className="text-stone-600 dark:text-stone-400 mt-0.5">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-amber-100">Operating Hours</h4>
                  <p className="text-stone-600 dark:text-stone-400 mt-0.5">{settings.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-amber-100">Phone</h4>
                  <a href={`tel:${settings.phone}`} className="text-amber-600 dark:text-amber-400 hover:underline">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-amber-100">Email Inquiry</h4>
                  <a href={`mailto:${settings.email}`} className="text-amber-600 dark:text-amber-400 hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Inquiries form */}
            <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-100 mb-3">
                Send a Message or Table Inquiry
              </h3>

              {submitted ? (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Thank you! Your message has been delivered to our cafe concierge.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Your inquiry, table reservation request, or question..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Interactive Map */}
          <div className="rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md bg-stone-900 relative min-h-[380px] flex flex-col">
            <iframe
              title="THE AFTAB Location Map"
              src={
                settings.googleMapsEmbedUrl ||
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.114878201202!2d77.214476!3d28.632429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd37b92781b1%3A0x6b80145c8b730f24!2sConnaught%20Place%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000'
              }
              className="w-full h-full min-h-[350px] border-0 flex-1 filter contrast-105"
              loading="lazy"
            />
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Connaught Place / Heritage Quarter</span>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 font-bold hover:underline"
              >
                Open in Maps App →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
