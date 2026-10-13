import { useLanguage } from "../../context/LanguageContext";import { useEffect, useMemo, useState } from 'react';
import { Flame, Users, Hash, ArrowRight, ChevronRight } from 'lucide-react';
import { networkApi } from '../../api/networkApi';
import { Link } from 'react-router-dom';

interface RightSidebarProps {
  posts: any[];
  followedUsers: string[];
  onFollowSuggestion: (userId: string) => void;
  onNavigate: (tab: any) => void;
  onOpenProfile?: (userId: string) => void;
}

export default function RightSidebar({ posts, followedUsers, onFollowSuggestion, onNavigate, onOpenProfile }: RightSidebarProps) {const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  useEffect(() => {
    networkApi.getSuggestions().then((users) => setSuggestions((users || []).slice(0, 4))).
    catch((error) => console.error('Failed to load network suggestions', error));
  }, []);
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      const tags = `${post.title || ''} ${post.content || ''}`.match(/#[\p{L}\p{N}_]+/gu) || [];
      new Set([...tags.map((tag) => tag.toLowerCase()), ...(post.hashtags || []).map((item: any) => `#${item.tag}`.toLowerCase())]).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [posts]);
  return (
    <aside className="poster-right">
      <section className="poster-panel">
        <div className="poster-panel-heading"><h3><Flame size={20} />{t("Trending Topics")}</h3><Link to="/search">{t("Lihat Semua")}<ArrowRight size={14} /></Link></div>
        <div className="poster-topics">
          {topics.map(([tag, count]) => <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}><Hash size={17} /><strong>{tag}</strong><span>{count} posts</span><ChevronRight size={17} /></Link>)}
          {topics.length === 0 && <p className="poster-empty">Hashtag dari postingan akan muncul di sini.</p>}
        </div>
      </section>
      <section className="poster-panel">
        <div className="poster-panel-heading"><h3><Users size={19} />{t("Suggested People")}</h3><button onClick={() => onNavigate('network')}>{t("Lihat Semua")}<ArrowRight size={14} /></button></div>
        <div className="poster-people">
          {suggestions.map((user) => {
            const id = String(user.id);
            const followed = followedUsers.includes(id);
            return <div key={id} className="poster-person">
              <button className="poster-person-avatar" onClick={() => onOpenProfile?.(id)} aria-label={`Profil ${user.name}`}>
                {user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.name?.slice(0, 1).toUpperCase()}
              </button>
              <button className="poster-person-info" onClick={() => onOpenProfile?.(id)}><strong>{user.name}</strong><span>@{user.username || 'user'}</span><span>{user.followers_count != null ? `${user.followers_count} followers` : user.title || user.company || ''}</span></button>
              <button className="poster-follow" disabled={followed} onClick={() => onFollowSuggestion(id)}>{followed ? t("Following") : t("Follow")}</button>
            </div>;
          })}
          {suggestions.length === 0 && <p className="poster-empty">Belum ada rekomendasi pengguna.</p>}
        </div>
      </section>
      <Link to="/network" className="poster-discover"><div><strong>Jelajahi Dunia<br />dengan Postinganmu</strong><p>Bagikan momen terbaikmu<br />di seluruh dunia</p></div><span><ChevronRight size={22} /></span></Link>
      <footer className="poster-footer"><div><Link to="/network">About</Link><Link to="/settings">Support</Link><Link to="/search">Blog</Link><Link to="/settings">Privacy</Link><Link to="/settings">Terms</Link></div><p>? {new Date().getFullYear()} theposter. All rights reserved.</p></footer>
    </aside>);

}
