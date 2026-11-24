import {notify} from '../../utils/feedback';
import {useFeedbackState} from '../../hooks/useFeedbackState';
import MentionInput from './MentionInput';
import { useLanguage } from "../../context/LanguageContext";import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Image as ImageIcon, Video, Link as LinkIcon, MapPin, Loader2, ShoppingBag, FileText, LocateFixed, Hash, AtSign, Plus, Save, Send, Heart, MessageCircle, Share2, Eye, MoreHorizontal, Crop } from 'lucide-react';
import HashtagInput from './HashtagInput';
import { postApi } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { RichText, formatPrice, POST_RULES as R, countChars, countWords, currencyDecimals, mergeTokens, parseTokens, toMinorUnits, tokensInText } from '../../utils/postFormat';

interface CreatePostModalProps {
  isOpen: boolean;
  initialType?: string;
  onTypeChange?: (type: string) => void;
  onClose: () => void;
  /** Called with the created or updated post returned by the API. */
  onSaved?: (post: any) => void;
  /** When set, the modal edits this post instead of creating one. */
  editPost?: any;
  currentUser?: any;
}

interface MediaItem {url: string;type: 'image' | 'video';duration: number;}

const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD', 'CNY', 'KRW', 'THB', 'PHP', 'VND', 'INR', 'SAR', 'AED'];
const CATEGORIES = ['Elektronik', 'Handphone & Aksesoris', 'Komputer & Laptop', 'Fashion Pria', 'Fashion Wanita', 'Fashion Anak', 'Kecantikan', 'Kesehatan', 'Rumah & Dapur', 'Otomotif', 'Olahraga & Outdoor', 'Hobi & Koleksi', 'Buku & Alat Tulis', 'Makanan & Minuman', 'Ibu & Bayi', 'Properti', 'Jasa', 'Lainnya'];
const FULFILLMENT = [{ id: 'pickup', label: 'Ambil langsung' }, { id: 'cod', label: 'COD' }, { id: 'shipping', label: 'Jasa ekspedisi' }];
const PAYMENTS = ['', 'Transfer bank', 'E-wallet', 'Tunai saat bertemu', 'Kartu kredit/debit', 'Postter Pay'];

const errorText = (error: any, fallback: string) => error?.response?.data?.error || error?.message || fallback;
const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const normalizeUrlInput = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes(':') || trimmed.startsWith('/')) return trimmed;
  if (trimmed.includes('.') && !/\s/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};
const isValidHttpUrl = (raw: string): boolean => {
  const normalized = normalizeUrlInput(raw);
  if (!normalized) return false;
  try {
    const u = new URL(normalized);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
  } catch {
    return false;
  }
};

