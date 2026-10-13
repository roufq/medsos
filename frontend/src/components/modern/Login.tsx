import { useLanguage } from "../../context/LanguageContext";import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import OAuthButtons from './OAuthButtons';
import AuthShowcase from './AuthShowcase';
interface LoginProps {onLogin: (identifier: string, password?: string) => void | Promise<void>;onNavigateToSignup: () => void;onNavigateToForgot: () => void;onOAuth: (provider: string) => void;defaultEmail?: string;}
export default function Login({ onLogin, onNavigateToSignup, onNavigateToForgot, onOAuth, defaultEmail = '' }: LoginProps) {const { t } = useLanguage();
  const [email, setEmail] = useState(defaultEmail);const [password, setPassword] = useState('');const [showPassword, setShowPassword] = useState(false);const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {event.preventDefault();if (busy) return;setBusy(true);try {await onLogin(email, password);} finally {setBusy(false);}};
  return <AuthShowcase><section className="auth-form-panel"><h2>{t("Sign In")}</h2><p className="auth-form-description">{t("Welcome back! Please sign in to your Postterest account.")}</p>
    <form onSubmit={submit} className="auth-login-form"><label className="auth-input-wrap"><Mail size={20} /><input aria-label={t("Email or Username")} autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Email address or username")} /></label>
      <label className="auth-input-wrap"><Lock size={20} /><input aria-label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /><button type="button" aria-label={showPassword ? t("Hide password") : t("Show password")} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}</button></label>
      <button type="button" className="auth-forgot" onClick={onNavigateToForgot}>{t("Forgot password?")}</button><button type="submit" className="auth-primary" disabled={busy}>{busy && <Loader2 size={17} className="animate-spin" />}{t("Sign In")}</button>
    </form><div className="auth-divider"><span>{t("or")}</span></div><OAuthButtons onOAuth={onOAuth} verb="Sign in" /><p className="auth-switch">{t("Don't have an account?")}<button type="button" onClick={onNavigateToSignup}>{t("Sign Up")}</button></p>
  </section></AuthShowcase>;
}
