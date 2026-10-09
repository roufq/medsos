import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Image as ImageIcon, Video, Link as LinkIcon, MapPin, Loader2, Trash2, ShoppingBag, FileText, LocateFixed } from 'lucide-react';
import { postApi } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { POST_RULES as R, countWords, currencyDecimals, mergeTokens, parseTokens, toMinorUnits, tokensInText } from '../../utils/postFormat';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the created or updated post returned by the API. */
  onSaved?: (post: any) => void;
  /** When set, the modal edits this post instead of creating one. */
  editPost?: any;
  currentUser?: any;
}

interface MediaItem { url: string; type: 'image' | 'video'; duration: number; }

const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD', 'CNY', 'KRW', 'THB', 'PHP', 'VND', 'INR', 'SAR', 'AED'];
const CATEGORIES = ['Elektronik', 'Handphone & Aksesoris', 'Komputer & Laptop', 'Fashion Pria', 'Fashion Wanita', 'Fashion Anak', 'Kecantikan', 'Kesehatan', 'Rumah & Dapur', 'Otomotif', 'Olahraga & Outdoor', 'Hobi & Koleksi', 'Buku & Alat Tulis', 'Makanan & Minuman', 'Ibu & Bayi', 'Properti', 'Jasa', 'Lainnya'];
const FULFILLMENT = [{ id: 'pickup', label: 'Ambil langsung' }, { id: 'cod', label: 'COD' }, { id: 'shipping', label: 'Jasa ekspedisi' }];
const PAYMENTS = ['', 'Transfer bank', 'E-wallet', 'Tunai saat bertemu', 'Kartu kredit/debit', 'Postter Pay'];

const errorText = (error: any, fallback: string) => error?.response?.data?.error || error?.message || fallback;
const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

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

