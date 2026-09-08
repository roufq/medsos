import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, LogOut, Home, User, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e0e3e6] px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Left Branding and Search */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-extrabold text-[#0866ff] tracking-tight hover:brightness-95 transition-all">
          Connect
        </Link>
        <div className="relative hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#65676B]">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search Connect..."
            className="pl-9 pr-4 py-1.5 bg-[#f0f2f5] border border-transparent rounded-full text-sm placeholder-[#65676B] focus:bg-white focus:border-[#0866ff] focus:ring-0 transition-all outline-none w-60"
          />
        </div>
      </div>

      {/* Middle Tab Links */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="p-2 hover:bg-[#f0f2f5] rounded-xl text-[#65676B] hover:text-[#0866ff] transition-all"
          title="Home"
        >
          <Home size={22} />
        </Link>
        <Link
          to={`/profile/${user?.id}`}
          className="p-2 hover:bg-[#f0f2f5] rounded-xl text-[#65676B] hover:text-[#0866ff] transition-all"
          title="Profile"
        >
          <User size={22} />
        </Link>
        {user?.role === 'admin' && (
          <a
            href="http://localhost:8080/web/admin/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-red-50 rounded-xl text-[#65676B] hover:text-red-600 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Open Admin Panel SSR Site"
          >
            <Shield size={20} className="text-red-500 animate-pulse" /> Admin Web
          </a>
        )}
      </div>

      {/* Right Profile Actions */}
      <div className="flex items-center gap-3">
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center gap-2 hover:bg-[#f0f2f5] p-1.5 rounded-full pr-3 transition-all"
        >
          <img
            src={avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <span className="text-sm font-semibold text-[#191c1e] hidden md:block">
            {user?.name.split(' ')[0]}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 rounded-xl text-[#65676B] hover:text-red-600 transition-all"
          title="Log Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
