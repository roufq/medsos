import { useLanguage } from '../../context/LanguageContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Activity, Settings, ShieldCheck, Megaphone, Plus, RefreshCw } from 'lucide-react';
import AppLayout from '../../components/modern/AppLayout';
import CreatePostModal from '../../components/modern/CreatePostModal';
import AdminActivityPanel from '../../components/admin/AdminActivityPanel';
import AdminModerationTab from '../../components/admin/AdminModerationTab';
import { adminApi } from '../../api/adminApi';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { profileUrl } from '../../utils/profileUrl';

const tabs=[['users','Pengguna',Users],['posts','Konten & iklan',FileText],['reports','Laporan',ShieldCheck],['activity','Aktivitas',Activity],['settings','Pengaturan',Settings]];
export default function AdminWorkspacePage() {
  const { t: translateUI } = useLanguage();

  const { user }=useAuth();
  const { uploadLimitsEnabled, refreshSettings }=usePlatform();
  const [tab,setTab]=useState('users'),[users,setUsers]=useState([]),[posts,setPosts]=useState([]);
  const [query,setQuery]=useState(''),[busy,setBusy]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[composer,setComposer]=useState(false);
  const [stats,setStats]=useState(null),[reports,setReports]=useState([]);
  const [hasMore,setMore]=useState(false);
  const [contentStatus,setContentStatus]=useState('active'),[moderation,setModeration]=useState(null),[reason,setReason]=useState('');
  const [activityRefresh,setActivityRefresh]=useState(0);
  const requestVersion=useRef(0);
  const postQuery=tab==='posts'?query:'';
  const load=useCallback(()=>{
    const version=++requestVersion.current;
    let request;
    if(tab==='users') request=adminApi.getUsers();
    else if(tab==='posts') request=adminApi.getPosts(postQuery,undefined,contentStatus);
    else if(tab==='reports') request=Promise.all([adminApi.getStats(),adminApi.getReports()]);
    else return;
    return request.then(data=>{
      if(version!==requestVersion.current)return;
      if(tab==='users')setUsers(data||[]);
      if(tab==='posts'){setPosts(data||[]);setMore((data||[]).length===100);}
      if(tab==='reports'){setStats(data[0]);setReports(data[1]||[]);}
    }).catch(e=>{if(version===requestVersion.current)setError(e.response?.data?.error||'Data belum dapat dimuat.');})
      .finally(()=>{if(version===requestVersion.current)setBusy(false);});
  },[tab,postQuery,contentStatus]);
  useEffect(()=>{
    const requests=requestVersion;
    if(tab==='posts'){
      const timer=setTimeout(load,300);
      return()=>{clearTimeout(timer);requests.current++;};
    }
    load();
    return()=>{requests.current++;};
  },[load,tab]);
  const refresh=()=>{if(tab==='settings')return;setBusy(true);setError('');return load();};
  const action=async(fn,message)=>{setBusy(true);setError('');setNotice('');try{await fn();await load();setNotice(message);return true;}catch(e){setError(e.response?.data?.error||'Perubahan gagal disimpan.');return false;}finally{setBusy(false);}};
  const match=text=>String(text||'').toLowerCase().includes(query.toLowerCase());
  return <AppLayout currentTab="admin" wide><section className="postter-page-panel admin-workspace">
    <div className="admin-heading"><div><span className="landing-eyebrow">{translateUI("KELOLA KOMUNITAS")}</span><h1>{translateUI("Ruang administrator")}</h1><p>{translateUI("Jaga komunitas tetap aman, dukung kreator, dan atur pertumbuhan Postter.")}</p></div><button disabled={busy} onClick={()=>tab==='activity'?setActivityRefresh(value=>value+1):refresh()} aria-label={translateUI("Muat ulang data")}><RefreshCw size={18}/></button></div>
    <nav className="admin-tabs" aria-label={translateUI("Pengaturan administrator")}>{tabs.map(([id,label,Icon])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>{if(id===tab)return;setTab(id);setQuery('');setNotice('');setError('');setBusy(id==='users'||id==='posts'||id==='reports');setPosts([]);setMore(false);}}><Icon size={17}/>{translateUI(label)}</button>)}</nav>
    {error&&<p role="alert" className="admin-error">{translateUI(error)}</p>}{notice&&<p role="status" className="admin-notice">{translateUI(notice)}</p>}
    {(tab==='users'||tab==='posts')&&<div className="admin-toolbar"><input aria-label={translateUI("Cari data admin")} placeholder={tab==='users'?translateUI("Cari nama, username, atau email…"):translateUI("Cari judul atau deskripsi…")} value={query} onChange={e=>{setQuery(e.target.value);if(tab==='posts'){setBusy(true);setError('');}}}/>{tab==='posts'&&<select aria-label={translateUI('Status konten')} value={contentStatus} onChange={event=>{setContentStatus(event.target.value);setBusy(true);setError('');}}><option value="active">{translateUI('Konten aktif')}</option><option value="removed">{translateUI('Konten dihapus')}</option><option value="all">{translateUI('Semua konten')}</option></select>}{tab==='posts'&&<button className="landing-primary" onClick={()=>setComposer(true)}><Plus size={17}/>{translateUI("Buat iklan")}</button>}</div>}
    {busy&&<p role="status">{translateUI("Memproses…")}</p>}
    {tab==='users'&&<div className="admin-table-wrap"><table><thead><tr><th>{translateUI("Pengguna")}</th><th>{translateUI("Status")}</th><th>{translateUI("Verifikasi")}</th><th>{translateUI("Moderasi")}</th></tr></thead><tbody>{users.filter(u=>match(`${u.name} ${u.username} ${u.email}`)).map(u=><tr key={u.id}><td><Link to={profileUrl(u)}><strong>{u.name}</strong></Link><small>@{u.username} · {u.email}</small></td><td>{u.account_status||translateUI("active")}<small>{u.role}</small></td><td><button disabled={busy} onClick={()=>action(()=>adminApi.verifyUser(u.id,!u.admin_verified),'Verifikasi diperbarui.')}><ShieldCheck size={15}/>{u.admin_verified?translateUI("Cabut verifikasi admin"):translateUI("Berikan centang biru")}</button></td><td><div className="admin-row-actions"><button disabled={busy||u.id===user.id||u.account_status==='deleted'} onClick={()=>action(()=>u.account_status==='blocked'?adminApi.unblockUser(u.id):adminApi.blockUser(u.id),'Status akun diperbarui.')}>{u.account_status==='blocked'?translateUI("Buka blokir"):translateUI("Blokir")}</button><button className="text-error" disabled={busy||u.role==='admin'||u.account_status==='deleted'} onClick={()=>{if(window.confirm(`Hapus akun ${u.name}? Akun akan dinonaktifkan, kontennya disembunyikan, dan sesinya dicabut.`))action(()=>adminApi.deleteUser(u.id),'Akun dihapus dari platform.');}}>{translateUI("Hapus akun")}</button></div></td></tr>)}</tbody></table>{!users.length&&!busy&&<p>{translateUI("Belum ada pengguna.")}</p>}</div>}
    {tab==='posts'&&<div className="admin-post-list">{posts.map(p=><article key={p.id}><div><h2>{p.title||translateUI("Tanpa judul")}</h2><p>{p.user?.name} · {p.visibility} {p.is_sponsored&&translateUI("· Iklan")}</p><p className="line-clamp-2">{p.content}</p>{p.removed_at&&<p className="text-error">{translateUI('Alasan')}: {p.moderation_reason}</p>}<details className="admin-content-preview"><summary>{translateUI('Lihat konten')}</summary><p className="whitespace-pre-wrap break-words">{p.content}</p>{(p.media||[]).map(media=>media.media_type==='video'?<video key={media.id} src={media.media_url} controls preload="metadata"/>:<img key={media.id} src={media.media_url} alt="" loading="lazy"/>)}{p.link&&<a href={p.link.url} target="_blank" rel="noopener noreferrer">{p.link.title||p.link.url}</a>}</details></div><div className="admin-row-actions"><button disabled={busy||Boolean(p.removed_at)} onClick={()=>action(()=>adminApi.sponsorPost(p.public_hash||p.id,!p.is_sponsored),'Status iklan diperbarui.')}><Megaphone size={16}/>{p.is_sponsored?translateUI("Hentikan iklan"):translateUI("Jadikan iklan")}</button><button disabled={busy} className={p.removed_at?'':'text-error'} onClick={()=>{setError('');setReason('');setModeration({post:p,restore:Boolean(p.removed_at)});}}>{translateUI(p.removed_at?'Pulihkan konten':'Hapus konten')}</button></div></article>)}{!posts.length&&!busy&&<p>{translateUI("Belum ada postingan.")}</p>}</div>}
    {tab==='posts'&&hasMore&&<button disabled={busy} className="landing-primary mt-5" onClick={async()=>{setBusy(true);try{const items=(await adminApi.getPosts(query,posts.at(-1)?.id,contentStatus))||[];setPosts(current=>[...current,...items]);setMore(items.length===100);}catch(e){setError(e.response?.data?.error||'Gagal memuat konten berikutnya.');}finally{setBusy(false);}}}>{translateUI("Muat konten berikutnya")}</button>}
    {tab==='reports'&&<AdminModerationTab stats={stats} reports={reports} onReview={(id,status,remove)=>action(()=>adminApi.reviewReport(id,status,remove),'Laporan diperbarui.')}/>}
    {tab==='activity'&&<AdminActivityPanel key={activityRefresh}/>}
    {tab==='settings'&&<div className="admin-policy"><div><h2>{translateUI("Pembatasan upload & paket")}</h2><p>{uploadLimitsEnabled?translateUI("Kuota posting sesuai paket sedang aktif."):translateUI("Posting bebas kuota paket. Halaman pricing disembunyikan di desktop dan mobile.")}</p></div><label><input type="checkbox" checked={uploadLimitsEnabled} disabled={busy} onChange={e=>{const enabled=e.target.checked;action(async()=>{await adminApi.updateSettings(enabled);await refreshSettings();},'Pengaturan upload disimpan.');}}/>{translateUI("Aktifkan pembatasan upload")}</label><p className="text-text-secondary text-sm">{translateUI("Centang biru yang diberikan admin tetap berlaku tanpa langganan. Batas keamanan ukuran dan jenis file tetap mengikuti kapasitas platform.")}</p></div>}
    {moderation&&<div className="admin-moderation-overlay" role="dialog" aria-modal="true" aria-labelledby="moderation-title"><form onSubmit={async event=>{event.preventDefault();const post=moderation.post;const ok=await action(()=>moderation.restore?adminApi.restorePost(post.public_hash,reason):adminApi.deletePost(post.public_hash,reason),moderation.restore?'Konten berhasil dipulihkan.':'Konten dihapus dan pemilik telah diberi tahu.');if(ok)setModeration(null);}}><h2 id="moderation-title">{translateUI(moderation.restore?'Pulihkan konten':'Hapus konten')}</h2><p>{moderation.post.title||translateUI('Tanpa judul')}</p><p>{translateUI('Pemilik akan menerima pemberitahuan. Konten yang dihapus dapat dipulihkan oleh admin.')}</p><label>{translateUI('Alasan moderasi (5–300 karakter)')}<textarea autoFocus value={reason} required minLength={5} maxLength={300} onChange={event=>setReason(event.target.value)}/></label>{error&&<p role="alert" className="text-error">{translateUI(error)}</p>}<div><button type="button" disabled={busy} onClick={()=>setModeration(null)}>{translateUI('Batal')}</button><button type="submit" disabled={busy||reason.trim().length<5}>{translateUI('Konfirmasi')}</button></div></form></div>}
    <CreatePostModal isOpen={composer} onClose={()=>setComposer(false)} onSaved={async post=>{setComposer(false);await action(()=>adminApi.sponsorPost(post.public_hash||post.id,true),'Postingan iklan berhasil dibuat.');}}/>
  </section></AppLayout>;
}
