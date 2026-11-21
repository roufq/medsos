import {useFeedbackState} from '../../hooks/useFeedbackState';
import {notify} from '../../utils/feedback';
import { sharePost, SHARE_PLATFORMS } from '../../utils/share';
import { copyToClipboard } from '../../utils/clipboard';
import { useLanguage } from "../../context/LanguageContext";import { ReactNode, useEffect, useState } from 'react';
import { X, Copy, Send, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { postApi } from '../../api/postApi';
import { socialApi } from '../../api/socialApi';

const errorText = (error: any, fallback: string) => error?.response?.data?.error || fallback;

export function Modal({ title, onClose, children, wide }: {title: string;onClose: () => void;children: ReactNode;wide?: boolean;}) {const { t } = useLanguage();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {if (event.key === 'Escape') onClose();};
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-white rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto p-5 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-surface-container" aria-label={t("Tutup")}><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>);

}

export function ShareModal({ postId, onClose, onShared }: {postId: number | string;onClose: () => void;onShared?: (result?: any) => void;}) {const { t } = useLanguage();
  const [message, setMessage] = useFeedbackState('', 'success');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useFeedbackState('', 'error');

  useEffect(() => {
    if (query.trim().length < 2) {setUsers([]);return;}
    const timer = window.setTimeout(async () => {
      try {setUsers((await socialApi.search(query.trim())).users || []);} catch {setUsers([]);}
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState<{ label: string; targetUrl: string; shareUrl: string } | null>(null);
  const shareTo = async (channel: string) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage(''); setHandoff(null);
    try {
      const outcome = await sharePost(postId, channel, { share: postApi.share, copy: copyToClipboard });
      const label = SHARE_PLATFORMS.find(platform => platform.id === channel)?.label || '';
      if (outcome.state === 'blocked' || outcome.state === 'manual') {
        setHandoff({ label, targetUrl: outcome.targetUrl, shareUrl: outcome.shareUrl });
      }
      if (outcome.state === 'blocked') setError(t('Popup diblokir atau ditutup. Gunakan tautan di bawah atau salin tautannya.'));
      else if (outcome.state === 'manual') setMessage(t('Tautan disalin. Buka aplikasi dan tempel secara manual; gambar atau video tidak diunggah otomatis.'));
      else if (outcome.state === 'copied') setMessage(t('Link disalin ke clipboard.'));
      else setMessage(t('Halaman berbagi dibuka. Selesaikan pengiriman di media sosial tersebut.'));
      if (outcome.counted) onShared?.(outcome.result);
    } catch (err) {
      setError((err as any)?.response?.data?.error || (err as any)?.message || 'Gagal membagikan postingan');
    } finally { setBusy(false); }
  };

  const sendToUser = async (recipient: any) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage(''); setHandoff(null);
    try {
      const result = await postApi.share(postId, 'message', { recipient_id: recipient.id, message: note });
      setMessage(`Terkirim ke ${recipient.name}.`);
      setQuery('');
      onShared?.(result);
    } catch (err) {
      setError(errorText(err, 'Gagal mengirim pesan'));
    } finally { setBusy(false); }
  };

  return (
    <Modal title={t("Bagikan postingan")} onClose={onClose}>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
        {SHARE_PLATFORMS.map((platform) =>
        <button key={platform.id} type="button" onClick={() => shareTo(platform.id)} disabled={busy} aria-label={`${t("Bagikan ke")} ${platform.label}`} className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-surface-container-low">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: platform.color }}><img src={`${import.meta.env.BASE_URL}icons/share/${platform.id}.svg`} alt="" aria-hidden="true" className="w-5 h-5" /></span>
            <span className="text-[11px] font-semibold text-text-secondary">{platform.label}</span>
          </button>
        )}
        <button type="button" onClick={() => shareTo('copy')} disabled={busy} className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-surface-container-low">
          <span className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-text-primary"><Copy className="w-4 h-4" /></span>
          <span className="text-[11px] font-semibold text-text-secondary">{t("Salin link")}</span>
        </button>
      </div>
      <p className="text-xs text-text-secondary mb-3">{t("Instagram dan TikTok menggunakan salin tautan, lalu tempel manual di aplikasi.")}</p>
      {busy && <p role="status" className="text-xs flex items-center gap-2 mb-3"><Loader2 size={14} className="animate-spin" />{t("Memproses…")}</p>}
      {handoff && <div className="rounded-xl border border-border-subtle p-3 mb-4 space-y-2">
        <a href={handoff.targetUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline">{t("Buka")} {handoff.label}</a>
        <input aria-label={t("Tautan postingan")} readOnly value={handoff.shareUrl} onFocus={event => event.currentTarget.select()} className="w-full rounded-lg border border-border-subtle p-2 text-xs" />
        <button type="button" disabled={busy} onClick={() => shareTo('copy')} className="text-xs underline">{t("Salin link")}</button>
      </div>}
      <div className="border-t border-border-subtle/30 pt-4">
        <p className="text-xs font-bold text-text-primary mb-2">{t("Kirim lewat pesan")}</p>
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle px-3 py-2 mb-2">
          <Search className="w-4 h-4 text-outline" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Cari nama atau username")} className="flex-1 text-sm outline-none" />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder={t("Pesan (opsional)")} className="w-full rounded-xl border border-border-subtle px-3 py-2 text-sm mb-2" />
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {users.map((u) =>
          <button key={u.id} type="button" onClick={() => sendToUser(u)} disabled={busy} className="flex items-center gap-2 rounded-lg p-2 hover:bg-surface-container-low text-left">
              <img src={u.avatar_url || '/favicon.svg'} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="flex-1 text-sm font-semibold">{u.name} <span className="text-xs text-text-secondary">@{u.username}</span></span>
              <Send className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>
      {message && <p role="status" className="mt-3 text-xs text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />{message}</p>}
      {error && <p role="alert" className="mt-3 text-xs text-error">{t(error)}</p>}
    </Modal>);

}

export function EmbedModal({ postId, onClose }: {postId: number | string;onClose: () => void;}) {const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useFeedbackState('', 'error');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    postApi.getEmbedCode(postId).then(setData).catch((err) => setError(errorText(err, 'Kode embed tidak tersedia')));
  }, [postId]);
  const copy = async () => {
    try { await copyToClipboard(data.embed_code); setCopied(true);notify.success('Kode embed berhasil disalin.'); setError(''); }
    catch { setCopied(false); setError(t('Gagal menyalin kode embed.')); }
  };
  return (
    <Modal title={t("Embed postingan")} onClose={onClose} wide>
      {error && <p className="text-sm text-error">{t(error)}</p>}
      {data &&
      <>
          <p className="text-xs text-text-secondary mb-2">{t("Salin kode ini ke halaman HTML website Anda.")}</p>
          <textarea readOnly value={data.embed_code} rows={4} className="w-full rounded-xl border border-border-subtle p-3 font-mono text-xs" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">{copied ? t('Tersalin') : t('Salin kode')}</button>
          <p className="text-xs font-bold mt-4 mb-2">{t("Pratinjau")}</p>
          <iframe src={data.embed_url} title={t("Pratinjau embed")} className="w-full h-[420px] rounded-xl border border-border-subtle" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
        </>
      }
    </Modal>);

}

const REPORT_REASONS = ['Spam', 'Penipuan', 'Ujaran kebencian', 'Pelecehan atau perundungan', 'Kekerasan', 'Konten seksual', 'Informasi palsu', 'Pelanggaran hak cipta', 'Barang terlarang', 'Lainnya'];

export function ReportModal({ postId, onClose }: {postId: number | string;onClose: () => void;}) {
  const { t } = useLanguage();
  const [sending, setSending] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useFeedbackState('', 'error');
  const submit = async () => {
    if (sending) return;
    if (!reason) {setError(t('Pilih alasan laporan.'));return;}
    setSending(true); setError('');
    try {
      await postApi.report(postId, reason, details);
      setDone(true);notify.success('Laporan berhasil dikirim.');
    } catch (err) {
      setError(errorText(err, t('Gagal mengirim laporan')));
    } finally { setSending(false); }
  };
  return (
    <Modal title={t("Laporkan postingan")} onClose={onClose}>
      {done ?
      <p className="text-sm text-text-primary">{t("Terima kasih. Laporan Anda sudah dikirim ke administrator untuk ditinjau.")}</p> :

      <>
          <div className="flex flex-col gap-1 mb-3">
            {REPORT_REASONS.map((item) =>
          <label key={item} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-container-low text-sm cursor-pointer">
                <input type="radio" name="report-reason" checked={reason === item} onChange={() => setReason(item)} disabled={sending} /> {t(item)}
              </label>
          )}
          </div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={5000} rows={3} placeholder={t("Detail tambahan (opsional)")} disabled={sending} className="w-full rounded-xl border border-border-subtle p-3 text-sm" />
          {error && <p className="text-xs text-error mt-2">{t(error)}</p>}
          <button type="button" onClick={submit} disabled={sending} className="mt-3 w-full rounded-full bg-error py-2 text-sm font-bold text-white">{sending ? t("Mengirim...") : t("Kirim laporan")}</button>
        </>
      }
    </Modal>);

}

export function RepostModal({ postId, onClose, onReposted }: {postId: number | string;onClose: () => void;onReposted?: (post: any) => void;}) {
  const { t: translateUI } = useLanguage();

  const [commentary, setCommentary] = useState('');
  const [error, setError] = useFeedbackState('', 'error');
  const submit = async () => {
    try {
      const post = await postApi.repost(postId, commentary);
      onReposted?.(post);
      onClose();
    } catch (err) {
      setError(errorText(err, 'Gagal merepost'));
    }
  };
  return (
    <Modal title={translateUI("Repost")} onClose={onClose}>
      <textarea value={commentary} onChange={(e) => setCommentary(e.target.value)} maxLength={2000} rows={3} placeholder={translateUI("Tambahkan komentar (opsional)")} className="w-full rounded-xl border border-border-subtle p-3 text-sm" />
      {error && <p className="text-xs text-error mt-2">{translateUI(error)}</p>}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button type="button" onClick={async () => { try { const p = await postApi.repost(postId, ''); onReposted?.(p); onClose(); } catch (err) { setError(errorText(err, 'Gagal merepost')); } }} className="w-full rounded-full border border-border-subtle bg-surface-container-low hover:bg-surface-container py-2 text-sm font-bold text-text-primary">{translateUI("Repost Langsung")}</button>
        <button type="button" onClick={submit} className="w-full rounded-full bg-primary py-2 text-sm font-bold text-white">{commentary.trim() ? translateUI("Posting Kutipan") : translateUI("Repost sekarang")}</button>
      </div>
    </Modal>);

}
