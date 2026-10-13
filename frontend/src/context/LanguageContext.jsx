import { createContext, useContext, useEffect, useState } from 'react';
import translations from '../i18n/translations.json';
const LanguageContext = createContext(null);
const KEY = 'theposter-language';
const initialLanguage = () => { try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'id'; } catch { return 'id'; } };
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage);
  useEffect(() => { document.documentElement.lang = language; try { localStorage.setItem(KEY, language); } catch { /* Storage unavailable */ } }, [language]);
  useEffect(() => { const sync = (event) => { if (event.key === KEY && ['id', 'en'].includes(event.newValue)) setLanguage(event.newValue); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);
  const t = (text) => translations[text]?.[language] || text;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('LanguageProvider is required'); return value; }
