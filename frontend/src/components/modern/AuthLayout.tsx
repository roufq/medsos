import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PlaySquare, Users, ShoppingBag, Edit3 } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  isLogin?: boolean;
}

export default function AuthLayout({ children, isLogin = true }: AuthLayoutProps) {
  const { t } = useLanguage();
  const badgeText = isLogin ? "Sign In to Postterest" : "Bergabung dengan Postterest";
  const title = isLogin ? "Welcome Back to Postterest" : "Buat Akun Postterest";
  const subtitle = isLogin
    ? "Login to continue exploring amazing content, connect with people, and be part of a global community."
    : "Jadilah bagian dari komunitas global untuk berbagi, menemukan, dan menjelajahi konten menarik setiap hari.";

  const features: Feature[] = isLogin ? [
    { icon: <PlaySquare size={20} />, title: "Watch & Discover", description: "Find the latest videos, photos, and trends from around the world." },
    { icon: <Users size={20} />, title: "Connect", description: "Follow your favorite creators and meet new people." },
    { icon: <ShoppingBag size={20} />, title: "Shop", description: "Discover and buy products from trusted sellers." },
    { icon: <Edit3 size={20} />, title: "Create", description: "Share your moments, ideas and stories with the world." }
  ] : [
    { icon: <PlaySquare size={20} />, title: "Tonton Video", description: "Temukan video terbaik, foto, dan tren dari seluruh dunia." },
    { icon: <Users size={20} />, title: "Terhubung", description: "Ikuti kreator favorit dan temui orang-orang baru." },
    { icon: <ShoppingBag size={20} />, title: "Shop", description: "Temukan dan beli produk dari penjual terpercaya." },
    { icon: <Edit3 size={20} />, title: "Buat Konten", description: "Bagikan momen, ide, dan cerita kamu dengan dunia." }
  ];

  return (
    <div className="auth-layout text-text-primary min-h-screen w-full bg-background flex items-center justify-center font-sans overflow-x-hidden">
      <div className="w-full max-w-[1720px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen items-center px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 gap-8 xl:gap-12">

        {/* MOBILE / TABLET COMPACT HERO */}
        <div className="lg:hidden text-center max-w-xl mx-auto pt-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-surface-container-highest text-text-primary text-xs font-medium mb-3">
            {t(badgeText)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {t(title)}
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-2 leading-relaxed">
            {t(subtitle)}
          </p>
        </div>

        {/* LEFT COLUMN (Desktop Showcase + Intro) */}
        <div className={`hidden lg:flex items-center gap-8 xl:gap-12 ${isLogin ? 'lg:col-span-6 xl:col-span-7' : 'lg:col-span-5 xl:col-span-6'}`}>
          {/* Decorative Phone Mockups on XL screens */}
          <div className="hidden xl:block relative w-[250px] h-[540px] shrink-0 ml-6 pointer-events-none">
            <div className="absolute top-10 -left-8 w-full h-full bg-black rounded-[2.5rem] shadow-2xl opacity-60 transform -rotate-6 scale-90 border-8 border-gray-800" />
            <div className="absolute top-5 -left-4 w-full h-full bg-black rounded-[2.5rem] shadow-2xl opacity-80 transform -rotate-3 scale-95 border-8 border-gray-800 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1542314831-c6a4d14faaf2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-50" alt="" />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-black rounded-[2.5rem] shadow-2xl border-[10px] border-black overflow-hidden">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Nature" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 flex flex-col justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div className="w-24 h-3 bg-white/60 rounded-full" />
                </div>
                <div>
                  <div className="w-40 h-4 bg-white font-bold rounded-full mb-2" />
                  <div className="w-28 h-3 bg-white/70 rounded-full mb-4" />
                  <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Area */}
          <div className="flex-1 min-w-0 max-w-xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-highest text-text-primary text-sm font-medium mb-5 backdrop-blur-sm">
              {t(badgeText)}
            </span>
            <h1 className="text-3xl xl:text-5xl font-extrabold text-text-primary mb-5 leading-tight tracking-tight">
              {t(title)}
            </h1>
            <p className="text-text-secondary text-base xl:text-lg mb-8 leading-relaxed">
              {t(subtitle)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 text-text-primary">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-text-primary mb-0.5">{t(f.title)}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{t(f.description)}</p>
                  </div>
                </div>
              ))}
            </div>

            {!isLogin && (
              <div className="mt-10 transform -rotate-1">
                <p className="font-serif italic text-lg text-text-secondary">
                  {t("\"Lebih dari sekadar media sosial,")}<br />{t("ini adalah tempat untuk menemukan")}<br />{t("dunia baru.\"")}
                </p>
                <div className="w-32 h-px bg-text-secondary mt-3 ml-6" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Forms) */}
        <div className={`w-full flex items-center justify-center ${isLogin ? 'lg:col-span-6 xl:col-span-5' : 'lg:col-span-7 xl:col-span-6'}`}>
          <div className={`w-full ${isLogin ? 'max-w-[620px]' : 'max-w-none'}`}>
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
