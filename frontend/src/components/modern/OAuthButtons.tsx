const PROVIDERS = [
  { id: 'google', label: 'Google', badge: 'G', className: 'bg-white text-[#4285F4] border border-border-subtle' },
  { id: 'facebook', label: 'Facebook', badge: 'f', className: 'bg-[#1877F2] text-white' },
  { id: 'linkedin', label: 'LinkedIn', badge: 'in', className: 'bg-[#0A66C2] text-white' },
  { id: 'tiktok', label: 'TikTok', badge: '♪', className: 'bg-black text-white' },
  { id: 'apple', label: 'Apple', badge: '', className: 'bg-black text-white' },
];

export default function OAuthButtons({ onOAuth, verb = 'Masuk' }: { onOAuth: (provider: string) => void; verb?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onOAuth(provider.id)}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border-subtle bg-white text-xs font-semibold text-text-primary hover:bg-surface-container-low"
        >
          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black ${provider.className}`} aria-hidden="true">{provider.badge}</span>
          {verb} dengan {provider.label}
        </button>
      ))}
    </div>
  );
}
