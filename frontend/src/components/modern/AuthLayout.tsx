import React from 'react';
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
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-[1400px] grid lg:grid-cols-2 min-h-screen lg:min-h-[900px] h-full p-4 sm:p-8 gap-12">
        
        {/* LEFT COLUMN */}
        <div className="hidden lg:flex flex-col justify-center relative pl-8 lg:pl-12">
          {/* Decorative Phone Mockups */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-[280px] h-[580px] z-10 pointer-events-none">
            {/* Phone 1 (Back) */}
            <div className="absolute top-12 -left-12 w-full h-full bg-black rounded-[2.5rem] shadow-2xl opacity-60 transform -rotate-6 scale-90 border-8 border-gray-800" />
            {/* Phone 2 (Middle) */}
            <div className="absolute top-6 -left-6 w-full h-full bg-black rounded-[2.5rem] shadow-2xl opacity-80 transform -rotate-3 scale-95 border-8 border-gray-800 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1542314831-c6a4d14faaf2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-50" alt="" />
            </div>
            {/* Phone 3 (Front) */}
            <div className="absolute top-0 left-0 w-full h-full bg-black rounded-[2.5rem] shadow-2xl border-[10px] border-black overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Nature" />
              {/* Fake UI Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 flex flex-col justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                  <div className="w-24 h-3 bg-white/60 rounded-full" />
                </div>
                <div>
                  <div className="w-48 h-4 bg-white font-bold rounded-full mb-2" />
                  <div className="w-32 h-3 bg-white/70 rounded-full mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Area */}
          <div className="ml-[320px] max-w-[420px] z-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-200/60 text-gray-700 text-sm font-medium mb-6 backdrop-blur-sm">
              {badgeText}
            </span>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              {title}
            </h1>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              {subtitle}
            </p>

            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-gray-200/50 flex items-center justify-center shrink-0 text-gray-700">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {!isLogin && (
              <div className="mt-12 opacity-70 transform -rotate-2">
                <p className="font-serif italic text-xl text-gray-500">
                  "Lebih dari sekadar media sosial,<br/>ini adalah tempat untuk menemukan<br/>dunia baru."
                </p>
                <div className="w-32 h-px bg-gray-400 mt-4 ml-8" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Forms) */}
        <div className="flex items-center justify-center lg:justify-start w-full">
          <div className="w-full max-w-[600px]">
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
}
