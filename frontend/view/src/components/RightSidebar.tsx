import { Info, UserPlus, UserCheck } from 'lucide-react';
import { mockUsers } from '../data';
import { User } from '../types';

interface RightSidebarProps {
  followedUsers: string[];
  onFollowSuggestion: (userId: string) => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
}

export default function RightSidebar({
  followedUsers,
  onFollowSuggestion,
  onNavigate
}: RightSidebarProps) {
  const suggestions = [
    {
      id: 'elena',
      user: mockUsers.elena
    },
    {
      id: 'david',
      user: mockUsers.david
    }
  ];

  return (
    <aside className="hidden xl:flex flex-col w-72 sticky top-20 h-fit gap-6 select-none">
      {/* Trending Insights Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-md text-headline-md text-text-primary text-[15px] font-bold">Trending Insights</h3>
          <Info className="w-4 h-4 text-text-secondary cursor-pointer hover:text-primary transition-colors" />
        </div>
        <div className="flex flex-col gap-4">
          <a className="group block cursor-pointer" onClick={() => onNavigate('analytics')}>
            <div className="text-xs text-text-secondary">Technology • 1.2k reading</div>
            <div className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors mt-0.5">
              The Rise of Sovereign AI Clusters
            </div>
          </a>
          <a className="group block cursor-pointer" onClick={() => onNavigate('analytics')}>
            <div className="text-xs text-text-secondary">Workplace • 856 reading</div>
            <div className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors mt-0.5">
              Hybrid Work: The 2024 Re-evaluation
            </div>
          </a>
          <a className="group block cursor-pointer" onClick={() => onNavigate('analytics')}>
            <div className="text-xs text-text-secondary">Economy • 3.4k reading</div>
            <div className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors mt-0.5">
              Digital Currency Integration in B2B
            </div>
          </a>
        </div>
        <button 
          onClick={() => onNavigate('analytics')} 
          className="mt-5 w-full py-2.5 text-primary bg-primary/5 hover:bg-primary/10 transition-colors font-bold text-xs rounded-xl cursor-pointer"
        >
          View all insights
        </button>
      </div>

      {/* Grow Your Network suggestions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle/20">
        <h3 className="font-headline-md text-headline-md text-text-primary text-[15px] font-bold mb-4">Grow Your Network</h3>
        <div className="flex flex-col gap-4">
          {suggestions.map(({ id, user }) => {
            const isFollowed = followedUsers.includes(id);
            return (
              <div key={id} className="flex items-center gap-3">
                <div 
                  onClick={() => onNavigate('network')} 
                  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex-shrink-0"
                >
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <div 
                    onClick={() => onNavigate('network')} 
                    className="font-bold text-text-primary text-xs hover:underline cursor-pointer truncate"
                  >
                    {user.name}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate">{user.title}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onFollowSuggestion(id)}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    isFollowed 
                      ? 'bg-success/10 text-success' 
                      : 'bg-primary/5 text-primary hover:bg-primary/15'
                  }`}
                  title={isFollowed ? 'Connected' : 'Connect'}
                >
                  {isFollowed ? (
                    <UserCheck className="w-4.5 h-4.5" />
                  ) : (
                    <UserPlus className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legal Terms links */}
      <div className="px-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-text-secondary">
        <a className="hover:underline cursor-pointer" onClick={() => onNavigate('home')}>About</a>
        <a className="hover:underline cursor-pointer" onClick={() => onNavigate('home')}>Accessibility</a>
        <a className="hover:underline cursor-pointer" onClick={() => onNavigate('home')}>Help Center</a>
        <a className="hover:underline cursor-pointer" onClick={() => onNavigate('home')}>Privacy & Terms</a>
        <a className="hover:underline cursor-pointer" onClick={() => onNavigate('home')}>Ad Choices</a>
        <div className="w-full mt-2 text-outline flex items-center gap-1 font-normal text-[11px]">
          <span>© 2026 Connect Modern Suite. All rights reserved.</span>
        </div>
      </div>
    </aside>
  );
}
