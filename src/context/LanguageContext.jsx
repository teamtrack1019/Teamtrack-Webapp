import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('teamtrack_lang');
      return saved === 'tr' ? 'tr' : 'de';
    } catch {
      return 'de';
    }
  });

  const setLang = (newLang) => {
    const validLang = newLang === 'tr' ? 'tr' : 'de';
    setLangState(validLang);
    try {
      localStorage.setItem('teamtrack_lang', validLang);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  };

  // Helper translation function t('nav.searchPlaceholder', 'Kunde suchen...')
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to German if missing in current language
        let deCurrent = translations['de'];
        for (const deKey of keys) {
          if (deCurrent && deCurrent[deKey] !== undefined) {
            deCurrent = deCurrent[deKey];
          } else {
            return fallback || path;
          }
        }
        return deCurrent || fallback || path;
      }
    }
    return current !== undefined ? current : (fallback || path);
  };

  const isTR = lang === 'tr';
  const isDE = lang === 'de';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isTR, isDE }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
