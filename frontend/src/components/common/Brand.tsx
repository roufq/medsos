import { Link } from 'react-router-dom';

export default function Brand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="postter-brand" aria-label="postter.us — Beranda">
    <img src={`${import.meta.env.BASE_URL}images/postter-logo.png`} alt="" className="postter-brand-icon" />
    {!compact && <span>postter.us</span>}
  </Link>;
}
