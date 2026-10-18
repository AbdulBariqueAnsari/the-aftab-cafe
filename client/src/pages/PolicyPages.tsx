import React from 'react';
import { useSettings } from '../context/SettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-stone-900 p-8 sm:p-12 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-stone-950 dark:text-amber-100">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500">Last updated: October 2026</p>

        <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          <p>
            At {settings.cafeName}, we value your trust and privacy. This Privacy Policy details how we handle any information you provide while enjoying our cafe dining and online table ordering services.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            1. Information We Collect
          </h2>
          <p>
            When placing a dine-in or takeaway order, we collect only necessary ordering information such as your name, contact phone number, chosen table number, and any beverage customization preferences. We do not sell or trade your personal data.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            2. How We Use Information
          </h2>
          <p>
            Your information is used exclusively to prepare your items accurately, deliver them to your specific cafe table, and provide live real-time preparation status updates.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            3. Contact Us
          </h2>
          <p>
            If you have questions regarding this policy, reach us at {settings.email} or call {settings.phone}.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-stone-900 p-8 sm:p-12 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-stone-950 dark:text-amber-100">
          Terms & Conditions
        </h1>
        <p className="text-xs text-stone-500">Last updated: October 2026</p>

        <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          <p>
            Welcome to {settings.cafeName}. By accessing our smart table ordering platform or visiting our cafe premises, you agree to these terms.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            1. Table Ordering & Service
          </h2>
          <p>
            Orders placed through the web application will be prepared upon receipt and brought to your assigned table. Please ensure the correct table number is selected before submitting your order.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            2. Menu Pricing & Taxes
          </h2>
          <p>
            All prices are stated in Indian Rupees (₹). Applicable GST ({settings.taxRatePercent}%) is displayed transparently at checkout before order confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};

export const RefundPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-stone-900 p-8 sm:p-12 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-stone-950 dark:text-amber-100">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-stone-500">Last updated: October 2026</p>

        <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          <p>
            At {settings.cafeName}, our baristas and chefs strive to ensure every sip and bite is fresh and delightful.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            1. Order Cancellation
          </h2>
          <p>
            Orders may be cancelled before the kitchen marks them as "Preparing". Once brewing or baking has commenced, items are prepared specifically for you and cannot be cancelled.
          </p>
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-amber-200 pt-2">
            2. Quality Guarantee
          </h2>
          <p>
            If your beverage or food item is unsatisfactory or incorrect, please alert our service staff immediately at your table. We will promptly re-brew or replace your item free of charge.
          </p>
        </div>
      </div>
    </div>
  );
};
