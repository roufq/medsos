import { LanguageContext } from './LanguageContext';
import { useEffect, useState, useCallback, useMemo } from 'react';
import translations from '../i18n/translations.json';
import { LANGUAGE_KEY as KEY, normalizeLanguage, translate } from '../i18n/language';

const initialLanguage = () => { try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'id'; } catch { return 'id'; } };
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage);
  useEffect(() => { document.documentElement.lang = language; try { localStorage.setItem(KEY, language); } catch { /* Storage unavailable */ } }, [language]);
  useEffect(() => { const sync = (event) => { if (event.key === KEY || event.key === null) setLanguage(normalizeLanguage(event.newValue)); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);
  const t = useCallback(text => translate(text, language, translations), [language]);
  const selectLanguage = useCallback(value => setLanguage(normalizeLanguage(value)), []);
  const value = useMemo(() => ({ language, setLanguage: selectLanguage, t }), [language, selectLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
