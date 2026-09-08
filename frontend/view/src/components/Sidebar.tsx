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
  Plus 
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics';
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onRequestCreatePost: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentTab,
  onNavigate,
  onRequestCreatePost,
  onLogout
}: SidebarProps) {
  const menuItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'network' as const, label: 'Network', icon: Users },
    { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
    { id: 'messages' as const, label: 'Messages', icon: MessageSquare },
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'admin' as const, label: 'Admin Dashboard', icon: LayoutGrid },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-80px)] w-64 sticky top-20 gap-2 p-4 bg-white rounded-2xl border border-border-subtle/40 shadow-sm">
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
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
            onClick={onRequestCreatePost}
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
          <span className="text-xs font-semibold">Logout & Switch Accounts</span>
        </button>
      </div>
    </aside>
  );
}
