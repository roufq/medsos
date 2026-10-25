import Toast from '../common/Toast';
import { postUrl } from '../../utils/postUrl';
import { copyToClipboard } from '../../utils/clipboard';
import { useLanguage } from "../../context/LanguageContext";import { profileUrl } from '../../utils/profileUrl';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Repeat2, Share2, Bookmark, BookmarkCheck, MoreHorizontal, Pencil, Trash2,
  Code, Flag, Link as LinkIcon, Eye, MapPin, Globe, Users, X, ChevronLeft, ChevronRight, Loader2, ShoppingBag } from
'lucide-react';
import { postApi } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { RichText, formatPrice, timeAgo } from '../../utils/postFormat';
import CommentThread from './CommentThread';
import CreatePostModal from './CreatePostModal';
import { EmbedModal, ReportModal, RepostModal, ShareModal } from './PostActionModals';

interface PostCardProps {
  post: any;
  onDeleted?: (postId: number) => void;
  onUpdated?: (post: any) => void;
  onReposted?: (post: any) => void;
  defaultCommentsOpen?: boolean;
  hideMedia?: boolean;
}

const FULFILLMENT_LABELS: Record<string, string> = { pickup: 'Ambil langsung', cod: 'COD', shipping: 'Jasa ekspedisi' };
const VIEWED_KEY = 'viewed-posts';

function alreadyViewed(id: number): boolean {
  try {return (JSON.parse(sessionStorage.getItem(VIEWED_KEY) || '[]') as number[]).includes(id);} catch {return false;}
}
function markViewed(id: number) {
  try {
    const ids = JSON.parse(sessionStorage.getItem(VIEWED_KEY) || '[]') as number[];
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...ids.slice(-500), id]));
  } catch {/* storage unavailable: views may be re-sent, the backend dedupes */}
}