export default function CreatePostModal({ isOpen, onClose, onSaved, editPost }: CreatePostModalProps) {
  const { user } = useAuth();
  const isEdit = Boolean(editPost);
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
  const [error, setError] = useState('');
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const mediaTouched = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    mediaTouched.current = false;
    if (!editPost) return;
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
        stock: s.stock ?? '', brand: s.brand || '', fulfillment: (s.fulfillment || '').split(',').filter(Boolean), payment: s.payment_method || '',
      });
    }
  }, [isOpen, editPost]);

  const isShop = mode === 'shop';
  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');
  const words = countWords(content);
  const hashtags = useMemo(() => mergeTokens(parseTokens(hashtagInput, '#'), tokensInText(content, '#')), [hashtagInput, content]);
  const mentions = useMemo(() => mergeTokens(parseTokens(mentionInput, '@'), tokensInText(content, '@')), [mentionInput, content]);
  const maxTags = isShop ? R.shopHashtagsMax : R.hashtagsMax;
  const minMentions = isShop ? 0 : R.mentionsMin;
  const postType = isShop ? 'shop' : videos.length ? 'video' : images.length ? 'image' : linkUrl.trim() ? 'link' : 'text';

  const problems: string[] = [];
  const titleLength = [...title.trim()].length;
  if (titleLength < R.titleMin || titleLength > R.titleMax) problems.push(`Judul wajib ${R.titleMin}–${R.titleMax} karakter.`);
  if (isShop ? words === 0 : words < R.descriptionMinWords) problems.push(isShop ? 'Deskripsi produk wajib diisi.' : `Deskripsi minimal ${R.descriptionMinWords} kata (sekarang ${words}).`);
  if (words > R.descriptionMaxWords) problems.push(`Deskripsi maksimal ${R.descriptionMaxWords} kata.`);
  if (hashtags.length < R.hashtagsMin || hashtags.length > maxTags) problems.push(`Hashtag wajib ${R.hashtagsMin}–${maxTags} (sekarang ${hashtags.length}).`);
  if (mentions.length < minMentions || mentions.length > R.mentionsMax) problems.push(`Mention ${minMentions}–${R.mentionsMax} akun dengan @username (sekarang ${mentions.length}).`);
  if (!isShop && media.length > 0 && linkUrl.trim()) problems.push('Pilih salah satu: media atau link URL.');
  if (!isShop && videos.length > 0 && images.length > 0) problems.push('Postingan video tidak bisa digabung dengan gambar.');
  if (isShop) {
    if (images.length < 1) problems.push('Produk wajib memiliki 1–6 gambar.');
    if (videos.length > 1) problems.push('Maksimal 1 video produk.');
    if (videos[0] && (videos[0].duration < R.shopVideoMin || videos[0].duration > R.shopVideoMax)) problems.push(`Video produk harus ${R.shopVideoMin}–${R.shopVideoMax} detik.`);
    if (toMinorUnits(shop.price, shop.currency) <= 0) problems.push('Harga wajib diisi.');
    if (!shop.category) problems.push('Pilih kategori produk.');
    if (!shop.condition) problems.push('Pilih kondisi barang (baru/bekas).');
  }

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
    setUploading((n) => n + selected.length);
    for (const file of selected) {
      try {
        const res = await postApi.uploadMedia(file);
        if (res.media_type !== kind) throw new Error(kind === 'image' ? 'File bukan gambar.' : 'File bukan video.');
        mediaTouched.current = true;
        setMedia((current) => [...current, { url: res.url, type: res.media_type, duration: res.duration_seconds || 0 }]);
      } catch (err) {
        setError(errorText(err, `Gagal mengunggah ${file.name}`));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const removeMedia = (url: string) => { mediaTouched.current = true; setMedia((current) => current.filter((m) => m.url !== url)); };

  const previewLink = async () => {
    setLinkPreview(null);
    try { setLinkPreview(await postApi.getLinkPreview(linkUrl.trim())); } catch (err) { setError(errorText(err, 'Pratinjau link gagal')); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Browser tidak mendukung lokasi.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try { setLocation(await reverseGeocode(pos.coords.latitude, pos.coords.longitude)); } catch { setError('Gagal menentukan nama lokasi.'); } finally { setLocating(false); }
    }, () => { setLocating(false); setError('Izin lokasi ditolak.'); }, { timeout: 10000 });
  };

  const submit = async () => {
    if (problems.length) { setError(problems[0]); return; }
    setSubmitting(true);
    setError('');
    const shopPayload = isShop ? {
      price_minor: toMinorUnits(shop.price, shop.currency), currency: shop.currency, category: shop.category, condition: shop.condition,
      stock: shop.stock === '' ? null : Number(shop.stock), brand: shop.brand, fulfillment: shop.fulfillment.join(','), payment_method: shop.payment,
    } : undefined;
    try {
      let saved;
      if (isEdit) {
        saved = await postApi.updatePost(editPost.id, {
          title: title.trim(), content: content.trim(), hashtags, mentions, location: location.trim(), visibility,
          ...(editPost.post_type === 'link' ? { link_url: linkUrl.trim() } : {}),
          ...(mediaTouched.current ? { media_urls: media.map((m) => m.url) } : {}),
          ...(shopPayload ? { shop: shopPayload } : {}),
        });
      } else {
        saved = await postApi.createPost({
          title: title.trim(), content: content.trim(), post_type: postType, hashtags, mentions, location: location.trim(), visibility,
          link_url: postType === 'link' ? linkUrl.trim() : '',
          ...(isShop ? { image_urls: images.map((m) => m.url), video_url: videos[0]?.url || '', shop: shopPayload } : { media_urls: media.map((m) => m.url) }),
        });
        setTitle(''); setContent(''); setMedia([]); setLinkUrl(''); setLinkPreview(null); setHashtagInput(''); setMentionInput(''); setLocation('');
        setShop({ price: '', currency: 'IDR', category: '', condition: '', stock: '', brand: '', fulfillment: [], payment: '' });
      }
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(errorText(err, 'Gagal menyimpan postingan.'));
    } finally {
      setSubmitting(false);
    }
  };

  const counter = (ok: boolean) => (ok ? 'text-success' : 'text-error');
  const input = 'w-full rounded-xl border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto p-5 shadow-xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border-subtle/20 pb-3">
          <h3 className="font-bold text-text-primary">{isEdit ? 'Edit postingan' : 'Buat postingan'}</h3>
          <button type="button" onClick={onClose} disabled={submitting} className="p-1 rounded-full hover:bg-surface-container" aria-label="Tutup"><X className="w-5 h-5" /></button>
        </div>

        {!isEdit && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container-low p-1 text-sm font-bold">
            <button type="button" onClick={() => setMode('post')} className={`flex items-center justify-center gap-2 rounded-lg py-2 ${!isShop ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`}><FileText className="w-4 h-4" />Postingan</button>
            <button type="button" onClick={() => setMode('shop')} className={`flex items-center justify-center gap-2 rounded-lg py-2 ${isShop ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`}><ShoppingBag className="w-4 h-4" />Jual produk</button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <img src={user?.avatar_url || '/favicon.svg'} alt="" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <div className="font-bold text-sm">{user?.name}</div>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="text-xs text-text-secondary bg-transparent outline-none">
              <option value="public">🌐 Publik</option>
              <option value="followers">👥 Hanya pengikut</option>
            </select>
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">{isShop ? 'Nama produk' : 'Judul'} <span className="text-error">*</span></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={R.titleMax} placeholder={isShop ? 'Nama produk yang jelas & singkat' : 'Judul postingan'} className={input} />
          <span className={`text-[11px] text-right ${counter(titleLength >= R.titleMin)}`}>{titleLength}/{R.titleMax}</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold">{isShop ? 'Deskripsi produk' : 'Deskripsi'} <span className="text-error">*</span></span>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder={isShop ? 'Jelaskan produk Anda…' : `Tulis minimal ${R.descriptionMinWords} kata. Gunakan #hashtag dan @username langsung di teks.`} className={`${input} resize-y`} />
          <span className={`text-[11px] text-right ${counter(isShop ? words > 0 : words >= R.descriptionMinWords && words <= R.descriptionMaxWords)}`}>{words} kata {isShop ? '' : `(min ${R.descriptionMinWords}, maks ${R.descriptionMaxWords})`}</span>
        </label>

        {isShop && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border-subtle/50 p-3">
            <label className="flex flex-col gap-1 text-xs font-bold">Harga <span className="sr-only">wajib</span>
              <div className="flex gap-2">
                <select value={shop.currency} onChange={(e) => setShop({ ...shop, currency: e.target.value })} className={`${input} w-24`}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
                <input type="number" min="0" step={currencyDecimals(shop.currency) ? '0.01' : '1'} value={shop.price} onChange={(e) => setShop({ ...shop, price: e.target.value })} placeholder="0" className={input} />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">Kategori
              <select value={shop.category} onChange={(e) => setShop({ ...shop, category: e.target.value })} className={input}><option value="">Pilih kategori</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
            <fieldset className="flex flex-col gap-1 text-xs font-bold">Kondisi barang
              <div className="flex gap-4 font-normal text-sm py-2">
                <label className="flex items-center gap-1"><input type="radio" name="condition" checked={shop.condition === 'new'} onChange={() => setShop({ ...shop, condition: 'new' })} />Baru</label>
                <label className="flex items-center gap-1"><input type="radio" name="condition" checked={shop.condition === 'used'} onChange={() => setShop({ ...shop, condition: 'used' })} />Bekas</label>
              </div>
            </fieldset>
            <label className="flex flex-col gap-1 text-xs font-bold">Stok (opsional)<input type="number" min="0" value={shop.stock} onChange={(e) => setShop({ ...shop, stock: e.target.value })} className={input} /></label>
            <label className="flex flex-col gap-1 text-xs font-bold">Merek (opsional)<input value={shop.brand} maxLength={100} onChange={(e) => setShop({ ...shop, brand: e.target.value })} className={input} /></label>
            <label className="flex flex-col gap-1 text-xs font-bold">Metode pembayaran (opsional)
              <select value={shop.payment} onChange={(e) => setShop({ ...shop, payment: e.target.value })} className={input}>{PAYMENTS.map((p) => <option key={p} value={p}>{p || 'Tidak ditentukan'}</option>)}</select>
            </label>
            <fieldset className="sm:col-span-2 text-xs font-bold">Pengambilan / pengiriman (opsional)
              <div className="flex flex-wrap gap-4 font-normal text-sm pt-1">
                {FULFILLMENT.map((f) => (
                  <label key={f.id} className="flex items-center gap-1">
                    <input type="checkbox" checked={shop.fulfillment.includes(f.id)} onChange={(e) => setShop({ ...shop, fulfillment: e.target.checked ? [...shop.fulfillment, f.id] : shop.fulfillment.filter((x) => x !== f.id) })} />{f.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {media.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {media.map((m) => (
              <div key={m.url} className="relative rounded-lg overflow-hidden bg-surface-container aspect-square">
                {m.type === 'image' ? <img src={m.url} alt="" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-text-secondary"><Video className="w-6 h-6" />{formatDuration(m.duration)}{m.duration >= R.shortMin && m.duration <= R.shortMax && <span className="font-black text-error">SHORT</span>}</div>
                )}
                <button type="button" onClick={() => removeMedia(m.url)} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white" aria-label="Hapus media"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
        {uploading > 0 && <p className="text-xs text-text-secondary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Mengunggah {uploading} file… (video besar butuh waktu)</p>}

        {!isShop && (postType === 'link' || (!media.length && !isEdit) || editPost?.post_type === 'link') && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-border-subtle px-3"><LinkIcon className="w-4 h-4 text-outline" /><input value={linkUrl} onChange={(e) => { setLinkUrl(e.target.value); setLinkPreview(null); }} placeholder="https://… (opsional)" className="flex-1 py-2 text-sm outline-none" disabled={media.length > 0} /></div>
              {linkUrl.trim() && <button type="button" onClick={previewLink} className="rounded-xl border border-border-subtle px-3 text-xs font-bold">Pratinjau</button>}
            </div>
            {linkPreview && (
              <div className="rounded-xl border border-border-subtle p-3 text-xs flex gap-3">
                {linkPreview.image && <img src={linkPreview.image} alt="" className="w-20 h-20 object-cover rounded-lg" referrerPolicy="no-referrer" />}
                <div><div className="font-bold">{linkPreview.title}</div><p className="text-text-secondary line-clamp-3">{linkPreview.description}</p></div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold">Hashtag <span className="text-error">*</span>
            <input value={hashtagInput} onChange={(e) => setHashtagInput(e.target.value)} placeholder="#travel #kuliner #bali" className={input} />
            <span className={`font-normal ${counter(hashtags.length >= R.hashtagsMin && hashtags.length <= maxTags)}`}>{hashtags.length} hashtag (wajib {R.hashtagsMin}–{maxTags})</span>
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold">Mention {minMentions > 0 && <span className="text-error">*</span>}
            <input value={mentionInput} onChange={(e) => setMentionInput(e.target.value)} placeholder="@username @teman" className={input} />
            <span className={`font-normal ${counter(mentions.length >= minMentions && mentions.length <= R.mentionsMax)}`}>{mentions.length} akun ({minMentions}–{R.mentionsMax})</span>
          </label>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-border-subtle px-3"><MapPin className="w-4 h-4 text-outline" /><input value={location} maxLength={255} onChange={(e) => setLocation(e.target.value)} placeholder="Lokasi (opsional)" className="flex-1 py-2 text-sm outline-none" /></div>
          <button type="button" onClick={useMyLocation} disabled={locating} className="rounded-xl border border-border-subtle px-3 text-xs font-bold flex items-center gap-1">{locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}Lokasi saya</button>
        </div>

        {error && <p className="rounded-lg bg-error/10 p-2 text-xs font-semibold text-error">{error}</p>}
        {!error && problems.length > 0 && <ul className="text-[11px] text-text-secondary list-disc pl-5">{problems.slice(0, 4).map((p) => <li key={p}>{p}</li>)}</ul>}

        <div className="flex justify-between items-center border-t border-border-subtle/20 pt-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => imageInput.current?.click()} disabled={videos.length > 0 && !isShop} className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-40"><ImageIcon className="w-4 h-4" />Gambar ({images.length}/{R.imagesMax})</button>
            <button type="button" onClick={() => videoInput.current?.click()} disabled={videos.length > 0 || (!isShop && images.length > 0)} className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-40"><Video className="w-4 h-4" />Video</button>
            <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={(e) => { upload(e.target.files, 'image'); e.target.value = ''; }} />
            <input ref={videoInput} type="file" accept="video/*,.mkv,.flv,.wmv,.mxf,.ts" className="hidden" onChange={(e) => { upload(e.target.files, 'video'); e.target.value = ''; }} />
          </div>
          <button type="button" onClick={submit} disabled={submitting || uploading > 0} className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{isEdit ? 'Simpan & posting ulang' : 'Posting'}
          </button>
        </div>
        <p className="text-[10px] text-outline">Gambar JPG/PNG/GIF/WebP hingga 10 MB (otomatis dikompresi). Video MP4/MOV/AVI/WMV/FLV/WebM/MKV/MPEG/MXF hingga 30 menit; video 1–1,5 menit masuk ke Shorts.</p>
      </div>
    </div>
  );
}
