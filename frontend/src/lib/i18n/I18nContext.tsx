import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fr } from './locales/fr';
import { en } from './locales/en';

export type Language = 'fr' | 'en';

const dictionaries: Record<Language, Record<string, string>> = { fr, en };

const STORAGE_KEY = 'agririsk_language';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'en' || stored === 'fr' ? stored : 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      let str = dictionaries[language][key] ?? dictionaries.fr[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    };
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
