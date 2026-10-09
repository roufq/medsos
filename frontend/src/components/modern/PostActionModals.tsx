import { ReactNode, useEffect, useState } from 'react';
import { X, Copy, Send, Search, CheckCircle2 } from 'lucide-react';
import { postApi } from '../../api/postApi';
import { socialApi } from '../../api/socialApi';

const errorText = (error: any, fallback: string) => error?.response?.data?.error || fallback;

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-white rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto p-5 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-primary">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-surface-container" aria-label="Tutup"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const PLATFORMS: { id: string; label: string; color: string }[] = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'x', label: 'X', color: '#000000' },
  { id: 'threads', label: 'Threads', color: '#101010' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'telegram', label: 'Telegram', color: '#229ED9' },
  { id: 'tiktok', label: 'TikTok', color: '#111111' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023' },
];

// Instagram and TikTok have no web share intent: copy the link, then open the app.
const APP_ONLY: Record<string, string> = { instagram: 'https://www.instagram.com/', tiktok: 'https://www.tiktok.com/' };

export function ShareModal({ postId, onClose, onShared }: { postId: number; onClose: () => void; onShared?: () => void }) {
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (query.trim().length < 2) { setUsers([]); return; }
    const timer = window.setTimeout(async () => {
      try { setUsers((await socialApi.search(query.trim())).users || []); } catch { setUsers([]); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const shareTo = async (channel: string) => {
    setError('');
    // Open the window synchronously so popup blockers allow it.
    // ("noopener" would make window.open return null, so detach opener manually.)
    const popup = channel !== 'copy' ? window.open('', '_blank', 'width=640,height=640') : null;
    if (popup) popup.opener = null;
    try {
      const result = await postApi.share(postId, channel);
      if (channel === 'copy' || APP_ONLY[channel]) {
        await navigator.clipboard.writeText(result.share_url).catch(() => undefined);
        setMessage(APP_ONLY[channel] ? 'Link disalin. Tempel di aplikasi ' + channel + '.' : 'Link disalin ke clipboard.');
        if (popup) popup.location.href = APP_ONLY[channel];
      } else if (popup && result.intent_url) {
        popup.location.href = result.intent_url;
      }
      onShared?.();
    } catch (err) {
      popup?.close();
      setError(errorText(err, 'Gagal membagikan postingan'));
    }
  };

  const sendToUser = async (recipient: any) => {
    setError('');
    try {
      await postApi.share(postId, 'message', { recipient_id: recipient.id, message: note });
      setMessage(`Terkirim ke ${recipient.name}.`);
      setQuery('');
      onShared?.();
    } catch (err) {
      setError(errorText(err, 'Gagal mengirim pesan'));
    }
  };

  return (
    <Modal title="Bagikan postingan" onClose={onClose}>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
        {PLATFORMS.map((platform) => (
          <button key={platform.id} type="button" onClick={() => shareTo(platform.id)} className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-surface-container-low">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: platform.color }}>{platform.label.slice(0, 2)}</span>
            <span className="text-[11px] font-semibold text-text-secondary">{platform.label}</span>
          </button>
        ))}
        <button type="button" onClick={() => shareTo('copy')} className="flex flex-col items-center gap-1 rounded-xl p-2 hover:bg-surface-container-low">
          <span className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-text-primary"><Copy className="w-4 h-4" /></span>
          <span className="text-[11px] font-semibold text-text-secondary">Salin link</span>
        </button>
      </div>
      <div className="border-t border-border-subtle/30 pt-4">
        <p className="text-xs font-bold text-text-primary mb-2">Kirim lewat pesan</p>
        <div className="flex items-center gap-2 rounded-xl border border-border-subtle px-3 py-2 mb-2">
          <Search className="w-4 h-4 text-outline" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau username" className="flex-1 text-sm outline-none" />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Pesan (opsional)" className="w-full rounded-xl border border-border-subtle px-3 py-2 text-sm mb-2" />
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {users.map((u) => (
            <button key={u.id} type="button" onClick={() => sendToUser(u)} className="flex items-center gap-2 rounded-lg p-2 hover:bg-surface-container-low text-left">
              <img src={u.avatar_url || '/favicon.svg'} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="flex-1 text-sm font-semibold">{u.name} <span className="text-xs text-text-secondary">@{u.username}</span></span>
              <Send className="w-4 h-4 text-primary" />
            </button>
          ))}
        </div>
      </div>
      {message && <p className="mt-3 text-xs text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />{message}</p>}
      {error && <p className="mt-3 text-xs text-error">{error}</p>}
    </Modal>
  );
}

export function EmbedModal({ postId, onClose }: { postId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    postApi.getEmbedCode(postId).then(setData).catch((err) => setError(errorText(err, 'Kode embed tidak tersedia')));
  }, [postId]);
  const copy = async () => {
    await navigator.clipboard.writeText(data.embed_code).catch(() => undefined);
    setCopied(true);
  };
  return (
    <Modal title="Embed postingan" onClose={onClose} wide>
      {error && <p className="text-sm text-error">{error}</p>}
      {data && (
        <>
          <p className="text-xs text-text-secondary mb-2">Salin kode ini ke halaman HTML website Anda.</p>
          <textarea readOnly value={data.embed_code} rows={4} className="w-full rounded-xl border border-border-subtle p-3 font-mono text-xs" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">{copied ? 'Tersalin ✓' : 'Salin kode'}</button>
          <p className="text-xs font-bold mt-4 mb-2">Pratinjau</p>
          <iframe src={data.embed_url} title="Pratinjau embed" className="w-full h-[420px] rounded-xl border border-border-subtle" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
        </>
      )}
    </Modal>
  );
}

const REPORT_REASONS = ['Spam', 'Penipuan', 'Ujaran kebencian', 'Pelecehan atau perundungan', 'Kekerasan', 'Konten seksual', 'Informasi palsu', 'Pelanggaran hak cipta', 'Barang terlarang', 'Lainnya'];

export function ReportModal({ postId, onClose }: { postId: number; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!reason) { setError('Pilih alasan laporan.'); return; }
    try {
      await postApi.report(postId, reason, details);
      setDone(true);
    } catch (err) {
      setError(errorText(err, 'Gagal mengirim laporan'));
    }
  };
  return (
    <Modal title="Laporkan postingan" onClose={onClose}>
      {done ? (
        <p className="text-sm text-text-primary">Terima kasih. Laporan Anda sudah dikirim ke administrator untuk ditinjau.</p>
      ) : (
        <>
          <div className="flex flex-col gap-1 mb-3">
            {REPORT_REASONS.map((item) => (
              <label key={item} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-container-low text-sm cursor-pointer">
                <input type="radio" name="report-reason" checked={reason === item} onChange={() => setReason(item)} /> {item}
              </label>
            ))}
          </div>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={5000} rows={3} placeholder="Detail tambahan (opsional)" className="w-full rounded-xl border border-border-subtle p-3 text-sm" />
          {error && <p className="text-xs text-error mt-2">{error}</p>}
          <button type="button" onClick={submit} className="mt-3 w-full rounded-full bg-error py-2 text-sm font-bold text-white">Kirim laporan</button>
        </>
      )}
    </Modal>
  );
}

export function RepostModal({ postId, onClose, onReposted }: { postId: number; onClose: () => void; onReposted?: (post: any) => void }) {
  const [commentary, setCommentary] = useState('');
  const [error, setError] = useState('');
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
    <Modal title="Repost" onClose={onClose}>
      <textarea value={commentary} onChange={(e) => setCommentary(e.target.value)} maxLength={2000} rows={3} placeholder="Tambahkan komentar (opsional)" className="w-full rounded-xl border border-border-subtle p-3 text-sm" />
      {error && <p className="text-xs text-error mt-2">{error}</p>}
      <button type="button" onClick={submit} className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-bold text-white">Repost sekarang</button>
    </Modal>
  );
}
