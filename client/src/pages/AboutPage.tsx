import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Coffee, Flame, Heart, Sparkles, Award, Sun } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5" />
            <span>The Story of THE AFTAB</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-stone-950 dark:text-amber-50 leading-tight">
            Every Sip, A Little Sunshine
          </h1>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-light">
            Born from a lifelong reverence for Assam tea gardens and Chikmagalur coffee plantations, THE AFTAB is crafted as a sanctuary of warmth, artisan craftsmanship, and heartfelt hospitality.
          </p>
        </div>

        {/* Feature Split 1: The Heritage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80"
              alt="Steaming Assam Tea leaves"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-amber-100">
              The Alchemy of Indian Tea
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              In India, tea is never merely a beverage — it is a morning ritual, a welcoming gesture, and a thread of conversation that connects generations. At THE AFTAB, we source exclusively from single-estate tea plantations in the Brahmaputra Valley of Assam and the mist-laden peaks of Darjeeling.
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Every pot of our Masala and Ginger Chai begins with freshly ground green cardamom, fragrant cloves, Ceylon cinnamon, and hand-crushed fiery ginger root, slow-simmered to unmask rich, complex flavours.
            </p>
          </div>
        </div>

        {/* Feature Split 2: The Coffee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
          <div className="space-y-4 order-2 md:order-1">
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-amber-100">
              Chikmagalur Arabica Micro-Roasts
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Our coffee journey traces back to the shaded Western Ghats of Karnataka, where coffee was first brought to India centuries ago. We partner directly with biodiverse shade-grown farms to harvest ripe red coffee cherries.
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Roasted carefully in small micro-batches, our Arabica beans unveil natural notes of dark cocoa, roasted almond, and golden caramel, pulled into velvety espressos and silken cappuccinos with signature latte art.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-4/3 shadow-xl order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80"
              alt="Artisan Espresso Extraction"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>

        {/* Values Grid */}
        <div className="py-8 border-t border-stone-200 dark:border-stone-800">
          <h2 className="font-serif text-3xl font-bold text-center text-stone-900 dark:text-amber-100 mb-10">
            Our Guiding Pillars
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Zero Shortcuts</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                No artificial essences or syrups. We hand-grind our whole spices and hand-infuse natural honey, saffron, and Madagascar vanilla beans.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Warm Inclusivity</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Whether you come with your laptop for a work session, a book for a peaceful read, or friends for joyous laughter, you are at home at THE AFTAB.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-amber-100">Ethical Sourcing</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                We ensure fair compensation for our estate farmers and dairy cooperatives, honoring the soil and hands that nourish our craft.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
