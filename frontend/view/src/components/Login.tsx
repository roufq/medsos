import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
  onNavigateToSignup: () => void;
  defaultEmail?: string;
}

export default function Login({ onLogin, onNavigateToSignup, defaultEmail = '' }: LoginProps) {
  const [email, setEmail] = useState(defaultEmail || 'roufmawanto194@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative">
      {/* Background Atmospheric Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <main className="w-full max-w-[480px] z-10 flex flex-col gap-8 select-none">
        {/* Logo and Header info */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center bg-white p-3 rounded-2xl shadow-sm border border-border-subtle/20 mb-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              {/* Custom interconnect logo */}
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <h1 className="font-bold text-3xl text-text-primary tracking-tight">Connect Modern</h1>
          <p className="text-sm font-medium text-text-secondary">
            Secure access to your professional suite.
          </p>
        </div>

        {/* Core Login Card */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-md p-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Professional Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-bold text-xs pl-1 text-on-surface-variant">
                Professional Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary">
                  <Mail className="w-5 h-5 transition-colors" />
                </div>
                <input 
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-transparent rounded-xl text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary placeholder:text-outline"
                />
              </div>
            </div>

            {/* Password input field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="font-bold text-xs text-on-surface-variant">
                  Password
                </label>
                <a href="#" className="font-bold text-xs text-primary hover:underline transition-all">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary">
                  <Lock className="w-5 h-5 transition-colors" />
                </div>
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-surface-container-low border border-transparent rounded-xl text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-outline hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center gap-2 px-1">
              <input 
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-primary bg-surface-container border-border-subtle rounded focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-semibold text-text-secondary cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit log in action */}
            <button 
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/25 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Log In</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-text-secondary font-bold uppercase tracking-widest text-[9px]">
                Trusted Partner
              </span>
            </div>
          </div>

          {/* SSO Google Trigger */}
          <button 
            type="button"
            onClick={() => onLogin('roufmawanto194@gmail.com')}
            className="w-full py-3 border border-border-subtle bg-white text-text-primary rounded-xl font-semibold text-xs hover:bg-surface-container-low transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXwueVzJRy4Y6lfOUTvn4Jxq0_-FaKLjiuuCQPsCrFoqF48qrHnINMhfIW35TOFo3tA6yMnmSLOw-35WmD5P_qB5p8Jpafd0kpSF3KGTKiEQ0I4MKvb73cDMGOhouaZukEzM4B2rlKwb8n8SPTG0kZXqG2RWHwgtg3sFAIvu8Vq36mY1D7oNgVVkbwWLcq3VrPEPOTv_doODBv8LZh-QEnvMexAMYkRsH42prT5aOCiJsvrV6W9G3AN55jNE-jzSTakmrcYVGo7Kg" 
              alt="Google SSO" 
              className="w-5 h-5 object-contain"
              referrerPolicy="no-referrer"
            />
            <span>Sign in with Enterprise SSO</span>
          </button>

          <div className="text-center">
            <p className="text-xs text-text-secondary">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={onNavigateToSignup}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign up instead
              </button>
            </p>
          </div>
        </div>

        {/* Security badges and legal support footer */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3.5 select-none text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <ShieldCheck className="w-4.5 h-4.5 text-success fill-success/10" />
              <span className="font-semibold">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Zap className="w-4.5 h-4.5 text-success fill-success/10" />
              <span className="font-semibold">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Globe className="w-4.5 h-4.5 text-success fill-success/10" />
              <span className="font-semibold">Global CDN</span>
            </div>
          </div>

          <footer className="flex flex-col items-center gap-4 border-t border-border-subtle/50 pt-6 w-full">
            <div className="flex gap-6 justify-center text-xs font-semibold text-text-secondary">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
            <p className="text-[10px] text-outline font-medium">
              © 2026 Connect Modern Suite. All rights reserved.
            </p>
          </footer>
        </div>

      </main>
    </div>
  );
}
