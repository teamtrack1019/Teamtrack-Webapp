import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
      <button
        type="button"
        onClick={() => setLang('de')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
          lang === 'de'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Sprache auf Deutsch einstellen"
      >
        <span className="text-sm leading-none">🇩🇪</span>
        <span>DE</span>
      </button>

      <button
        type="button"
        onClick={() => setLang('tr')}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
          lang === 'tr'
            ? 'bg-white text-sky-950 shadow-sm border border-slate-200/80 font-extrabold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Dili Türkçe olarak ayarla"
      >
        <span className="text-sm leading-none">🇹🇷</span>
        <span>TR</span>
      </button>
    </div>
  );
}
