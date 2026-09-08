import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Bookmark, MonitorPlay, History, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const avatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

  const menuItems = [
    { icon: <Users className="text-blue-500" size={22} />, label: 'Friends', link: '#' },
    { icon: <Bookmark className="text-purple-500" size={22} />, label: 'Saved', link: '#' },
    { icon: <MonitorPlay className="text-red-500" size={22} />, label: 'Watch', link: '#' },
    { icon: <History className="text-yellow-600" size={22} />, label: 'Memories', link: '#' },
    { icon: <Calendar className="text-orange-500" size={22} />, label: 'Events', link: '#' },
    { icon: <Settings className="text-gray-500" size={22} />, label: 'Settings', link: '#' },
  ];

  return (
    <aside className="w-64 hidden lg:block p-4 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto space-y-4">
      {/* Profile link */}
      <Link
        to={`/profile/${user?.id}`}
        className="flex items-center gap-3 p-2 hover:bg-gray-200/50 rounded-xl transition-all"
      >
        <img
          src={avatar}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover border border-gray-100"
        />
        <span className="font-semibold text-sm text-[#191c1e] truncate">{user?.name}</span>
      </Link>

      <div className="border-b border-[#e0e3e6] my-2"></div>

      {/* Navigation shortcuts */}
      <ul className="space-y-1">
        {menuItems.map((item, index) => (
          <li key={index}>
            <a
              href={item.link}
              className="flex items-center gap-3 p-2.5 hover:bg-gray-200/50 rounded-xl transition-all text-sm font-semibold text-[#191c1e]"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="border-b border-[#e0e3e6] my-2"></div>

      <div className="p-3 bg-blue-50 rounded-xl">
        <p className="text-xs font-semibold text-blue-800 leading-relaxed">
          Welcome to Connect! Experience social networking powered by lightning-fast Go services.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
