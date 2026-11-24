import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import AuthLayout from './AuthLayout';

interface LoginProps {
	onLogin: (identifier: string, password?: string, otp?: string) => void | Promise<void>;
	onNavigateToSignup: () => void;
	onNavigateToForgot: () => void;
  defaultEmail?: string;
}

export default function Login({ onLogin, onNavigateToSignup, onNavigateToForgot, defaultEmail = '' }: LoginProps) {
  const { t } = useLanguage();
	const [email, setEmail] = useState(defaultEmail);
	const [password, setPassword] = useState('');
 const [otp,setOtp]=useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try { await onLogin(email, password, otp); } finally { setBusy(false); }
  };

  return (
    <AuthLayout isLogin={true}>
      <div className="bg-surface-card rounded-[2rem] p-6 sm:p-10 xl:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-subtle w-full">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold text-text-primary mb-3 tracking-tight">{t("Sign In")}</h2>
          <p className="text-text-secondary text-base">{t("Welcome back! Please sign in to your Postter account.")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center w-full bg-surface-container-low border border-border-subtle rounded-xl focus-within:border-text-primary focus-within:bg-surface-card transition-all overflow-hidden group">
              <div className="pl-4 pr-3 flex items-center justify-center text-text-secondary group-focus-within:text-text-primary transition-colors">
                <Mail size={18} strokeWidth={1.25} />
              </div>
              <input
                type="text"
                aria-label={t('Email or Username')}
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 w-0 bg-transparent py-3.5 pr-4 text-sm text-text-primary outline-none placeholder:text-text-secondary border-none focus:ring-0"
                placeholder={t('Email address or username')}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center w-full bg-surface-container-low border border-border-subtle rounded-xl focus-within:border-text-primary focus-within:bg-surface-card transition-all overflow-hidden group">
              <div className="pl-4 pr-3 flex items-center justify-center text-text-secondary group-focus-within:text-text-primary transition-colors">
                <Lock size={18} strokeWidth={1.25} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label={t("Password")}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 w-0 bg-transparent py-3.5 pr-2 text-sm text-text-primary outline-none placeholder:text-text-secondary border-none focus:ring-0"
                placeholder={t("Password")}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? t('Hide password') : t('Show password')}
                onClick={() => setShowPassword(!showPassword)}
                className="w-12 h-full flex-shrink-0 flex items-center justify-center text-text-secondary hover:text-text-secondary focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
              </button>
            </div>
          </div>

          <label className="block text-sm">Authenticator / 2FA<input aria-label="Authenticator / 2FA" autoComplete="one-time-code" value={otp} onChange={e=>setOtp(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Optional: 6 digits" className="w-full rounded-xl border border-border-subtle p-3 mt-2 bg-transparent"/></label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNavigateToForgot}
              className="text-sm font-semibold auth-link hover:underline"
            >
              {t("Forgot password?")}
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 px-4 bg-[#111111] hover:bg-black text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-md"
          >
            {busy && <Loader2 size={17} className="inline-block mr-2 animate-spin" />}{t('Sign In')}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-text-secondary">
          {t("Don't have an account?")}{' '}
          <button onClick={onNavigateToSignup} className="auth-link font-semibold hover:underline">
            {t("Sign Up")}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
