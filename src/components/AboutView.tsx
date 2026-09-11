import React from 'react';
import { useApp } from '../context/AppContext';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const { theme, language, t } = useApp();
  const isDark = theme === 'dark';
  const about = t.about;

  return (
    <div id="about-bytebites-view" className="space-y-6 animate-fadeIn pb-12">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          id="about-back-btn"
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-caps text-xs transition-all cursor-pointer ${
            isDark
              ? 'bg-white/10 hover:bg-white/15 text-white'
              : 'bg-white hover:bg-gray-100 text-[#00352f] border border-[#006853]/15'
          }`}
        >
          <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
          <span>{language === 'ar' ? 'الرجوع لحسابي' : 'Back to Account'}</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#00f9cb]/20 text-[#00f9cb] border border-[#00f9cb]/30">
          ByteBites
        </span>
      </div>

      {/* Header Banner */}
      <div
        className={`rounded-3xl p-6 text-center flex flex-col items-center gap-3 border transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15 shadow-sm'
        }`}
      >
        <div className="w-20 h-20 relative">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwb831DohEUgHQiL9pnL8rBEnZs4vE7-NuYXUpkOzFUO7RGZRzXDOaD-OpY_cJDV-dAzJvPiT-ebQiOM5C-2CaBHAER1cT34C1ZC3CVBTPBheO-tpDMym8d7UUaJMcV7thOcLH8mNKmI7ZqXBk7ibzU3CbYdlmJAtCCt7sUxl9KmSNMnGuaWEuilJlDeNJyKVCDu6z5ScLnWGRL64ByBQhRuPzAmMsEh-4mU2P6puBk35jtC5sK58k0TiuZg20W3_PMUsgVd8JDLCnew"
            alt="Byte Mascot"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        <h2 className={`font-headline-md text-2xl font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
          {about.title}
        </h2>
      </div>

      {/* About Platform */}
      <section
        className={`rounded-3xl p-6 border transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>auto_awesome</span>
          <h3 className={`font-headline-md text-base font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {about.aboutPlatformTitle}
          </h3>
        </div>
        <p className={`font-body-md text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
          {about.aboutPlatformText}
        </p>
      </section>

      {/* Who is Byte */}
      <section
        className={`rounded-3xl p-6 border transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>restaurant</span>
          <h3 className={`font-headline-md text-base font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {about.whoIsByteTitle}
          </h3>
        </div>
        <p className={`font-body-md text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
          {about.whoIsByteText}
        </p>
      </section>

      {/* What we offer */}
      <section
        className={`rounded-3xl p-6 border transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className={`material-symbols-outlined ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>stars</span>
          <h3 className={`font-headline-md text-base font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
            {about.whatWeOfferTitle}
          </h3>
        </div>

        <div className="space-y-4">
          {about.features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-[#aef6e9]/20 border-[#006853]/15'
              }`}
            >
              <h4 className={`font-body-md text-sm font-bold mb-1 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
                {feature.title}
              </h4>
              <p className={`font-body-md text-xs leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]'}`}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / Goal */}
      <div
        className={`rounded-3xl p-6 border text-center transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#00f9cb]/10 to-[#0aceff]/10 border-[#00f9cb]/30'
            : 'bg-gradient-to-br from-[#aef6e9]/40 to-[#d6fff6] border-[#006853]/20'
        }`}
      >
        <span className={`material-symbols-outlined text-3xl mb-2 ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>eco</span>
        <p className={`font-headline-md text-sm font-semibold leading-relaxed ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
          {about.mission}
        </p>
      </div>
    </div>
  );
};
