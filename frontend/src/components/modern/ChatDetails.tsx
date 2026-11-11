import { useEffect, useRef, useState } from 'react';
import { Bell, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { messageApi } from '../../api/messageApi';
import { userApi } from '../../api/userApi';

type Action = 'nickname' | 'block' | 'report' | 'delete' | null;
type Settings = { muted: boolean; nickname: string; blocked: boolean; blocked_between: boolean };

export default function ChatDetails({ peer, onClose, onSettings, onDelete }: {
  peer: any;
  onClose: () => void;
  onSettings: (settings: Settings) => void;
  onDelete: () => void;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [nickname, setNickname] = useState('');
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dialogRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    closeRef.current?.focus();
    messageApi.getSettings(peer.id).then((data) => {
      if (active) { setSettings(data); setNickname(data.nickname); onSettings(data); }
    }).catch((err) => { if (active) setError(err.response?.data?.error || 'Gagal memuat Details. Tutup lalu buka kembali.'); });
    return () => { active = false; };
  }, [peer.id]);

  useEffect(() => {
    if (action) (dialogRef.current?.querySelector('input, select, button') as HTMLElement)?.focus();
    else closeRef.current?.focus();
  }, [action]);

  const run = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await operation(); } catch (err: any) { setError(err.response?.data?.error || 'Gagal menyimpan perubahan. Coba lagi.'); }
    finally { setBusy(false); }
  };

  const save = async (patch: { muted?: boolean; nickname?: string }) => {
    const data = await messageApi.updateSettings(peer.id, patch);
    setSettings(data); onSettings(data);
  };

  const submit = () => run(async () => {
    if (action === 'nickname') await save({ nickname: nickname.trim() });
    if (action === 'block') {
      if (settings?.blocked) await userApi.unblockUser(peer.id);
      else await userApi.blockUser(peer.id);
      const data = await messageApi.getSettings(peer.id);
      setSettings(data); onSettings(data);
    }
    if (action === 'report') {
      await messageApi.report(peer.id, reason, details.trim());
      setNotice('Laporan terkirim ke admin.');
    }
    if (action === 'delete') { await messageApi.deleteHistory(peer.id); onDelete(); }
    setAction(null);
  });

  const open = (next: Action) => { setError(''); setNotice(''); setNickname(settings?.nickname || ''); setAction(next); };
  const titles = { nickname: 'Nicknames', block: settings?.blocked ? 'Unblock user?' : 'Block user?', report: 'Report chat', delete: 'Delete chat?' };

  return (
    <aside id="chat-details" aria-label="Chat details" className="absolute inset-y-0 right-0 z-30 w-full sm:w-[272px] xl:static xl:shrink-0 border-l border-border-subtle/30 flex flex-col text-text-primary"
      style={{ backgroundColor: 'rgb(var(--card-bg))' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) { event.stopPropagation(); if (action) setAction(null); else onClose(); }
      }}>
      <div className="h-[68px] px-4 flex items-center justify-between border-b border-border-subtle/30 shrink-0">
        <h2 className="text-sm font-bold">Details</h2>
        <button ref={closeRef} type="button" aria-label="Close details" onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-low"><X size={17} /></button>
      </div>
      <div className="px-4 py-4 border-b border-border-subtle/30">
        <button type="button" role="switch" aria-checked={settings?.muted || false} aria-label="Mute messages" disabled={busy || !settings}
          onClick={() => run(() => save({ muted: !settings?.muted }))} className="flex w-full items-center gap-3 text-xs disabled:opacity-50">
          <Bell size={18} /><span className="flex-1 text-left">Mute messages</span>
          <span className={`w-8 h-[18px] p-0.5 rounded-full transition-colors ${settings?.muted ? 'bg-primary' : 'bg-outline/30'}`}>
            <span className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${settings?.muted ? 'translate-x-3.5' : ''}`} />
          </span>
        </button>
      </div>
      <div className="flex-1 min-h-36 overflow-y-auto p-4">
        <h3 className="text-xs font-bold mb-4">Members</h3>
        <Link to={`/profile/${peer.username || peer.id}`} className="flex items-center gap-3 rounded-lg hover:bg-surface-container-low p-1 -mx-1">
          <img src={peer.avatar_url || '/frontend/dist/favicon.svg'} alt="" className="w-10 h-10 rounded-full object-cover" />
          <span className="min-w-0"><span className="block text-xs font-semibold truncate">{peer.name}</span><span className="block text-[11px] text-text-secondary truncate">{peer.username || ''}</span></span>
        </Link>
      </div>
      {!action && error && <p role="alert" className="px-4 py-2 text-xs text-red-500">{error}</p>}
      {notice && <p role="status" className="px-4 py-2 text-xs text-text-secondary">{notice}</p>}
      <div className="border-t border-border-subtle/30 py-2 text-xs">
        <button type="button" disabled={!settings || busy} onClick={() => open('nickname')} className="w-full px-4 py-3 text-left hover:bg-surface-container-low disabled:opacity-50">Nicknames{settings?.nickname && <span className="block mt-1 text-text-secondary truncate">{settings.nickname}</span>}</button>
        <button type="button" disabled={!settings || busy} onClick={() => open('block')} className="w-full px-4 py-3 text-left hover:bg-surface-container-low disabled:opacity-50">{settings?.blocked ? 'Unblock' : 'Block'}</button>
        <button type="button" disabled={!settings || busy} onClick={() => open('report')} className="w-full px-4 py-3 text-left text-red-500 hover:bg-surface-container-low disabled:opacity-50">Report</button>
        <button type="button" disabled={!settings || busy} onClick={() => open('delete')} className="w-full px-4 py-3 text-left text-red-500 hover:bg-surface-container-low disabled:opacity-50">Delete chat</button>
      </div>

      {action && <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4" onClick={() => { if (!busy) setAction(null); }}>
        <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="chat-action-title" className="w-full max-w-sm rounded-2xl p-5 shadow-xl text-text-primary" style={{ backgroundColor: 'rgb(var(--card-bg))' }}
          onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); submit(); }}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return;
            const fields = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea'));
            const first = fields[0], last = fields[fields.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }}>
          <h3 id="chat-action-title" className="font-bold mb-4">{titles[action]}</h3>
          {action === 'nickname' && <label className="block text-xs">Nama panggilan (hanya terlihat oleh Anda)
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={80} className="mt-2 w-full rounded-lg border border-border-subtle p-3 bg-surface-container-low" placeholder={peer.name} />
            <span className="block mt-2 text-text-secondary">Kosongkan untuk memakai nama asli.</span>
          </label>}
          {action === 'report' && <div className="space-y-3 text-xs">
            <label className="block">Alasan<select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-lg border border-border-subtle p-3 bg-surface-container-low">{['Spam', 'Pelecehan', 'Penipuan', 'Konten tidak pantas', 'Lainnya'].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="block">Detail<textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} rows={4} className="mt-2 w-full rounded-lg border border-border-subtle p-3 bg-surface-container-low" /></label>
          </div>}
          {action === 'block' && <p className="text-sm text-text-secondary">{settings?.blocked ? `Izinkan pesan dan panggilan dengan ${peer.name} kembali?` : `${peer.name} tidak dapat mengirim pesan atau menelepon Anda. Anda juga tidak dapat menghubunginya selama diblokir.`}</p>}
          {action === 'delete' && <p className="text-sm text-text-secondary">Riwayat chat dihapus hanya untuk Anda. Riwayat lawan chat tetap tersedia. Pesan baru akan muncul kembali.</p>}
          {error && <p role="alert" className="mt-3 text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" disabled={busy} onClick={() => setAction(null)} className="rounded-lg px-4 py-2 text-sm hover:bg-surface-container-low">Batal</button>
            <button type="submit" disabled={busy} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${action === 'delete' || action === 'block' ? 'bg-red-600' : 'bg-primary'}`}>{busy ? <Loader2 size={18} className="animate-spin" /> : action === 'delete' ? 'Hapus chat' : action === 'report' ? 'Kirim laporan' : 'Simpan'}</button>
          </div>
        </form>
      </div>}
    </aside>
  );
}
