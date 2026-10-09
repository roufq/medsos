import { useEffect, useMemo, useState } from 'react';
import { Info, UserPlus, UserCheck } from 'lucide-react';
import { networkApi } from '../../api/networkApi';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface RightSidebarProps {
  posts: any[];
  followedUsers: string[];
  onFollowSuggestion: (userId: string) => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onOpenProfile?: (userId: string) => void;
}

export default function RightSidebar({ posts, followedUsers, onFollowSuggestion, onNavigate, onOpenProfile }: RightSidebarProps) {
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    networkApi.getSuggestions()
      .then((users) => setSuggestions((users || []).slice(0, 3)))
      .catch((error) => console.error('Failed to load network suggestions', error));
  }, []);

  const score = (p: any) => (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0);
  const trendingPosts = useMemo(() => [...posts].sort((a, b) => score(b) - score(a)).slice(0, 3), [posts]);

  return (
    <aside className="hidden xl:flex flex-col w-72 sticky top-20 h-fit gap-6 select-none">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-md text-headline-md text-text-primary text-[15px] font-bold">Popular Posts</h3>
          <Info className="w-4 h-4 text-text-secondary" />
        </div>
        <div className="flex flex-col gap-4">
          {trendingPosts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="block hover:opacity-80">
              <div className="text-xs text-text-secondary">{post.user?.name || 'Pengguna'} · {score(post)} interaksi</div>
              <div className="font-bold text-sm text-text-primary mt-0.5 line-clamp-2">{post.title || post.content}</div>
            </Link>
          ))}
          {trendingPosts.length === 0 && <p className="text-xs text-text-secondary">No posts in the database yet.</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle/20">
        <h3 className="font-headline-md text-headline-md text-text-primary text-[15px] font-bold mb-4">Grow Your Network</h3>
        <div className="flex flex-col gap-4">
          {suggestions.map((user: any) => {
            const id = String(user.id);
            const isFollowed = followedUsers.includes(id);
            return (
              <div key={id} className="flex items-center gap-3">
                <div onClick={() => onOpenProfile?.(id)} className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex-shrink-0 bg-surface-container flex items-center justify-center font-bold text-primary">
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : user.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <div onClick={() => onOpenProfile?.(id)} className="font-bold text-text-primary text-xs hover:underline cursor-pointer truncate">{user.name}</div>
                  <div className="text-[11px] text-text-secondary truncate">{user.title || user.company || ''}</div>
                </div>
                <button type="button" disabled={isFollowed} onClick={() => onFollowSuggestion(id)} className={`p-1.5 rounded-full transition-all ${isFollowed ? 'bg-success/10 text-success' : 'bg-primary/5 text-primary hover:bg-primary/15'}`} title={isFollowed ? 'Request sent' : 'Follow'}>
                  {isFollowed ? <UserCheck className="w-4.5 h-4.5" /> : <UserPlus className="w-4.5 h-4.5" />}
                </button>
              </div>
            );
          })}
          {suggestions.length === 0 && <p className="text-xs text-text-secondary">No suggestions in the database.</p>}
        </div>
      </div>

      <div className="px-2 text-xs font-medium text-text-secondary">
        <span>© {new Date().getFullYear()} Connect Modern Suite</span>
      </div>
    </aside>
  );
}
