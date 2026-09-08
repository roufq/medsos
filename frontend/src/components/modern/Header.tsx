import { useState } from 'react';
import { Search, Bell, Mail, Settings, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onToggleMobileSidebar: () => void;
}

export default function Header({
  currentUser,
  searchQuery,
  setSearchQuery,
  onNavigate,
  onToggleMobileSidebar
}: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="w-full sticky top-0 bg-white border-b border-border-subtle z-40">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 flex-1">
          {/* Mobile hamburger menu */}
          <button 
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden text-text-secondary hover:text-primary transition-colors cursor-pointer p-1"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo / Brand Name */}
          <div 
            onClick={() => onNavigate('home')}
            className="font-headline-lg text-headline-lg font-bold text-primary cursor-pointer tracking-tight select-none"
          >
            Connect Modern
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 w-full max-w-md border border-transparent focus-within:border-primary focus-within:bg-white focus-within:shadow-md transition-all">
            <Search className="w-5 h-5 text-outline group-focus-within:text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search professionals, jobs, insights..."
              className="bg-transparent border-none outline-none focus:ring-0 text-sm ml-2 w-full text-text-primary placeholder:text-outline"
            />
          </div>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-5">
          <div className="flex gap-1">
            <button 
              type="button"
              onClick={() => onNavigate('home')} 
              className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </button>
            <button 
              type="button"
              onClick={() => onNavigate('messages')} 
              className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer"
            >
              <Mail className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary text-[8px] text-white flex items-center justify-center font-bold rounded-full">1</span>
            </button>
            <button 
              type="button"
              onClick={() => onNavigate('admin')} 
              className="p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* User profile avatar callback */}
          <div 
            onClick={() => onNavigate('profile')}
            className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle cursor-pointer active:scale-95 hover:shadow-sm transition-all"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
