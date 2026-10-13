import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return <label className="language-switch"><Languages size={17} aria-hidden="true" /><select aria-label="Bahasa / Language" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="id">Indonesia</option><option value="en">English</option></select></label>;
}