// Reverse geocoding: Google Maps when VITE_GOOGLE_MAPS_API_KEY is configured,
// otherwise OpenStreetMap Nominatim (no key required).
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (key) {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|administrative_area_level_2&key=${key}`);
    const data = await res.json();
    if (data.results?.[0]?.formatted_address) return data.results[0].formatted_address;
  } else {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lng}`, { headers: { 'Accept-Language': navigator.language || 'id' } });
    const data = await res.json();
    const a = data.address || {};
    const place = [a.city || a.town || a.village || a.county, a.state, a.country].filter(Boolean).join(', ');
    if (place) return place;
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export default function CreatePostModal({ isOpen, onClose, onSaved, editPost, initialType, onTypeChange }: CreatePostModalProps) {const { t, language } = useLanguage();
  const { user } = useAuth();
  const isEdit = Boolean(editPost);
  const [activeType, setActiveType] = useState('image');
  const [activeDetail, setActiveDetail] = useState('');
  const [draftMessage, setDraftMessage] = useFeedbackState('', 'success');
  const descriptionInput = useRef<HTMLTextAreaElement>(null);
  const draftKey = `theposter-draft-${user?.id || 'local'}`;
  const [mode, setMode] = useState<'post' | 'shop'>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [hashtagInput, setHashtagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [shop, setShop] = useState({ price: '', currency: 'IDR', category: '', condition: '', stock: '', brand: '', fulfillment: [] as string[], payment: '' });
  const [uploading, setUploading] = useState(0);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useFeedbackState('', 'error');
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const mediaTouched = useRef(false);

  const sections = useRef<Record<string, any>>({});
  const initializedKey = useRef('');
  const sectionVersion = useRef(0);
  const captureSection = () => ({ title, content, media, linkUrl, linkPreview, hashtagInput, mentionInput, location, visibility, shop, activeDetail });
  const restoreSection = (type: string, draft: any = {}) => {
    sectionVersion.current++;
    setTitle(draft.title || '');setContent(draft.content || '');setMedia(draft.media || []);
    setLinkUrl(draft.linkUrl || '');setLinkPreview(draft.linkPreview || null);
    setHashtagInput(draft.hashtagInput || '');setMentionInput(draft.mentionInput || '');
    setLocation(draft.location || '');setVisibility(draft.visibility || 'public');
    setShop(draft.shop || { price: '', currency: 'IDR', category: '', condition: '', stock: '', brand: '', fulfillment: [], payment: '' });
    setMode(type === 'shop' ? 'shop' : 'post');setActiveType(type);
    setActiveDetail(draft.activeDetail || (type === 'link' || type === 'location' ? type : ''));
    setError('');setDraftMessage('');
  };

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    mediaTouched.current = false;
    setDraftMessage('');
    if (!editPost) {
      if (initializedKey.current === draftKey) {
        if (initialType && initialType !== activeType) selectType(initialType);else
        onTypeChange?.(activeType);
        return;
      }
      initializedKey.current = draftKey;
      sections.current = {};
      let restoredType = initialType || 'image';
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
        if (draft) {
          sections.current = draft.sections || { [draft.activeType || 'image']: draft };
          restoredType = initialType || draft.activeType || 'image';
        }
      } catch {/* Start with empty sections if browser storage is unavailable. */}
      restoreSection(restoredType, sections.current[restoredType]);
      onTypeChange?.(restoredType);
      return;
    }
    setMode(editPost.post_type === 'shop' ? 'shop' : 'post');
    setTitle(editPost.title || '');
    setContent(editPost.content || '');
    setMedia((editPost.media || []).map((m: any) => ({ url: m.media_url, type: m.media_type, duration: m.duration_seconds || 0 })));
    setLinkUrl(editPost.link?.url || '');
    setHashtagInput((editPost.hashtags || []).map((h: any) => '#' + h.tag).join(' '));
    setMentionInput((editPost.mentions || []).map((m: any) => m.user?.username && '@' + m.user.username).filter(Boolean).join(' '));
    setLocation(editPost.location || '');
    setVisibility(editPost.visibility || 'public');
    if (editPost.shop) {
      const s = editPost.shop;
      setShop({
        price: String(s.price_minor / 10 ** currencyDecimals(s.currency)), currency: s.currency, category: s.category, condition: s.condition,
        stock: s.stock ?? '', brand: s.brand || '', fulfillment: (s.fulfillment || '').split(',').filter(Boolean), payment: s.payment_method || ''
      });
    }
  }, [isOpen, editPost, draftKey, initialType]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const keydown = (event: KeyboardEvent) => {if (event.key === 'Escape' && !submitting && !uploading) onClose();};
    document.addEventListener('keydown', keydown);
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('.new-post-close')?.focus());
    return () => {document.body.style.overflow = previous;document.removeEventListener('keydown', keydown);cancelAnimationFrame(frame);previousFocus?.focus();};
  }, [isOpen, onClose, submitting, uploading]);

  const isShop = mode === 'shop';
  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');
  const chars = countChars(content);
  const words = countWords(content);
  const hashtags = useMemo(() => mergeTokens(parseTokens(hashtagInput, '#'), tokensInText(content, '#')), [hashtagInput, content]);
  const mentions = useMemo(() => mergeTokens(parseTokens(mentionInput, '@'), tokensInText(content, '@')), [mentionInput, content]);
  const maxTags = isShop ? R.shopHashtagsMax : R.hashtagsMax;
  const minMentions = isShop ? 0 : R.mentionsMin;
  const normalizedLinkUrl = normalizeUrlInput(linkUrl);
  const postType = isShop ? 'shop' : videos.length ? 'video' : images.length ? 'image' : normalizedLinkUrl ? 'link' : 'text';

  const problems: string[] = [];
  const titleLength = [...title.trim()].length;
  if (titleLength < R.titleMin || titleLength > R.titleMax) problems.push(`Judul wajib ${R.titleMin}–${R.titleMax} karakter.`);
  if (isShop ? chars === 0 : chars < R.descriptionMinChars) problems.push(isShop ? 'Deskripsi produk wajib diisi.' : language === 'en' ? `Description requires at least ${R.descriptionMinChars} characters (currently ${chars}).` : `Deskripsi minimal ${R.descriptionMinChars} karakter (sekarang ${chars}).`);
  if (words > R.descriptionMaxWords) problems.push(language === 'en' ? `Description allows at most ${R.descriptionMaxWords} words.` : `Deskripsi maksimal ${R.descriptionMaxWords} kata.`);
  if (hashtags.length < R.hashtagsMin || hashtags.length > maxTags) problems.push(`Hashtag wajib ${R.hashtagsMin}–${maxTags} (sekarang ${hashtags.length}).`);
  if (mentions.length < minMentions || mentions.length > R.mentionsMax) problems.push(`Mention maksimal ${R.mentionsMax} akun dengan @username (sekarang ${mentions.length}).`);
  if (activeType === 'link' && !normalizedLinkUrl && media.length === 0) problems.push('Alamat tautan (URL) wajib diisi.');
  if (linkUrl.trim() && !isValidHttpUrl(linkUrl)) problems.push('Format tautan tidak valid (contoh: https://postter.us).');
  if (!isShop && videos.length > 0 && images.length > 0) problems.push('Postingan video tidak bisa digabung dengan gambar.');
  if (isShop) {
    if (images.length < 1) problems.push('Produk wajib memiliki 1–6 gambar.');
    if (videos.length > 1) problems.push('Maksimal 1 video produk.');
    if (videos[0] && (videos[0].duration < R.shopVideoMin || videos[0].duration > R.shopVideoMax)) problems.push(`Video produk harus ${R.shopVideoMin}–${R.shopVideoMax} detik.`);
    if (toMinorUnits(shop.price, shop.currency) <= 0) problems.push('Harga wajib diisi.');
    if (!shop.category) problems.push('Pilih kategori produk.');
    if (!shop.condition) problems.push('Pilih kondisi barang (baru/bekas).');
  }

  const autoLinkRef = useRef({ title: '', description: '' });
  const linkRequestRef = useRef(0);
  useEffect(() => {
    const normalized = normalizeUrlInput(linkUrl);
    if (!isOpen || !isValidHttpUrl(normalized)) return;
    const timer = window.setTimeout(() => { void previewLink(normalized, false); }, 650);
    return () => { window.clearTimeout(timer); linkRequestRef.current++; };
  }, [linkUrl, isOpen]);


  if (!isOpen) return null;

  const upload = async (files: FileList | null, kind: 'image' | 'video') => {
    if (!files?.length) return;
    setError('');
    const room = kind === 'image' ? R.imagesMax - images.length : 1 - videos.length;
    const selected = Array.from(files).slice(0, Math.max(0, room));
    if (selected.length === 0) {
      setError(kind === 'image' ? `Maksimal ${R.imagesMax} gambar.` : 'Maksimal 1 video.');
      return;
    }
    let uploadedCount = 0;
    setUploading((n) => n + selected.length);
    const uploaded = await Promise.all(selected.map(async (file) => {
      try {
        const res = await postApi.uploadMedia(file);
        if (res.media_type !== kind) throw new Error(kind === 'image' ? 'File bukan gambar.' : 'File bukan video.');
        uploadedCount++;
        return { url: res.url, type: res.media_type, duration: res.duration_seconds || 0 };
      } catch (err) {
        setError(errorText(err, `Gagal mengunggah ${file.name}`));
        return null;
      } finally {
        setUploading((n) => n - 1);
      }
    }));
    const valid = uploaded.filter(Boolean) as { url: string; type: string; duration: number }[];
    if (valid.length) {
      mediaTouched.current = true;
      setMedia((current) => [...current, ...valid]);
    }
    if (uploadedCount) notify.success('Media berhasil diunggah.');
  };

  const removeMedia = (url: string) => {mediaTouched.current = true;setMedia((current) => current.filter((m) => m.url !== url));};

  const previewLink = async (overrideUrl?: string, manual = true) => {
    const targetUrl = normalizeUrlInput(overrideUrl ?? linkUrl);
    if (!targetUrl || !isValidHttpUrl(targetUrl)) {
      if (manual) setError('Format tautan tidak valid (contoh: https://postter.us).');
      return;
    }
    if (manual && targetUrl !== linkUrl) setLinkUrl(targetUrl);
    const version = sectionVersion.current;
    const request = ++linkRequestRef.current;
    setLinkPreview(null);
    if (manual) setError('');
    try {
      const preview = await postApi.getLinkPreview(targetUrl);
      if (version === sectionVersion.current && request === linkRequestRef.current) {
        const previous = autoLinkRef.current;
        const next = { title: (preview.title || '').slice(0, R.titleMax), description: preview.description || '' };
        setLinkPreview(preview);
        if (next.title) setTitle((current) => !current.trim() || current === previous.title ? next.title : current);
        if (next.description) setContent((current) => !current.trim() || current === previous.description ? next.description : current);
        autoLinkRef.current = next;
      }
    } catch (err) {
      if (manual && version === sectionVersion.current && request === linkRequestRef.current) {
        setError(errorText(err, 'Pratinjau link gagal'));
      }
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {setError('Browser tidak mendukung lokasi.');return;}
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {setLocation(await reverseGeocode(pos.coords.latitude, pos.coords.longitude));} catch {setError('Gagal menentukan nama lokasi.');} finally {setLocating(false);}
    }, () => {setLocating(false);setError('Izin lokasi ditolak.');}, { timeout: 10000 });
  };

  const submit = async () => {
    if (problems.length) {setError(problems[0]);return;}
    setSubmitting(true);
    setError('');
    const shopPayload = isShop ? {
      price_minor: toMinorUnits(shop.price, shop.currency), currency: shop.currency, category: shop.category, condition: shop.condition,
      stock: shop.stock === '' ? null : Number(shop.stock), brand: shop.brand, fulfillment: shop.fulfillment.join(','), payment_method: shop.payment
    } : undefined;
    try {
      let saved;
      if (isEdit) {
        saved = await postApi.updatePost(editPost.public_hash || editPost.id, {
          title: title.trim(), content: content.trim(), hashtags, mentions, location: location.trim(), visibility,
          link_url: normalizedLinkUrl,
          ...(mediaTouched.current ? { media_urls: media.map((m) => m.url) } : {}),
          ...(shopPayload ? { shop: shopPayload } : {})
        });
      } else {
        saved = await postApi.createPost({
          title: title.trim(), content: content.trim(), post_type: postType, hashtags, mentions, location: location.trim(), visibility,
          link_url: normalizedLinkUrl,
          ...(isShop ? { image_urls: images.map((m) => m.url), video_url: videos[0]?.url || '', shop: shopPayload } : { media_urls: media.map((m) => m.url) })
        });
        delete sections.current[activeType];
        try {
          if (Object.keys(sections.current).length) localStorage.setItem(draftKey, JSON.stringify({ activeType, sections: sections.current }));else
          localStorage.removeItem(draftKey);
        } catch {/* posting succeeded */}
        setActiveDetail('');
        setTitle('');setContent('');setMedia([]);setLinkUrl('');setLinkPreview(null);setHashtagInput('');setMentionInput('');setLocation('');
        setShop({ price: '', currency: 'IDR', category: '', condition: '', stock: '', brand: '', fulfillment: [], payment: '' });
      }
      notify.success(isEdit?'Postingan berhasil diperbarui.':'Postingan berhasil diterbitkan.');
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(errorText(err, 'Gagal menyimpan postingan.'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    try {
      sections.current[activeType] = captureSection();
      localStorage.setItem(draftKey, JSON.stringify({ activeType, sections: sections.current }));
      setDraftMessage('Draft tersimpan di browser ini.');
    } catch {setError('Draft tidak dapat disimpan di browser ini.');}
  };
  const selectType = (type: string) => {
    if (type === activeType || uploading || submitting || locating) return;
    sections.current[activeType] = captureSection();
    restoreSection(type, sections.current[type]);
    onTypeChange?.(type);
    requestAnimationFrame(() => {
      const selector = type === 'link' ? '.new-post-detail-row input[placeholder="https://..."]' : type === 'location' ? '.new-post-detail-row input[data-field="location"]' : type === 'shop' ? '.new-post-shop-toggle' : '.new-post-media';
      document.querySelector(selector)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };
  const addToken = (prefix: string) => {
    setContent((value) => value + (value && !/\s$/.test(value) ? ' ' : '') + prefix);
    requestAnimationFrame(() => {descriptionInput.current?.focus();descriptionInput.current?.setSelectionRange(100000, 100000);});
  };

  const cropImage = async () => {
    const item = images[0];
    if (!item || uploading) return;
    setUploading((n) => n + 1);setError('');
    try {
      const image = new Image();image.crossOrigin = 'anonymous';image.src = item.url;
      await image.decode();
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement('canvas');canvas.width = size;canvas.height = size;
      const context = canvas.getContext('2d');if (!context) throw new Error('Crop tidak tersedia.');
      context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, size, size);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Crop gagal.')), 'image/jpeg', .9));
      const result = await postApi.uploadMedia(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
      mediaTouched.current = true;
      setMedia((current) => current.map((m) => m.url === item.url ? { url: result.url, type: 'image', duration: 0 } : m));
    } catch (err) {setError(errorText(err, 'Gagal memotong gambar.'));} finally
    {setUploading((n) => n - 1);}
  };

  const input = 'new-post-input';
  return (
    <div className="new-post-overlay" onClick={(event) => {if (event.target === event.currentTarget && !submitting && !uploading) onClose();}}>
      <div className="new-post-dialog" role="dialog" aria-modal="true" aria-labelledby="new-post-title" onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea, select, a[href]')).filter((item) => item.getClientRects().length > 0);
        const first = items[0];const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();} else
        if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
      }}>
        <button type="button" onClick={onClose} disabled={submitting || uploading > 0} className="new-post-close" aria-label={t("Tutup")}><X size={20} /></button>
        <div className="new-post-form">
          <h3 id="new-post-title" className="new-post-title">{isEdit ? t("Edit Postingan") : t("Buat Postingan Baru")}</h3>
          {!isEdit && <div className="new-post-types" aria-label={t("Jenis postingan")}>
            {[{ id: 'image', label: t("Gambar"), icon: ImageIcon }, { id: 'video', label: 'Video', icon: Video }, { id: 'poster', label: t("Poster"), icon: FileText }, { id: 'link', label: t("Link"), icon: LinkIcon }, { id: 'location', label: t("Lokasi"), icon: MapPin }, { id: 'shop', label: 'Shop', icon: ShoppingBag }].map(({ id, label, icon: Icon }) => <button key={id} type="button" disabled={uploading > 0 || submitting || locating} aria-pressed={activeType === id} className={activeType === id ? 'active' : ''} onClick={() => selectType(id)}><Icon size={19} />{t(label)}</button>)}
          </div>}
          <label className="new-post-field"><span>{isShop ? t("Nama Produk") : t("Judul Postingan")} <b>*</b></span><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={R.titleMax} placeholder={t("Judul postingan")} className={input} /><small>{titleLength}/{R.titleMax}</small></label>
          <label className="new-post-field"><span>{t("Deskripsi")}</span><textarea ref={descriptionInput} value={content} onChange={(e) => { setContent(e.target.value); setError(''); }} rows={7} placeholder={t("Bagikan cerita Anda, tambahkan #hashtag dan @username...")} className={input} /><small className="new-post-description-count">{chars} {t("karakter")}{!isShop ? ` (min. ${R.descriptionMinChars})` : ''}</small></label>
          <div className="new-post-tools">
            <button type="button" className={activeDetail === 'hashtag' ? 'active' : ''} onClick={() => {setActiveDetail('hashtag');requestAnimationFrame(() => document.getElementById('post-hashtag-entry')?.focus());}}><Hash size={16} />{t("Hashtag")}</button>
            <button type="button" className={activeDetail === 'link' || Boolean(linkUrl.trim()) ? 'active' : ''} onClick={() => {const next = activeDetail === 'link' ? '' : 'link'; setActiveDetail(next); if (next === 'link') requestAnimationFrame(() => document.getElementById('post-link-entry')?.focus());}}><LinkIcon size={16} />{t("Link")}</button>
            <button type="button" className={activeDetail === 'mention' ? 'active' : ''} onClick={() => {setActiveDetail('mention'); requestAnimationFrame(() => document.getElementById('post-mention-entry')?.focus());}}><AtSign size={16} />{t("Mention")}</button>
            <button type="button" className={activeDetail === 'location' || Boolean(location.trim()) ? 'active' : ''} onClick={() => setActiveDetail(activeDetail === 'location' ? '' : 'location')}><MapPin size={16} />{t("Location")}</button>
          </div>
          {(activeDetail === 'hashtag' || activeDetail === 'mention') && <div className="new-post-details"><HashtagInput value={hashtags.map((tag) => '#' + tag).join(' ')} onChange={(next) => {
              const allowed = new Set(parseTokens(next, '#'));
              setHashtagInput(next);
              setContent((current) => current.replace(/#[\p{L}\p{N}_]+/gu, (tag) => allowed.has(tag.slice(1).toLowerCase()) ? tag : ''));
            }} textTags={[]} maximum={maxTags} minimum={R.hashtagsMin} /><MentionInput value={mentionInput} onChange={setMentionInput} textMentions={tokensInText(content, '@')} maximum={R.mentionsMax} /></div>}
          {(activeDetail === 'link' || activeType === 'link' || Boolean(linkUrl)) && <div className="new-post-detail-row"><LinkIcon size={17} /><input id="post-link-entry" type="url" value={linkUrl} onChange={(e) => {setLinkUrl(e.target.value);setLinkPreview(null);setError('');}} onBlur={() => {if (linkUrl.trim()) setLinkUrl(normalizeUrlInput(linkUrl));}} onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault(); void previewLink(undefined, true);}}} placeholder="https://postter.us" className={input} />{linkUrl && <button type="button" onClick={() => {setLinkUrl('');setLinkPreview(null);}} title={t("Hapus tautan")} aria-label={t("Hapus tautan")}><X size={15} /></button>}<button type="button" onClick={() => void previewLink(undefined, true)} disabled={!linkUrl.trim()}>{t("Pratinjau")}</button></div>}
          {linkPreview && <div className="new-post-link-preview">{(linkPreview.image_url || linkPreview.image) && !(linkPreview.image_url || linkPreview.image).includes('google.com/s2/favicons') && <img src={linkPreview.image_url || linkPreview.image} alt="" />}<div><strong>{linkPreview.title || normalizedLinkUrl}</strong>{linkPreview.description && <p>{linkPreview.description}</p>}</div></div>}
          {(activeDetail === 'location' || activeType === 'location' || location) && <div className="new-post-detail-row"><MapPin size={17} /><input data-field="location" value={location} maxLength={255} onChange={(e) => setLocation(e.target.value)} placeholder={t("Lokasi")} className={input} /><button type="button" onClick={useMyLocation} disabled={locating}>{locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}{t("Lokasi saya")}</button></div>}
          <section className="new-post-media"><h4>{t("Media")}</h4><div className="new-post-media-grid">
            {media.map((m) => <div key={m.url} className="new-post-thumbnail">{m.type === 'image' ? <img src={m.url} alt={t("Media terunggah")} /> : <div><Video size={26} /><span>{formatDuration(m.duration)}</span></div>}<button type="button" onClick={() => removeMedia(m.url)} aria-label={t("Hapus media")}><X size={14} /></button></div>)}
            <button type="button" className="new-post-add-media" disabled={uploading > 0 || (activeType === 'video' ? videos.length > 0 || !isShop && images.length > 0 : images.length >= R.imagesMax || !isShop && videos.length > 0)} onClick={() => activeType === 'video' ? videoInput.current?.click() : imageInput.current?.click()}><Plus size={20} /><span>{t("Tambah Media")}</span><small>{activeType === 'video' ? t("Video, maks. 30 menit") : t("JPG, PNG, GIF, WebP")}<br />{activeType === 'video' ? t("Maks. 1 video") : t("Maks. 10 MB / gambar")}</small></button>
          </div>{images.length > 0 && <button type="button" className="new-post-crop" onClick={cropImage} disabled={uploading > 0} title={t("Potong gambar pertama menjadi persegi")}><Crop size={15} />{t("Crop persegi")}</button>}{uploading > 0 && <p className="new-post-uploading"><Loader2 size={16} className="animate-spin" />{t("Mengunggah")} {uploading} {t("file...")}</p>}</section>
          <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={(e) => {upload(e.target.files, 'image');e.target.value = '';}} />
          <input ref={videoInput} type="file" accept="video/*,.mkv,.flv,.wmv,.mxf,.ts" className="hidden" onChange={(e) => {upload(e.target.files, 'video');e.target.value = '';}} />
          <label className="new-post-shop-toggle"><input type="checkbox" checked={isShop} disabled={isEdit || uploading > 0 || submitting || locating} onChange={(e) => selectType(e.target.checked ? 'shop' : 'image')} /><span className="new-post-switch" /><span>{t("Tambahkan ke Shop")}<small>{t("Jika produk, akan ditampilkan di tab Shop")}</small></span></label>
        {isShop &&
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border-subtle/50 p-3">
            <label className="flex flex-col gap-1 text-xs font-bold">{t("Harga")}<span className="sr-only">{t("wajib")}</span>
              <div className="flex gap-2">
                <select value={shop.currency} onChange={(e) => setShop({ ...shop, currency: e.target.value })} className={`${input} w-24`}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
                <input type="number" min="0" step={currencyDecimals(shop.currency) ? '0.01' : '1'} value={shop.price} onChange={(e) => setShop({ ...shop, price: e.target.value })} placeholder="0" className={input} />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">{t("Kategori")}
              <select value={shop.category} onChange={(e) => setShop({ ...shop, category: e.target.value })} className={input}><option value="">{t("Pilih kategori")}</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
            <fieldset className="flex flex-col gap-1 text-xs font-bold">{t("Kondisi barang")}
              <div className="flex gap-4 font-normal text-sm py-2">
                <label className="flex items-center gap-1"><input type="radio" name="condition" checked={shop.condition === 'new'} onChange={() => setShop({ ...shop, condition: 'new' })} />{t("Baru")}</label>
                <label className="flex items-center gap-1"><input type="radio" name="condition" checked={shop.condition === 'used'} onChange={() => setShop({ ...shop, condition: 'used' })} />{t("Bekas")}</label>
              </div>
            </fieldset>
            <label className="flex flex-col gap-1 text-xs font-bold">{t("Stok (opsional)")}<input type="number" min="0" value={shop.stock} onChange={(e) => setShop({ ...shop, stock: e.target.value })} className={input} /></label>
            <label className="flex flex-col gap-1 text-xs font-bold">{t("Merek (opsional)")}<input value={shop.brand} maxLength={100} onChange={(e) => setShop({ ...shop, brand: e.target.value })} className={input} /></label>
            <label className="flex flex-col gap-1 text-xs font-bold">{t("Metode pembayaran (opsional)")}
              <select value={shop.payment} onChange={(e) => setShop({ ...shop, payment: e.target.value })} className={input}>{PAYMENTS.map((p) => <option key={p} value={p}>{p || t("Tidak ditentukan")}</option>)}</select>
            </label>
            <fieldset className="sm:col-span-2 text-xs font-bold">{t("Pengambilan / pengiriman (opsional)")}
              <div className="flex flex-wrap gap-4 font-normal text-sm pt-1">
                {FULFILLMENT.map((f) =>
                <label key={f.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={shop.fulfillment.includes(f.id)} onChange={(e) => setShop({ ...shop, fulfillment: e.target.checked ? [...shop.fulfillment, f.id] : shop.fulfillment.filter((x) => x !== f.id) })} />{f.label}
                  </label>
                )}
              </div>
            </fieldset>
          </div>
          }


          <label className="new-post-visibility">{t("Visibilitas")}<select value={visibility} onChange={(e) => setVisibility(e.target.value)}><option value="public">{t("Publik")}</option><option value="followers">{t("Hanya pengikut")}</option></select></label>
          {error && <p className="new-post-error" role="alert">{t(error)}</p>}
          {!error && problems.length > 0 && <details className="new-post-validation"><summary>{t("Ketentuan postingan (")}{problems.length} {t("belum terpenuhi)")}</summary><ul>{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul></details>}
          <div className="new-post-footer">{!isEdit && <button type="button" className="new-post-draft" onClick={saveDraft} disabled={submitting || uploading > 0}><Save size={17} />{t("Draft")}</button>}<button type="button" onClick={submit} disabled={submitting || uploading > 0} className="new-post-submit">{submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}{isEdit ? t("Simpan Perubahan") : t("Post Sekarang")}</button></div>
          {draftMessage && <p className="new-post-draft-message" role="status">{draftMessage}</p>}
        </div>
        <aside className="new-post-preview"><h4>{t({ image: 'Pratinjau Gambar', video: 'Pratinjau Video', poster: 'Pratinjau Poster', link: 'Pratinjau Link', location: 'Pratinjau Lokasi', shop: 'Pratinjau Produk' }[activeType])}</h4><article className="new-post-preview-card"><div className="new-post-preview-menu"><MoreHorizontal size={19} /></div>
          {hashtags.length > 0 && <p className="new-post-preview-tags">{hashtags.map((tag) => <span key={tag}>#{tag} </span>)}</p>}
          {media[0] ? media[0].type === 'image' ? <img src={media[0].url} alt={t("Pratinjau media")} className="new-post-preview-image" /> : <video src={media[0].url} controls className="new-post-preview-image" /> : (linkPreview?.image_url || linkPreview?.image) && !(linkPreview?.image_url || linkPreview?.image).includes('google.com/s2/favicons') ? <img src={linkPreview.image_url || linkPreview.image} alt={t("Pratinjau link")} className="new-post-preview-image" /> : <div className="new-post-preview-placeholder">{activeType === 'video' ? <Video size={36} /> : activeType === 'link' ? <LinkIcon size={36} /> : activeType === 'location' ? <MapPin size={36} /> : activeType === 'shop' ? <ShoppingBag size={36} /> : activeType === 'poster' ? <FileText size={36} /> : <ImageIcon size={36} />}<span>{t({ image: 'Pratinjau gambar Anda', video: 'Pratinjau video Anda', poster: 'Pratinjau poster Anda', link: 'Pratinjau tautan Anda', location: location || 'Pratinjau lokasi Anda', shop: 'Pratinjau produk Anda' }[activeType])}</span></div>}
          <div className="new-post-preview-copy"><h3>{title || (isShop ? t("Nama produk Anda") : t("Judul postingan Anda"))}</h3><div className="new-post-preview-description"><RichText text={content || 'Deskripsi postingan akan muncul di sini.'} /></div>

            {normalizedLinkUrl && <p className="new-post-preview-meta"><LinkIcon size={16} /><a href={normalizedLinkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{normalizedLinkUrl}</a></p>}
            {mentions.length > 0 && <p className="new-post-preview-meta"><AtSign size={16} /><span>{mentions.map((name) => '@' + name).join('   ')}</span></p>}
            {location && <p className="new-post-preview-meta location"><MapPin size={16} /><span>{location}</span></p>}
            {isShop && shop.price && <p className="new-post-preview-price">{formatPrice(toMinorUnits(shop.price, shop.currency), shop.currency, language)}</p>}
          </div><div className="new-post-preview-actions"><span><Heart size={18} />0</span><span><MessageCircle size={18} />0</span><span><Share2 size={18} />0</span><span><Eye size={18} />0</span></div>
        </article></aside>
      </div>
    </div>);

}
