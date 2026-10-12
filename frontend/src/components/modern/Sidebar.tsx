import { 
  Home, 
  Users, 
  Briefcase, 
  MessageSquare, 
  User, 
  LayoutGrid, 
  BarChart3, 
  HelpCircle, 
  Shield, 
  Plus,
  Clapperboard,
  Bookmark,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: any) => void;
  onRequestCreatePost: () => void;
  onLogout: () => void;
  /** Render as a slide-in drawer for small screens. */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  currentTab,
  onNavigate,
  onRequestCreatePost,
  onLogout,
  mobileOpen,
  onCloseMobile
}: SidebarProps) {
  const { user } = useAuth();

  const menuItems: { id: string; label: string; icon: any }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'shorts', label: 'Shorts', icon: Clapperboard },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'messages', label: 'Pesan', icon: MessageSquare },
    { id: 'saved', label: 'Tersimpan', icon: Bookmark },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Dashboard', icon: LayoutGrid });
    menuItems.push({ id: 'analytics', label: 'Analytics', icon: BarChart3 });
  }

  const go = (tab: string) => { onCloseMobile?.(); onNavigate(tab); };
  const asideClass = mobileOpen
    ? 'fixed inset-y-0 left-0 z-[60] flex flex-col w-72 max-w-[85vw] gap-2 p-4 bg-white shadow-xl overflow-y-auto md:hidden'
    : 'poster-rail hidden md:flex';

  return (
    <>
    {mobileOpen && <div className="fixed inset-0 z-[55] bg-black/40 md:hidden" onClick={onCloseMobile} />}
    <aside className={asideClass}>
      {mobileOpen && <button type="button" onClick={onCloseMobile} className="self-end p-1" aria-label="Tutup menu"><X className="w-5 h-5" /></button>}
      <div className="mb-6 px-2">
        <div className="font-headline-md text-headline-md font-black text-primary">Connect Modern</div>
        <div className="font-label-sm text-label-sm text-text-secondary">Professional Suite</div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1 select-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              key={item.id}
              onClick={() => go(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all text-left group scale-98 active:scale-95 cursor-pointer ${
                isActive 
                  ? 'bg-secondary-container text-primary font-bold' 
                  : 'text-text-secondary hover:bg-surface-container-low hover:text-text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                isActive ? 'text-primary' : 'text-outline group-hover:text-text-primary'
              }`} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}

        <div className="mt-4 px-2">
          <button
            onClick={() => { onCloseMobile?.(); onRequestCreatePost(); }}
            className="w-full py-3 bg-primary text-white font-bold rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </nav>

      {/* Footer support Links */}
      <div className="mt-auto border-t border-border-subtle/50 pt-4 px-2 flex flex-col gap-2.5">
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors text-sm text-left select-none cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-outline" />
          <span className="text-xs font-semibold">Support</span>
        </button>
        <button 
          onClick={onLogout} 
          className="flex items-center gap-3 text-text-secondary hover:text-error transition-colors text-sm text-left select-none cursor-pointer"
        >
          <Shield className="w-4 h-4 text-outline" />
          <span className="text-xs font-semibold">Keluar</span>
        </button>
      </div>
    </aside>
    </>
  );
}
