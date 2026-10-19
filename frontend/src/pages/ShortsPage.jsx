import { postUrl } from '../utils/postUrl';
import { useLanguage } from "../context/LanguageContext";import { profileUrl } from '../utils/profileUrl';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { postApi } from '../api/postApi';
import AppLayout from '../components/modern/AppLayout';
import { ShareModal } from '../components/modern/PostActionModals';

const PAGE_SIZE = 10;

// One short (1–1.5 minute video). Plays only while mostly on screen.
function ShortItem({ post, muted, onToggleMute, onLike, onShare }) {const { t } = useLanguage();
  const videoRef = useRef(null);
  const video = post.media?.find((m) => m.media_type === 'video' && m.is_short);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio > 0.7) node.play().catch(() => undefined);else
      node.pause();
    }, { threshold: [0, 0.7, 1] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [video?.media_url]);

  if (!video) return null;
  return (
    <section className="snap-start relative h-[calc(100vh-120px)] max-h-[860px] w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden bg-black">
      {video.processing_status === 'ready' ?
      <video ref={videoRef} src={video.media_url} loop muted={muted} playsInline preload="metadata" className="w-full h-full object-contain" onClick={(e) => e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause()} /> :

      <div className="w-full h-full flex items-center justify-center text-white/70 text-sm">Video sedang diproses…</div>
      }
      <button type="button" onClick={onToggleMute} className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white" aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}>{muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
      <div className="absolute bottom-0 inset-x-0 p-4 pr-16 bg-gradient-to-t from-black/80 to-transparent text-white">
        <Link to={profileUrl(post.user || { id: post.user_id })} className="flex items-center gap-2 font-bold text-sm mb-1">
          <img src={post.user?.avatar_url || '/favicon.svg'} alt="" className="w-8 h-8 rounded-full object-cover" />@{post.user?.username || post.user?.name}
        </Link>
        <Link to={postUrl(post)} className="block font-semibold text-sm">{post.title}</Link>
        <p className="text-xs text-white/80 line-clamp-2">{(post.hashtags || []).map((h) => '#' + h.tag).join(' ')}</p>
      </div>
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 text-white text-xs font-bold">
        <button type="button" onClick={onLike} className="flex flex-col items-center" aria-label={t("Suka")}><Heart className={`w-7 h-7 ${post.is_liked_by_me ? 'fill-error text-error' : ''}`} />{post.likes_count || 0}</button>
        <Link to={postUrl(post)} className="flex flex-col items-center" aria-label={t("Komentar")}><MessageCircle className="w-7 h-7" />{post.comments_count || 0}</Link>
        <button type="button" onClick={onShare} className="flex flex-col items-center" aria-label={t("Bagikan")}><Share2 className="w-7 h-7" />{post.shares_count || 0}</button>
      </div>
    </section>);

}

export default function ShortsPage() {const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [muted, setMuted] = useState(true);
  const [sharing, setSharing] = useState(null);

  const load = async (beforeId) => {
    setLoading(true);
    try {
      const data = (await postApi.getFeed(PAGE_SIZE, 0, null, beforeId || null, 'shorts')) || [];
      setPosts((current) => beforeId ? [...current, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {load();}, []);

  const like = async (post) => {
    const { liked } = await postApi.toggleLike(post.public_hash || post.id);
    setPosts((current) => current.map((p) => p.id === post.id ? { ...p, is_liked_by_me: liked, likes_count: Math.max(0, (p.likes_count || 0) + (liked ? 1 : -1)) } : p));
  };

  return (
    <AppLayout currentTab="shorts">
      <div className="h-[calc(100vh-110px)] overflow-y-auto snap-y snap-mandatory flex flex-col gap-4 pb-6">
        {posts.map((post) =>
        <ShortItem key={post.id} post={post} muted={muted} onToggleMute={() => setMuted((m) => !m)} onLike={() => like(post)} onShare={() => setSharing(post.public_hash || post.id)} />
        )}
        {loading && <div className="flex justify-center py-10"><Loader className="animate-spin text-primary" size={36} /></div>}
        {!loading && posts.length === 0 && <div className="bg-white rounded-2xl p-10 text-center text-text-secondary">Belum ada Shorts. Unggah video berdurasi 1–1,5 menit untuk tampil di sini.</div>}
        {!loading && hasMore && <button type="button" onClick={() => load(posts[posts.length - 1].id)} className="self-center rounded-full bg-white px-6 py-2 text-sm font-semibold">{t("Muat lebih banyak")}</button>}
      </div>
      {sharing && <ShareModal postId={sharing} onClose={() => setSharing(null)} />}
    </AppLayout>);

}
