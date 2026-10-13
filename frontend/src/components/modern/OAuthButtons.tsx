import { useLanguage } from '../../context/LanguageContext';
const PROVIDERS = [
  { id: 'google', label: 'Google', badge: 'G', className: 'bg-white text-[#4285F4] border border-border-subtle' },
  { id: 'facebook', label: 'Facebook', badge: 'f', className: 'bg-[#1877F2] text-white' },
  { id: 'linkedin', label: 'LinkedIn', badge: 'in', className: 'bg-[#0A66C2] text-white' },
  { id: 'tiktok', label: 'TikTok', badge: '♪', className: 'bg-black text-white' },
  { id: 'apple', label: 'Apple', badge: '?', className: 'bg-black text-white' },
];

export default function OAuthButtons({ onOAuth, verb = 'Masuk' }: { onOAuth: (provider: string) => void; verb?: string }) {
  const { language } = useLanguage();
  return (
    <div className="auth-oauth">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onOAuth(provider.id)}
          className="auth-oauth-button"
        >
          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black ${provider.className}`} aria-hidden="true">{provider.badge}</span>
          <span>{verb === 'Daftar' ? '' : language === 'en' ? 'Sign in with ' : 'Masuk dengan '}{provider.label}</span>
        </button>
      ))}
    </div>
  );
}
