import { useState, FormEvent } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, Zap, Users, BarChart3, HelpCircle, CheckCircle } from 'lucide-react';

interface SignupProps {
	onRegister: (email: string, fullName: string, password?: string) => void;
	onNavigateToLogin: () => void;
	onOAuth: (provider: string) => void;
}

export default function Signup({ onRegister, onNavigateToLogin, onOAuth }: SignupProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const fullName = `${firstName} ${lastName}`.trim() || 'Guest professional';
    onRegister(email, fullName, password);
  };

  return (
    <div className="min-h-screen flex items-stretch select-none">
      
      {/* Left Column: Brand Benefits & Testimonial testimonials */}
      <aside className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-primary relative overflow-hidden text-white">
        {/* Background visual geometry pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
          <div className="absolute top-[20%] right-[-10%] w-[320px] h-[320px] rounded-full border border-white/20" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[280px] h-[280px] rounded-full border border-white/20" />
        </div>

        <div className="relative z-10">
          {/* Logo brand details header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Connect Modern</h1>
          </div>

          <h2 className="text-4xl lg:text-5xl font-black leading-tight max-w-md mb-6 tracking-tight">
            Elevate your professional trajectory.
          </h2>
          <p className="text-white/80 text-base max-w-sm mb-12 font-medium leading-relaxed">
            Join a curated network of 50,000+ industry specialists and unlock tools designed for modern career growth.
          </p>

          {/* Social Benefit Cards */}
          <div className="space-y-6 max-w-md">
            <div className="flex items-start gap-4 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 transition-transform hover:scale-102 cursor-default">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Strategic Alliances</h4>
                <p className="text-xs text-white/70 mt-1">Connect with decision-makers using our AI-driven matchmaking algorithm.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 transition-transform hover:scale-102 cursor-default">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Growth Insights</h4>
                <p className="text-xs text-white/70 mt-1">Access exclusive market data and career sentiment analytics for your niche.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Quote wrapper */}
        <div className="relative z-10 mt-auto max-w-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <p className="text-sm italic mb-4 leading-relaxed text-white/90">
              "The efficiency of Connect Modern is unparalleled. I found my current lead architectural role through a connection made within two weeks of joining."
            </p>
            <div className="flex items-center gap-3">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn4yY9AHfgHf5xSDNmE2A_L8DgJV3uWazYrzWuZumv1lrZwSzNTy_txsCyzyjHJwa_RCAMj3-jpkiZDeAQejuQH9-SfGrYGVO20mpRl9bH2mMrmj1j1KJLx1lePrt_iaSi4pehX40r--N232fR7mpquvoZPcdW3BdBpeOcPekx3tLOUzgfyNN9gqcMYpExpiZ5hm73m_hcAslYaQYwfuIKQNchDQ9O-Uor4rYDfKDlVewLOW3KacaJhso7-C43V3Jjrt76AqC1I8" 
                alt="Elena Rodriguez Testimonial portrait" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-xs">Elena Rodriguez</p>
                <p className="text-white/60 text-[10px]">Director of Innovation @ TechStream</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Registration Form layout stream */}
      <main className="flex-grow flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 bg-background min-h-screen">
        <div className="w-full max-w-[480px]">
          
          {/* Mobile adaptive landing header logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary">Connect Modern</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-text-primary mb-1.5 tracking-tight">Create Your Account</h2>
            <p className="text-xs text-text-secondary">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={onNavigateToLogin}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </div>

          {/* Social signup quick routes */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              type="button"
			  onClick={() => onOAuth('google')}
              className="flex items-center justify-center gap-2 h-11 border border-outline-variant bg-white rounded-xl hover:bg-surface-container-low transition-colors font-semibold text-xs text-text-primary cursor-pointer select-none"
            >
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXwueVzJRy4Y6lfOUTvn4Jxq0_-FaKLjiuuCQPsCrFoqF48qrHnINMhfIW35TOFo3tA6yMnmSLOw-35WmD5P_qB5p8Jpafd0kpSF3KGTKiEQ0I4MKvb73cDMGOhouaZukEzM4B2rlKwb8n8SPTG0kZXqG2RWHwgtg3sFAIvu8Vq36mY1D7oNgVVkbwWLcq3VrPEPOTv_doODBv8LZh-QEnvMexAMYkRsH42prT5aOCiJsvrV6W9G3AN55jNE-jzSTakmrcYVGo7Kg" alt="Google" className="w-4 h-4 object-contain" />
              <span>Google</span>
            </button>
            <button 
              type="button"
			  onClick={() => onOAuth('linkedin')}
              className="flex items-center justify-center gap-2 h-11 border border-outline-variant bg-white rounded-xl hover:bg-surface-container-low transition-colors font-semibold text-xs text-text-primary cursor-pointer select-none"
            >
              {/* Simple inline linkedin styled block */}
              <div className="w-4 h-4 bg-[#0A66C2] text-white flex items-center justify-center rounded-xs text-[10px] font-bold select-none">in</div>
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="relative flex items-center mb-8 select-none">
            <div className="flex-grow border-t border-outline-variant/60" />
            <span className="flex-shrink mx-4 text-[9px] font-bold text-outline uppercase tracking-widest">Or continue with email</span>
            <div className="flex-grow border-t border-outline-variant/60" />
          </div>

          {/* Real interactive Registration Form details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary pl-0.5">First Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-xs text-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary pl-0.5">Last Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary pl-0.5">Email Address</label>
              <input 
                type="email"
                required
                placeholder="john.doe@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-xs text-text-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary pl-0.5">Professional Title</label>
              <select 
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-xs text-text-primary"
              >
                <option value="" disabled>Select your industry</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Product Management">Product Management</option>
                <option value="Digital Design">Digital Design</option>
                <option value="Marketing & Strategy">Marketing & Strategy</option>
                <option value="Executive Leadership">Executive Leadership</option>
              </select>
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-text-primary pl-0.5">Create Password</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 bg-white border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-xs text-text-primary"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-8.5 text-outline hover:text-text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
              <p className="text-[10px] text-text-secondary pl-0.5 mt-1">Must be at least 8 characters with one number.</p>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-center text-outline leading-relaxed px-4 pt-2">
              By clicking "Get Started", you agree to our{' '}
              <a href="#" className="font-semibold text-text-primary hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="font-semibold text-text-primary hover:underline">Privacy Policy</a>.
            </p>

          </form>

        </div>
      </main>

    </div>
  );
}
