import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface FaqViewProps {
  onBack: () => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ onBack }) => {
  const { theme, language, t } = useApp();
  const isDark = theme === 'dark';
  const faq = t.faq;

  // Track which question is expanded (first question open by default)
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div id="faq-bytebites-view" className="space-y-6 animate-fadeIn pb-12">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          id="faq-back-btn"
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
          FAQ
        </span>
      </div>

      {/* Header Banner */}
      <div
        className={`rounded-3xl p-6 text-center flex flex-col items-center gap-2 border transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15 shadow-sm'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#00f9cb]/20 text-[#00f9cb]' : 'bg-[#006853]/15 text-[#006853]'}`}>
          <span className="material-symbols-outlined text-2xl">help_outline</span>
        </div>
        <h2 className={`font-headline-md text-2xl font-bold ${isDark ? 'text-[#00f9cb]' : 'text-[#006853]'}`}>
          {faq.title}
        </h2>
        <p className={`text-xs ${isDark ? 'text-white/70' : 'text-[#00352f]'}`}>
          {language === 'ar' ? 'كل ما تود معرفته عن منصة بايت بايتس' : 'Everything you need to know about ByteBites'}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faq.items.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              id={`faq-item-${idx}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDark
                  ? isOpen
                    ? 'bg-white/10 border-[#00f9cb]/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  : isOpen
                  ? 'bg-white border-[#006853] shadow-sm'
                  : 'bg-white/80 border-[#006853]/15 hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-4 flex items-center justify-between text-start gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-[#00f9cb]/20 text-[#00f9cb]' : 'bg-[#006853]/15 text-[#006853]'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`font-body-md text-sm font-bold ${isDark ? 'text-white' : 'text-[#00352f]'}`}>
                    {item.q}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-base transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#00f9cb]' : isDark ? 'text-white/50' : 'text-[#00352f]/50'
                  }`}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  <p className={`font-body-md text-xs leading-relaxed ${isDark ? 'text-white/80' : 'text-[#00352f]/80'}`}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need more help contact box */}
      <div
        className={`rounded-3xl p-5 border text-center transition-all flex flex-col items-center gap-2 ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#006853]/15 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00f9cb]">
          <span className="material-symbols-outlined text-sm">mail</span>
          <span>{language === 'ar' ? 'هل لديك سؤال آخر؟' : 'Have another question?'}</span>
        </div>
        <p className={`text-xs ${isDark ? 'text-white/80' : 'text-[#00352f]/80'}`}>
          {language === 'ar' ? 'تواصل معنا مباشرة عبر البريد الإلكتروني:' : 'Contact us directly via email:'}
        </p>
        <a
          id="faq-contact-email-link"
          href="mailto:bytebitescomm@gmail.com"
          className={`font-mono text-[10px] sm:text-xs font-medium tracking-tight px-2.5 py-0.5 rounded-full border transition-all truncate max-w-full ${
            isDark
              ? 'bg-white/5 hover:bg-white/10 text-[#00f9cb] border-white/10 hover:border-[#00f9cb]/40'
              : 'bg-[#aef6e9]/25 hover:bg-[#aef6e9]/40 text-[#006853] border-[#006853]/15'
          }`}
          dir="ltr"
        >
          bytebitescomm@gmail.com
        </a>
      </div>
    </div>
  );
};
