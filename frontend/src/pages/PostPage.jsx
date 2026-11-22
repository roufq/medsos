import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { postUrl } from '../utils/postUrl';
import { profileUrl } from '../utils/profileUrl';
import { copyToClipboard } from '../utils/clipboard';
import { RichText, formatPrice, timeAgo } from '../utils/postFormat';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Loader, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Heart, MessageCircle,
  Share2, MoreHorizontal, ExternalLink, ShoppingBag, Repeat2, Pencil, Trash2, Code, Flag, Link as LinkIcon
} from 'lucide-react';
import { postApi } from '../api/postApi';
import { messageApi } from '../api/messageApi';
import AppLayout from '../components/modern/AppLayout';
import { MediaGallery, Lightbox } from '../components/modern/PostCard';
import { EmbedModal, ReportModal, RepostModal, ShareModal } from '../components/modern/PostActionModals';
import CommentThread from '../components/modern/CommentThread';
import CreatePostModal from '../components/modern/CreatePostModal';
import DiscoveryCard from '../components/modern/DiscoveryCard';
import MasonryGrid from '../components/modern/MasonryGrid';
import VerifiedBadge from '../components/common/VerifiedBadge';
import './ExplorePage.css';

export default function PostPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const id = params.id || params.token;
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [authorPosts, setAuthorPosts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartX = useRef(null);
  const [busy, setBusy] = useState(false);
  const validId = /^[a-f0-9]{32}$/i.test(id || '');
  const [error, setError] = useState(validId ? '' : 'Postingan tidak ditemukan.');
  const userId = user?.id;
  const requestKey = `${id}:${userId || ''}`;
  const [loadedRequest, setLoadedRequest] = useState(requestKey);
  if (loadedRequest !== requestKey) {
    setLoadedRequest(requestKey); setPost(null); setAuthorPosts([]);
    setExpanded(false); setCommentsOpen(false); setMenuOpen(false); setSlideIndex(0);
    setError(validId ? '' : 'Postingan tidak ditemukan.');
  }

  useEffect(() => { if (post) document.title = `${post.title || 'Postingan'} · postter.us`; }, [post]);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    postApi.getPost(id, !userId).then(result => {
      if (!active) return;
      setPost(result);
      if (result?.user_id) {
        postApi.getFeed(30, 0, result.user_id, null, '', !userId)
          .then(list => { if (active) setAuthorPosts((list || []).filter(item => item.id !== result.id && !item.repost_of_id)); })
          .catch(() => {});
      }
    }).catch(e => { if (active) setError(e.response?.data?.error || 'Postingan tidak ditemukan.'); });
    return () => { active = false; };
  }, [id, userId, validId]);

  useEffect(() => {
    if (post?.public_hash && location.pathname !== postUrl(post)) navigate(postUrl(post), { replace: true });
  }, [post, location.pathname, navigate]);

  const token = post?.public_hash || post?.id;
  const isMine = post && user && String(post.user_id) === String(user.id);
  const hasMedia = (post?.media || []).length > 0;
  const videos = (post?.media || []).filter(m => m.media_type === 'video');
  const images = (post?.media || []).filter(m => m.media_type === 'image').map(m => m.media_url);
  const activeSlide = images.length > 0 ? ((slideIndex % images.length) + images.length) % images.length : 0;
  const moveSlide = (step) => setSlideIndex(i => (i + step + images.length) % images.length);
  const safeExternalUrl = (raw) => {
    if (!raw) return '';
    try { const u = new URL(raw); return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : ''; } catch { return ''; }
  };
  const externalLink = safeExternalUrl(post?.link?.url);

  const toggleLike = async () => {
    if (!user) { navigate('/login'); return; }
    if (busy || !token) return;
    setBusy(true);
    try {
      const res = await postApi.toggleLike(token);
      setPost(curr => curr ? { ...curr, is_liked_by_me: res.liked, likes_count: res.likes_count ?? Math.max(0, (curr.likes_count || 0) + (res.liked ? 1 : -1)) } : curr);
    } finally { setBusy(false); }
  };

  const toggleSave = async () => {
    if (!user) { navigate('/login'); return; }
    if (busy || !token) return;
    setBusy(true);
    try {
      const { saved } = await postApi.toggleSave(token);
      setPost(curr => curr ? { ...curr, is_saved_by_me: saved } : curr);
    } finally { setBusy(false); }
  };

  const openSellerChat = async () => {
    if (!user) { navigate('/login'); return; }
    if (busy || !token) return;
    setBusy(true);
    try {
      const payload = { shop_post_id: String(token) };
      if (!isMine && (post.user?.public_hash || post.user?.username || post.user_id)) {
        payload.user_id = String(post.user?.public_hash || post.user?.username || post.user_id);
      }
      const { token: intent } = await messageApi.createIntent(payload);
      navigate(`/messages?t=${encodeURIComponent(intent)}`);
    } catch { navigate('/messages'); } finally { setBusy(false); }
  };

  const removePost = async () => {
    setMenuOpen(false);
    if (!window.confirm(t('Hapus postingan ini? Tindakan ini tidak bisa dibatalkan.'))) return;
    await postApi.deletePost(token);
    navigate('/');
  };

  return (
    <AppLayout wide currentTab="post">
      <div className="w-full flex flex-col gap-6 pb-20">
        {error && <div className="max-w-xl mx-auto w-full bg-white dark:bg-surface-card rounded-2xl p-10 text-center text-text-secondary">{t(error)}</div>}
        {!post && !error && <div className="flex justify-center py-20"><Loader className="animate-spin text-primary" size={40} /></div>}

        {post && (
          <article className="w-full max-w-[960px] mx-auto rounded-3xl border border-border-subtle/30 bg-white dark:bg-surface-card shadow-sm overflow-hidden lg:overflow-visible grid grid-cols-1 lg:grid-cols-12">
            {/* Media / Left Column (sticks at top on desktop so expanding description/comments stays aligned) */}
            <div className={`relative ${hasMedia ? 'lg:col-span-7 lg:sticky lg:top-20 lg:self-start rounded-t-3xl lg:rounded-3xl overflow-hidden bg-black/5 dark:bg-black/30' : 'lg:col-span-12 px-4 pt-4'}`}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label={t('Kembali')}
                className={`${hasMedia ? 'absolute top-3 left-3 z-20 bg-black/55 text-white hover:bg-black/75' : 'bg-surface-container-low text-text-primary hover:bg-surface-container'} w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {videos.length > 0 && (
                <div className="w-full [&_.poster-media]:mb-0">
                  <MediaGallery media={videos} onOpen={setLightbox} />
                </div>
              )}
              {images.length > 0 && (
                <div
                  className="relative w-full select-none"
                  onTouchStart={(e) => { touchStartX.current = e.touches?.[0]?.clientX ?? null; }}
                  onTouchEnd={(e) => {
                    if (images.length <= 1 || touchStartX.current === null) return;
                    const dx = (e.changedTouches?.[0]?.clientX ?? touchStartX.current) - touchStartX.current;
                    touchStartX.current = null;
                    if (Math.abs(dx) > 40) moveSlide(dx < 0 ? 1 : -1);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(activeSlide)}
                    className="block w-full focus:outline-none"
                  >
                    <img
                      src={images[activeSlide]}
                      alt=""
                      className={`w-full object-contain mx-auto transition-all duration-200 ${expanded ? 'lg:max-h-[82vh]' : 'max-h-[75vh]'}`}
                    />
                  </button>
                  {images.length > 1 && (
                    <>
                      <span className="absolute top-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                        {activeSlide + 1} / {images.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveSlide(-1)}
                        aria-label={t('Sebelumnya')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/55 text-white hover:bg-black/75 flex items-center justify-center backdrop-blur-sm transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlide(1)}
                        aria-label={t('Berikutnya')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/55 text-white hover:bg-black/75 flex items-center justify-center backdrop-blur-sm transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">
                        {images.map((url, idx) => (
                          <button
                            key={`${url}-${idx}`}
                            type="button"
                            aria-label={`${t('Gambar')} ${idx + 1}`}
                            onClick={() => setSlideIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === activeSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Details & Actions / Right Column */}
            <div className={`${hasMedia ? 'lg:col-span-5' : 'lg:col-span-12'} p-4 sm:p-6 flex flex-col gap-3.5 min-w-0`}>
              {/* Action row like Pinterest */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-text-primary">
                  <button type="button" onClick={toggleLike} className={`inline-flex items-center gap-1.5 py-1.5 px-2 rounded-full hover:bg-surface-container-low ${post.is_liked_by_me ? 'text-error' : ''}`}>
                    <Heart className={`w-5 h-5 ${post.is_liked_by_me ? 'fill-current' : ''}`} />
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button type="button" onClick={() => user ? setCommentsOpen(v => !v) : navigate('/login')} className="inline-flex items-center gap-1.5 py-1.5 px-2 rounded-full hover:bg-surface-container-low">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments_count || 0}</span>
                  </button>
                  <button type="button" onClick={() => setModal('share')} aria-label={t('Bagikan')} className="p-2 rounded-full hover:bg-surface-container-low">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label={t('Opsi postingan')} className="p-2 rounded-full hover:bg-surface-container-low">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                      <div className="absolute left-0 top-10 z-20 w-48 rounded-xl border border-border-subtle bg-white dark:bg-surface-card py-1 shadow-lg text-sm">
                        <button type="button" onClick={() => { setMenuOpen(false); setModal('repost'); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low"><Repeat2 className="w-4 h-4" />Repost</button>
                        <button type="button" onClick={async () => { setMenuOpen(false); const r = await postApi.share(token, 'copy'); await copyToClipboard(r.share_url); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low"><LinkIcon className="w-4 h-4" />{t('Salin link')}</button>
                        {post.visibility !== 'followers' && <button type="button" onClick={() => { setMenuOpen(false); setModal('embed'); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low"><Code className="w-4 h-4" />Embed</button>}
                        {isMine && <button type="button" onClick={() => { setMenuOpen(false); setModal('edit'); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low"><Pencil className="w-4 h-4" />{t('Edit postingan')}</button>}
                        {isMine ? <button type="button" onClick={removePost} className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-surface-container-low"><Trash2 className="w-4 h-4" />{t('Hapus postingan')}</button>
                          : <button type="button" onClick={() => { setMenuOpen(false); setModal('report'); }} className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-surface-container-low"><Flag className="w-4 h-4" />{t('Laporkan')}</button>}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSave}
                  className={`rounded-full px-5 py-2 text-xs font-bold text-white transition-colors ${post.is_saved_by_me ? 'bg-neutral-800 hover:bg-neutral-900' : 'bg-[#e60023] hover:brightness-110'}`}
                >
                  {post.is_saved_by_me ? t('Tersimpan') : t('Simpan')}
                </button>
              </div>

              {/* Author row */}
              <div className="flex items-center gap-2.5">
                <Link to={profileUrl(post.user || { id: post.user_id })} className="shrink-0">
                  <img src={post.user?.avatar_url || `${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-8 h-8 rounded-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={profileUrl(post.user || { id: post.user_id })} className="text-sm font-bold text-text-primary hover:underline inline-flex items-center gap-1">
                    <span className="truncate">{post.user?.name || t('Pengguna')}</span>
                    {post.user?.is_blue_verified && <VerifiedBadge size={14} />}
                  </Link>
                  <div className="text-[11px] text-text-secondary">@{post.user?.username} · {timeAgo(post.created_at, language)}</div>
                </div>
              </div>

              {/* Title & Expandable Description */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-lg font-extrabold text-text-primary leading-snug">{post.title || t('Postingan')}</h1>
                  {post.content && (
                    <button type="button" onClick={() => setExpanded(v => !v)} aria-label={t('Lihat selengkapnya')} className="p-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-text-secondary shrink-0">
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {post.content && (
                  <div
                    onClick={() => setExpanded(v => !v)}
                    className={`mt-2 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words cursor-pointer ${expanded ? '' : 'line-clamp-3'}`}
                  >
                    <RichText text={post.content} />
                  </div>
                )}
              </div>

              {/* Shop details or External link CTA */}
              {post.shop && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-primary">{formatPrice(post.shop.price_minor, post.shop.currency)}</span>
                    <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-bold">{post.shop.condition === 'new' ? t('Baru') : t('Bekas')}</span>
                  </div>
                  <button type="button" onClick={openSellerChat} disabled={busy} className="w-full py-2.5 rounded-full bg-[#e6192b] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isMine ? t('Kirim Produk ke Chat') : t('Chat Penjual / Beli')}</span>
                  </button>
                </div>
              )}

              {externalLink && (
                <a
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="w-full py-3 px-4 rounded-full bg-surface-container-low hover:bg-surface-container text-text-primary font-bold text-sm text-center inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('Buka situs')}</span>
                </a>
              )}

              {/* Comments */}
              <div className="pt-2 border-t border-border-subtle/20">
                <button type="button" onClick={() => user ? setCommentsOpen(v => !v) : navigate('/login')} className="text-xs font-bold text-text-secondary hover:text-text-primary">
                  {commentsOpen ? t('Sembunyikan komentar') : `${t('Lihat komentar')} (${post.comments_count || 0})`}
                </button>
                {commentsOpen && (
                  <div className="mt-3">
                    <CommentThread postId={token} postOwnerId={post.user_id} onCountChange={d => setPost(c => c ? { ...c, comments_count: Math.max(0, (c.comments_count || 0) + d) } : c)} />
                  </div>
                )}
              </div>
            </div>
          </article>
        )}

        {/* Author's other posts in Pinterest masonry grid (2 cols mobile, up to 6 cols desktop) */}
        {post && authorPosts.length > 0 && (
          <section className="w-full pt-2">
            <h2 className="text-base font-bold text-text-primary mb-4">
              {t('Lainnya untuk dijelajahi')} · {post.user?.name || `@${post.user?.username}`}
            </h2>
            <MasonryGrid
              items={authorPosts}
              renderItem={item => (
                <div key={item.id} className="min-w-0">
                  <DiscoveryCard
                    post={item}
                    product={item.post_type === 'shop'}
                    onUpdated={updated => setAuthorPosts(curr => curr.map(p => p.id === updated.id ? updated : p))}
                  />
                </div>
              )}
            />
          </section>
        )}
      </div>

      {modal === 'share' && post && <ShareModal postId={token} onClose={() => setModal('')} onShared={r => setPost(c => c ? { ...c, shares_count: r?.shares_count ?? ((c.shares_count || 0) + 1) } : c)} />}
      {modal === 'embed' && post && <EmbedModal postId={token} onClose={() => setModal('')} />}
      {modal === 'report' && post && <ReportModal postId={token} onClose={() => setModal('')} />}
      {modal === 'repost' && post && <RepostModal postId={token} onClose={() => setModal('')} onReposted={() => setModal('')} />}
      {modal === 'edit' && post && <CreatePostModal isOpen editPost={post} onClose={() => setModal('')} onSaved={saved => { setPost(saved); setModal(''); }} />}
      {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} />}
    </AppLayout>
  );
}
