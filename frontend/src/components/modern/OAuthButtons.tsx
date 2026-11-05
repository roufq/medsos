import { useLanguage } from '../../context/LanguageContext';

const PROVIDERS = [
  { id: 'google', label: 'Google', badge: 'G', className: 'bg-white text-[#4285F4] border border-border-subtle' },
  { id: 'facebook', label: 'Facebook', badge: 'f', className: 'bg-[#1877F2] text-white' },
  { id: 'linkedin', label: 'LinkedIn', badge: 'in', className: 'bg-[#0A66C2] text-white' },
  { id: 'tiktok', label: 'TikTok', badge: '♪', className: 'bg-black text-white' },
  { id: 'apple', label: 'Apple', badge: '', className: 'bg-black text-white' },
];

export default function OAuthButtons({ onOAuth, verb = 'Masuk' }: { onOAuth: (provider: string) => void; verb?: string }) {
  const { language } = useLanguage();
  const isRegister = verb === 'Daftar';
  const prefix = isRegister
    ? (language === 'en' ? 'Sign up with ' : 'Daftar dengan ')
    : (language === 'en' ? 'Sign in with ' : 'Masuk dengan ');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {PROVIDERS.map((provider, idx) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onOAuth(provider.id)}
          className={`auth-oauth-button w-full justify-center sm:justify-start ${idx === PROVIDERS.length - 1 ? 'sm:col-span-2' : ''}`}
        >
          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${provider.className}`} aria-hidden="true">{provider.badge}</span>
          <span className="truncate">{prefix}{provider.label}</span>
        </button>
      ))}
    </div>
  );
}
