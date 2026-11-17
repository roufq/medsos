import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const emptyFilters = { user_id: '', from: '', to: '', action: '' };

export default function AdminActivityPanel() {
  const { t, language } = useLanguage();
  const [draft, setDraft] = useState(emptyFilters), [filters, setFilters] = useState(emptyFilters);
  const [events, setEvents] = useState([]), [sessions, setSessions] = useState([]);
  const [eventMore, setEventMore] = useState(false), [sessionMore, setSessionMore] = useState(false);
  const [busy, setBusy] = useState(true), [error, setError] = useState('');
  const generation = useRef(0), sessionOffset = useRef(0);
  const date = value => new Date(value).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', { timeZone: 'UTC' }) + ' UTC';
  useEffect(() => {
    const requests = generation;
    const version = ++requests.current;
    sessionOffset.current = 0;
    const sessionFilters = { user_id: filters.user_id, from: filters.from, to: filters.to };
    Promise.allSettled([adminApi.getActivity(filters), adminApi.getSessions(sessionFilters)]).then(([activityResult, sessionResult]) => {
      if (version !== generation.current) return;
      if (activityResult.status === 'fulfilled') {
        setEvents(activityResult.value.items); setEventMore(activityResult.value.has_more);
      }
      if (sessionResult.status === 'fulfilled') {
        const logins = sessionResult.value;
        setSessions(logins.items); sessionOffset.current = logins.items.length; setSessionMore(logins.has_more);
      }
      const failures = [activityResult, sessionResult].filter(result => result.status === 'rejected');
      setError([...new Set(failures.map(result => result.reason?.response?.data?.error || result.reason?.message || 'Gagal membaca aktivitas'))].join(' '));
    }).catch(e => { if (version === generation.current) setError(e.response?.data?.error || e.message); })
      .finally(() => { if (version === generation.current) setBusy(false); });
    return () => { requests.current = version + 1; };
  }, [filters]);
  const applyFilters = next => {
    setBusy(true); setError(''); setEvents([]); setSessions([]); setEventMore(false); setSessionMore(false);
    setFilters({ ...next });
  };
  const more = async kind => {
    if (busy) return;
    const version = generation.current;
    setBusy(true); setError('');
    try {
      const sessionFilters = { user_id: filters.user_id, from: filters.from, to: filters.to };
      if (kind === 'events') {
        const data = await adminApi.getActivity({ ...filters, before_id: events.at(-1)?.id });
        if (version !== generation.current) return;
        if (!Array.isArray(data.items)) throw new Error('Data aktivitas tidak valid.');
        setEvents(current => [...current, ...data.items.filter(item => !current.some(old => old.id === item.id))]); setEventMore(data.has_more);
      } else {
        const data = await adminApi.getSessions({ ...sessionFilters, offset: sessionOffset.current });
        if (version !== generation.current) return;
        if (!Array.isArray(data.items)) throw new Error('Data aktivitas tidak valid.');
        sessionOffset.current += data.items.length;
        setSessions(current => [...current, ...data.items.filter(item => !current.some(old => old.id === item.id))]); setSessionMore(data.has_more);
      }
    } catch (e) { if (version === generation.current) setError(e.response?.data?.error || e.message); }
    finally { if (version === generation.current) setBusy(false); }
  };
  return <section>
    <form className="admin-activity-filters" onSubmit={event => { event.preventDefault(); applyFilters(draft); }}>
      <label>{t('ID pengguna')}<input type="number" min="1" value={draft.user_id} placeholder={t('Semua pengguna')} onChange={event => setDraft({ ...draft, user_id: event.target.value })}/></label>
      <label>{t('Dari tanggal (UTC)')}<input type="date" value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })}/></label>
      <label>{t('Sampai tanggal (UTC)')}<input type="date" min={draft.from} value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })}/></label>
      <label>{t('Tindakan')}<select value={draft.action} onChange={event => setDraft({ ...draft, action: event.target.value })}>
        <option value="">{t('Semua tindakan')}</option><option value="GET">{t('Melihat')}</option><option value="POST">{t('Membuat atau mengirim')}</option><option value="PUT">{t('Memperbarui')}</option><option value="DELETE">{t('Menghapus')}</option>
      </select></label>
      <button disabled={busy} type="submit">{t('Terapkan filter')}</button>
      <button disabled={busy} type="button" onClick={() => { setDraft(emptyFilters); applyFilters(emptyFilters); }}>{t('Reset filter')}</button>
    </form>
    <p className="text-sm text-text-secondary mb-4">{t('Riwayat dimulai sejak pencatatan diaktifkan. Isi pesan pribadi tidak dicatat. Filter tindakan hanya berlaku pada riwayat tindakan.')}</p>
    {error && <div role="alert" className="admin-error"><p>{t(error)}</p><button disabled={busy} className="mt-2 underline" onClick={() => applyFilters(filters)}>{t('Coba lagi')}</button></div>}
    {busy && <p role="status">{t('Memuat…')}</p>}
    <h2 className="font-bold text-lg mb-3">{t('Riwayat tindakan')}</h2>
    <div className="admin-table-wrap"><table><thead><tr><th>{t('Pengguna')}</th><th>{t('Tindakan')}</th><th>{t('Waktu')}</th></tr></thead><tbody>
      {events.map(item => <tr key={item.id}><td>{item.user?.name || item.user_id}<small>#{item.user_id} · @{item.user?.username}</small></td><td><strong>{t(item.description)}</strong><small>{item.action} {item.target}</small>{item.reason && <p>{t('Alasan')}: {item.reason}</p>}</td><td>{date(item.created_at)}</td></tr>)}
    </tbody></table>{!events.length && !busy && !error && <p>{t('Belum ada aktivitas tercatat.')}</p>}</div>
    {eventMore && <button disabled={busy} onClick={() => more('events')} className="landing-primary mt-4">{t('Muat riwayat berikutnya')}</button>}
    <h2 className="font-bold text-lg mt-8 mb-3">{t('Aktivitas sesi terbaru')}</h2>
    <div className="admin-table-wrap"><table><thead><tr><th>{t('Pengguna')}</th><th>{t('Aktivitas terakhir')}</th><th>{t('Sesi berlaku sampai')}</th></tr></thead><tbody>
      {sessions.map(item => <tr key={item.id}><td>{item.name}<small>#{item.user_id} · @{item.username}</small></td><td>{date(item.last_activity)}</td><td>{date(item.expires_at)}</td></tr>)}
    </tbody></table>{!sessions.length && !busy && !error && <p>{t('Tidak ada sesi untuk filter ini.')}</p>}</div>
    {sessionMore && <button disabled={busy} onClick={() => more('sessions')} className="landing-primary mt-4">{t('Muat sesi berikutnya')}</button>}
  </section>;
}