export function MediaGallery({ media, onOpen }: {media: any[];onOpen: (index: number) => void;}) {
  const images = media.filter((m) => m.media_type === 'image');
  const video = media.find((m) => m.media_type === 'video');
  return (
    <div className="poster-media flex flex-col gap-2 mb-4">
      {video &&
      <div className="relative rounded-xl overflow-hidden bg-black">
          {video.processing_status === 'ready' ?
        <video src={video.media_url} controls preload="metadata" playsInline className="w-full max-h-[520px]" /> :

        <div className="aspect-video flex flex-col items-center justify-center gap-2 text-white/80 text-sm">
              {video.processing_status === 'failed' ? 'Video gagal diproses.' : <><Loader2 className="w-6 h-6 animate-spin" />Video sedang diproses…</>}
            </div>
        }
          {video.is_short && <span className="absolute top-2 left-2 rounded-full bg-error px-2 py-0.5 text-[10px] font-black text-white">SHORT</span>}
        </div>
      }
      {images.length > 0 &&
      <div className={`grid gap-1 rounded-xl overflow-hidden ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.slice(0, 4).map((image, index) =>
        <button key={image.id || image.media_url} type="button" onClick={() => onOpen(index)} className={`relative bg-surface-container-low ${images.length === 3 && index === 0 ? 'row-span-2' : ''}`}>
              <img src={image.media_url} alt="" loading="lazy" className={`w-full h-full object-cover ${images.length === 1 ? 'max-h-[520px]' : 'aspect-square'}`} />
              {index === 3 && images.length > 4 && <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-black">+{images.length - 4}</span>}
            </button>
        )}
        </div>
      }
    </div>);

}

export function Lightbox({ images, index, onClose }: {images: string[];index: number;onClose: () => void;}) {const { t } = useLanguage();
  const [current, setCurrent] = useState(index);
  const move = (step: number) => setCurrent((value) => (value + step + images.length) % images.length);
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button type="button" className="absolute top-5 right-5 text-white bg-black/50 rounded-full p-2" onClick={onClose} aria-label={t("Tutup")}><X className="w-6 h-6" /></button>
      {images.length > 1 && <button type="button" className="absolute left-4 text-white bg-black/50 rounded-full p-2" onClick={(e) => {e.stopPropagation();move(-1);}} aria-label="Sebelumnya"><ChevronLeft className="w-6 h-6" /></button>}
      <img src={images[current]} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && <button type="button" className="absolute right-4 text-white bg-black/50 rounded-full p-2" onClick={(e) => {e.stopPropagation();move(1);}} aria-label="Berikutnya"><ChevronRight className="w-6 h-6" /></button>}
    </div>);

}

function LinkPreview({ link }: {link: any;}) {
  let host = link.url;
  try {host = new URL(link.url).hostname.replace(/^www\./, '');} catch {/* keep raw */}
  const pending = link.preview_status === 'pending' || link.preview_status === 'processing';
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer nofollow ugc" className="block mb-4 border border-border-subtle/60 rounded-xl overflow-hidden hover:border-primary transition-colors">
      {link.image_url && link.preview_status === 'ready' && <img src={link.image_url} alt="" loading="lazy" className="w-full aspect-[1.91/1] object-cover" referrerPolicy="no-referrer" />}
      <div className="p-3 bg-surface-container-low">
        <div className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">{link.site_name || host}</div>
        <div className="font-bold text-sm text-text-primary">{link.title || (pending ? 'Mengambil pratinjau…' : link.url)}</div>
        {link.description && <p className="text-xs text-text-secondary line-clamp-2 mt-1">{link.description}</p>}
      </div>
    </a>);

}

function ShopDetails({ shop }: {shop: any;}) {const { t } = useLanguage();
  const fulfillment = (shop.fulfillment || '').split(',').filter(Boolean).map((v: string) => FULFILLMENT_LABELS[v] || v);
  return (
    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-primary">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xl font-black text-primary">{formatPrice(shop.price_minor, shop.currency)}</span>
        <span className={`rounded-full px-2 py-0.5 font-bold ${shop.condition === 'new' ? 'bg-success/15 text-success' : 'bg-surface-container text-text-secondary'}`}>{shop.condition === 'new' ? t("Baru") : t("Bekas")}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-text-secondary">
        <span>Kategori: <strong className="text-text-primary">{shop.category}</strong></span>
        {shop.brand && <span>Merek: <strong className="text-text-primary">{shop.brand}</strong></span>}
        {shop.stock !== undefined && shop.stock !== null && <span>Stok: <strong className="text-text-primary">{shop.stock}</strong></span>}
        {fulfillment.length > 0 && <span>Pengiriman: <strong className="text-text-primary">{fulfillment.join(', ')}</strong></span>}
        {shop.payment_method && <span>Pembayaran: <strong className="text-text-primary">{shop.payment_method}</strong></span>}
      </div>
    </div>);

}

function OriginalPost({ post }: {post: any;}) {
  if (!post) return <div className="mb-4 rounded-xl border border-dashed border-border-subtle p-3 text-xs text-text-secondary">Postingan asli sudah tidak tersedia.</div>;
  const firstImage = post.media?.find((m: any) => m.media_type === 'image');
  return (
    <Link to={postUrl(post)} className="block mb-4 rounded-xl border border-border-subtle/60 p-3 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <img src={post.user?.avatar_url || `${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-6 h-6 rounded-full object-cover" />
        <span className="text-xs font-bold">{post.user?.name}</span>
        <span className="text-[11px] text-text-secondary">{timeAgo(post.created_at)}</span>
      </div>
      {post.title && <div className="font-bold text-sm mb-1">{post.title}</div>}
      <p className="text-xs text-text-secondary line-clamp-3">{post.content}</p>
      {firstImage && <img src={firstImage.media_url} alt="" loading="lazy" className="mt-2 w-full max-h-64 object-cover rounded-lg" />}
    </Link>);

}

export default function PostCard({ post: initialPost, onDeleted, onUpdated, onReposted, defaultCommentsOpen, hideMedia }: PostCardProps) {const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(initialPost);
  const [commentsOpen, setCommentsOpen] = useState(Boolean(defaultCommentsOpen));
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<'' | 'share' | 'embed' | 'report' | 'repost' | 'edit'>('');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => setPost(initialPost), [initialPost]);

  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keydown); };
  }, [menuOpen]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = window.setTimeout(() => setActionNotice(''), 2000);
    return () => window.clearTimeout(timeout);
  }, [actionNotice]);

  const isMine = post.user_id === user?.id;
  const isRepost = Boolean(post.repost_of_id);
  const postToken = post.public_hash || post.id;

  // Count a view once the post has been at least half visible for a second.
  useEffect(() => {
    const node = cardRef.current;
    if (!node || alreadyViewed(post.id) || typeof IntersectionObserver === 'undefined') return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timer = window.setTimeout(async () => {
          observer.disconnect();
          markViewed(post.id);
          try {
            const { views_count } = await postApi.recordView(postToken);
            setPost((current: any) => ({ ...current, views_count }));
          } catch {/* best effort */}
        }, 1000);
      } else if (timer) {
        window.clearTimeout(timer);
      }
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => {observer.disconnect();if (timer) window.clearTimeout(timer);};
  }, [post.id, postToken]);

  const update = (changes: any) => {
    const next = { ...post, ...changes };
    setPost(next);
    onUpdated?.(next);
  };

  const toggleLike = async () => {
    const wasLiked = Boolean(post.is_liked_by_me);
    const otherLikes = Math.max(0, (post.likes_count || 0) - (wasLiked ? 1 : 0));
    update({ is_liked_by_me: !wasLiked, likes_count: otherLikes + (wasLiked ? 0 : 1) });
    try {
      const result = await postApi.toggleLike(postToken);
      update({ is_liked_by_me: result.liked, likes_count: otherLikes + (result.liked ? 1 : 0) });
    } catch (err: any) {
      update({ is_liked_by_me: wasLiked, likes_count: otherLikes + (wasLiked ? 1 : 0) });
      alert(err?.response?.data?.error || 'Gagal menyukai postingan');
    }
  };

  const toggleSave = async () => {
    if (actionBusy) return;
    setMenuOpen(false); setActionBusy(true); setActionNotice(''); setActionError('');
    try {
      const { saved } = await postApi.toggleSave(postToken);
      update({ is_saved_by_me: saved });
      setActionNotice(saved ? 'Postingan disimpan.' : 'Postingan dihapus dari tersimpan.');
    } catch (err: any) {
      setActionError(err?.response?.data?.error || 'Gagal menyimpan postingan.');
    } finally { setActionBusy(false); }
  };

  const remove = async () => {
    setMenuOpen(false);
    if (!window.confirm('Hapus postingan ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await postApi.deletePost(postToken);
      onDeleted?.(post.id);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal menghapus postingan');
    }
  };

  const copyLink = async () => {
    if (actionBusy) return;
    setMenuOpen(false); setActionBusy(true); setActionNotice(''); setActionError('');
    try {
      const result = await postApi.share(postToken, 'copy');
      await copyToClipboard(result.share_url);
      setActionNotice('Link berhasil disalin.');
    } catch (err: any) { setActionError(err?.response?.data?.error || 'Gagal menyalin link.'); }
    finally { setActionBusy(false); }
  };

  const content: string = post.content || '';
  const long = content.length > 600;
  const images = (post.media || []).filter((m: any) => m.media_type === 'image').map((m: any) => m.media_url);
  const menuItem = 'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-container-low text-left';

  return (
    <article ref={cardRef} className="poster-post bg-white rounded-2xl border border-border-subtle/20 p-5">
      {isRepost &&
      <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary mb-3"><Repeat2 className="w-4 h-4" />{post.user?.name} merepost</div>
      }
      <header className="flex justify-between items-start mb-3">
        <div className="flex gap-3 min-w-0">
          <Link to={profileUrl(post.user || { id: post.user_id })} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src={post.user?.avatar_url || `${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </Link>
          <div className="min-w-0">
            <Link to={profileUrl(post.user || { id: post.user_id })} className="font-bold text-text-primary text-sm hover:underline inline-flex items-center gap-1">{post.user?.name || 'Pengguna'}{post.user?.is_blue_verified && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] leading-none" title="Terverifikasi Centang Biru" aria-label="Centang Biru">✓</span>}</Link>
            {post.user?.username && <span className="ml-1 text-xs text-text-secondary">@{post.user.username}</span>}
            <div className="flex flex-wrap items-center text-xs text-text-secondary gap-1 mt-0.5">
              <Link to={postUrl(post)} className="hover:underline">{timeAgo(post.created_at)}</Link>
              <span>•</span>
              {post.visibility === 'followers' ? <Users className="w-3 h-3" aria-label={t("Hanya pengikut")} /> : <Globe className="w-3 h-3" aria-label={t("Publik")} />}
              {post.location &&
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:underline">
                  <MapPin className="w-3 h-3" />{post.location}
                </a>
              }
              {post.post_type === 'shop' && <Link to="/shop" className="flex items-center gap-0.5 font-bold text-primary hover:underline" aria-label="Lihat produk di Shop"><ShoppingBag className="w-3 h-3" />Shop</Link>}
            </div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button type="button" aria-haspopup="menu" aria-expanded={menuOpen} disabled={actionBusy} onClick={() => setMenuOpen((open) => !open)} className="p-1.5 rounded-full hover:bg-surface-container text-text-secondary" aria-label={t("Opsi postingan")}><MoreHorizontal className="w-5 h-5" /></button>
          {menuOpen &&
          <div className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-border-subtle bg-white py-1 shadow-lg" role="menu" aria-label={t("Opsi postingan")}>
              {isMine && !isRepost && <button type="button" role="menuitem" className={menuItem} onClick={() => {setMenuOpen(false);setModal('edit');}}><Pencil className="w-4 h-4" />{t("Edit postingan")}</button>}
              {isMine && <button type="button" role="menuitem" className={`${menuItem} text-error`} onClick={remove}><Trash2 className="w-4 h-4" />{t("Hapus postingan")}</button>}
              <button type="button" role="menuitem" className={menuItem} onClick={toggleSave}>{post.is_saved_by_me ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}{post.is_saved_by_me ? t('Hapus dari tersimpan') : t("Simpan postingan")}</button>
              <button type="button" role="menuitem" className={menuItem} onClick={copyLink}><LinkIcon className="w-4 h-4" />{t("Salin link")}</button>
              {post.visibility !== 'followers' && <button type="button" role="menuitem" className={menuItem} onClick={() => {setMenuOpen(false);setModal('embed');}}><Code className="w-4 h-4" />Embed</button>}
              {!isMine && <button type="button" role="menuitem" className={`${menuItem} text-error`} onClick={() => {setMenuOpen(false);setModal('report');}}><Flag className="w-4 h-4" />{t("Laporkan")}</button>}
            </div>
          }
        </div>
      </header>

      {actionNotice && <Toast message={t(actionNotice)} onDismiss={() => setActionNotice('')} />}
      {actionError && <p role="alert" className="mb-3 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{t(actionError)}</p>}
      {post.title && !isRepost && <h3 className="text-lg font-bold text-text-primary mb-2 leading-snug"><Link to={postUrl(post)} className="hover:underline">{post.title}</Link></h3>}
      {content &&
      <div className="text-sm text-text-primary leading-relaxed mb-3 whitespace-pre-wrap break-words">
          <RichText text={long && !expanded ? content.slice(0, 600) + '…' : content} />
          {long && <button type="button" onClick={() => setExpanded((v) => !v)} className="ml-1 text-primary font-semibold text-xs">{expanded ? 'Lebih sedikit' : 'Lihat selengkapnya'}</button>}
        </div>
      }

      {isRepost ? <OriginalPost post={post.original_post} /> :
      <>
          {post.shop && <ShopDetails shop={post.shop} />}
          {!hideMedia && (post.media || []).length > 0 && <MediaGallery media={post.media} onOpen={setLightbox} />}
          {post.link && <LinkPreview link={post.link} />}
          {((post.hashtags || []).length > 0 || (post.mentions || []).length > 0) &&
        <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
              {(post.hashtags || []).map((h: any) => <Link key={h.tag} to={`/search?q=${encodeURIComponent('#' + h.tag)}`} className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">#{h.tag}</Link>)}
              {(post.mentions || []).map((m: any) => m.user?.username && <Link key={m.mentioned_user_id} to={profileUrl(m.user)} className="rounded-full bg-surface-container px-2 py-0.5 font-semibold text-text-primary">@{m.user.username}</Link>)}
            </div>
        }
        </>
      }

      <div className="flex justify-between items-center text-xs text-text-secondary pb-3 border-b border-border-subtle/20">
        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-error text-error" />{post.likes_count || 0}</span>
        <span className="flex gap-3">
          <button type="button" onClick={() => setCommentsOpen((v) => !v)} className="hover:underline">{post.comments_count || 0} komentar</button>
          <span>{post.shares_count || 0} dibagikan</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views_count || 0}</span>
        </span>
      </div>

      <div className="poster-post-actions grid grid-cols-5 gap-1 pt-2 text-xs sm:text-sm font-semibold">
        <button type="button" onClick={toggleLike} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-surface-container-low ${post.is_liked_by_me ? 'text-error' : 'text-text-secondary'}`} aria-pressed={Boolean(post.is_liked_by_me)}>
          <Heart className={`w-4 h-4 ${post.is_liked_by_me ? 'fill-current' : ''}`} /><span>{post.likes_count || 0}</span>
        </button>
        <button type="button" onClick={() => setCommentsOpen((v) => !v)} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-surface-container-low ${commentsOpen ? 'text-primary' : 'text-text-secondary'}`}>
          <MessageCircle className="w-4 h-4" /><span>{post.comments_count || 0}</span>
        </button>
        <button type="button" onClick={() => setModal('repost')} className="flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-surface-container-low text-text-secondary">
          <Repeat2 className="w-4 h-4" /><span className="hidden sm:inline">Repost</span>
        </button>
        <button type="button" onClick={() => setModal('share')} className="flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-surface-container-low text-text-secondary">
          <Share2 className="w-4 h-4" /><span>{post.shares_count || 0}</span>
        </button>
        <button type="button" onClick={toggleSave} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-surface-container-low ${post.is_saved_by_me ? 'text-primary' : 'text-text-secondary'}`} aria-pressed={Boolean(post.is_saved_by_me)}>
          {post.is_saved_by_me ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}<span className="hidden sm:inline">{t("Simpan")}</span>
        </button>
      </div>

      {commentsOpen && <CommentThread postId={postToken} postOwnerId={post.user_id} onCountChange={(delta) => update({ comments_count: Math.max(0, (post.comments_count || 0) + delta) })} />}

      {modal === 'share' && <ShareModal postId={isRepost && post.original_post ? (post.original_post.public_hash || post.original_post.id) : postToken} onClose={() => setModal('')} onShared={() => update({ shares_count: (post.shares_count || 0) + 1 })} />}
      {modal === 'embed' && <EmbedModal postId={postToken} onClose={() => setModal('')} />}
      {modal === 'report' && <ReportModal postId={postToken} onClose={() => setModal('')} />}
      {modal === 'repost' && <RepostModal postId={isRepost && post.original_post ? (post.original_post.public_hash || post.original_post.id) : postToken} onClose={() => setModal('')} onReposted={(created) => onReposted ? onReposted(created) : navigate(postUrl(created))} />}
      {modal === 'edit' && <CreatePostModal isOpen editPost={post} onClose={() => setModal('')} onSaved={(saved: any) => {setPost(saved);onUpdated?.(saved);setModal('');}} />}
      {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} />}
    </article>);

}
