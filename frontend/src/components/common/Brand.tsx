import {usePlatform} from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function Brand({ compact = false }: { compact?: boolean }) {
  const {settings}=usePlatform();
  const { t: translateUI } = useLanguage();

  return <Link to="/" className="postter-brand" aria-label={translateUI("postter.us — Beranda")}>
    <img src={settings?.logo_url||`${import.meta.env.BASE_URL}images/postter-logo.png`} alt="" className="postter-brand-icon" />
    {!compact && <span>{settings?.site_name||'postter.us'}</span>}
  </Link>;
}
