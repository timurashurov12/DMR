import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLanguages } from '@/shared/lib/api';

const STORAGE_KEY = 'restaurant-public-locale';

function getInitialLocale(): string {
  if (typeof window === 'undefined') return 'ru';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return navigator.language?.slice(0, 2) || 'ru';
}

type LocaleContextType = {
  locale: string;
  setLocale: (locale: string) => void;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(getInitialLocale);
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    if (!languages.length) return;
    if (languages.some((l) => l.code === locale)) return;
    setLocaleState(languages[0].code);
  }, [languages, locale]);

  const setLocale = (next: string) => {
    const normalized = next.trim();
    if (!normalized) return;
    if (languages.length && !languages.some((l) => l.code === normalized)) return;
    setLocaleState(normalized);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
