import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import OAuthButtons from './OAuthButtons';
import AuthLayout from './AuthLayout';

interface LoginProps {
	onLogin: (identifier: string, password?: string) => void | Promise<void>;
	onNavigateToSignup: () => void;
	onNavigateToForgot: () => void;
	onOAuth: (provider: string) => void;
  defaultEmail?: string;
}

export default function Login({ onLogin, onNavigateToSignup, onNavigateToForgot, onOAuth, defaultEmail = '' }: LoginProps) {
  const { t } = useLanguage();
	const [email, setEmail] = useState(defaultEmail);
	const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try { await onLogin(email, password); } finally { setBusy(false); }
  };

  return (
    <AuthLayout isLogin={true}>
      <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">{t("Sign In")}</h2>
          <p className="text-gray-500 text-base">{t("Welcome back! Please sign in to your Postterest account.")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center w-full bg-gray-50/50 border border-gray-200 rounded-xl focus-within:border-gray-900 focus-within:bg-white transition-all overflow-hidden group">
              <div className="pl-4 pr-3 flex items-center justify-center text-gray-400 group-focus-within:text-gray-900 transition-colors">
                <Mail size={18} strokeWidth={1.25} />
              </div>
              <input
                type="text"
                aria-label={t('Email or Username')}
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 w-0 bg-transparent py-3.5 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 border-none focus:ring-0"
                placeholder={t('Email address or username')}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center w-full bg-gray-50/50 border border-gray-200 rounded-xl focus-within:border-gray-900 focus-within:bg-white transition-all overflow-hidden group">
              <div className="pl-4 pr-3 flex items-center justify-center text-gray-400 group-focus-within:text-gray-900 transition-colors">
                <Lock size={18} strokeWidth={1.25} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 w-0 bg-transparent py-3.5 pr-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 border-none focus:ring-0"
                placeholder={t("Password")}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? t('Hide password') : t('Show password')}
                onClick={() => setShowPassword(!showPassword)}
                className="w-12 h-full flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.25} /> : <Eye size={18} strokeWidth={1.25} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNavigateToForgot}
              className="text-sm font-semibold text-[#0866ff] hover:underline"
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

        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-xs text-gray-400 font-medium">{t("or")}</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <div className="mt-8 space-y-3">
          <OAuthButtons onOAuth={onOAuth} verb="Sign in" />
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          {t("Don't have an account?")}{' '}
          <button onClick={onNavigateToSignup} className="text-[#0866ff] font-semibold hover:underline">
            {t("Sign Up")}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
