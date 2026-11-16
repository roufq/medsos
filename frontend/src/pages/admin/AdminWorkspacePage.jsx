import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Activity, Settings, ShieldCheck, Megaphone, Plus, RefreshCw } from 'lucide-react';
import AppLayout from '../../components/modern/AppLayout';
import CreatePostModal from '../../components/modern/CreatePostModal';
import AdminModerationTab from '../../components/admin/AdminModerationTab';
import { adminApi } from '../../api/adminApi';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { profileUrl } from '../../utils/profileUrl';
import { postUrl } from '../../utils/postUrl';

const tabs=[['users','Pengguna',Users],['posts','Konten & iklan',FileText],['reports','Laporan',ShieldCheck],['activity','Aktivitas',Activity],['settings','Pengaturan',Settings]];
export default function AdminWorkspacePage() {
  const { user }=useAuth();
  const { uploadLimitsEnabled, refreshSettings }=usePlatform();
  const [tab,setTab]=useState('users'),[users,setUsers]=useState([]),[posts,setPosts]=useState([]),[activity,setActivity]=useState([]),[sessions,setSessions]=useState([]);
  const [query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[composer,setComposer]=useState(false);
  const [stats,setStats]=useState(null),[reports,setReports]=useState([]);
  const [hasMore,setMore]=useState(false);
  const load=async()=>{
    setBusy(true);setError('');
    try {
      if(tab==='users')setUsers((await adminApi.getUsers())||[]);
      if(tab==='posts'){const items=(await adminApi.getPosts(query))||[];setPosts(items);setMore(items.length===100);}
      if(tab==='reports'){const [summary,items]=await Promise.all([adminApi.getStats(),adminApi.getReports()]);setStats(summary);setReports(items||[]);}
      if(tab==='activity'){const [events,logins]=await Promise.all([adminApi.getActivity(),adminApi.getSessions()]);setActivity(events||[]);setSessions(logins||[]);}
    }catch(e){setError(e.response?.data?.error||'Data belum dapat dimuat.');}finally{setBusy(false);}
  };
  useEffect(()=>{load();setQuery('');setNotice('');},[tab]);
  useEffect(()=>{if(tab!=='posts')return;const timer=setTimeout(load,300);return()=>clearTimeout(timer);},[query]);
  const action=async(fn,message)=>{setBusy(true);setError('');setNotice('');try{await fn();await load();setNotice(message);}catch(e){setError(e.response?.data?.error||'Perubahan gagal disimpan.');}finally{setBusy(false);}};
  const match=text=>String(text||'').toLowerCase().includes(query.toLowerCase());
  return <AppLayout currentTab="admin" wide><section className="postter-page-panel admin-workspace">
    <div className="admin-heading"><div><span className="landing-eyebrow">KELOLA KOMUNITAS</span><h1>Ruang administrator</h1><p>Jaga komunitas tetap aman, dukung kreator, dan atur pertumbuhan Postter.</p></div><button disabled={busy} onClick={load} aria-label="Muat ulang data"><RefreshCw size={18}/></button></div>
    <nav className="admin-tabs" aria-label="Pengaturan administrator">{tabs.map(([id,label,Icon])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}><Icon size={17}/>{label}</button>)}</nav>
    {error&&<p role="alert" className="admin-error">{error}</p>}{notice&&<p role="status" className="admin-notice">{notice}</p>}
    {(tab==='users'||tab==='posts')&&<div className="admin-toolbar"><input aria-label="Cari data admin" placeholder={tab==='users'?'Cari nama, username, atau email…':'Cari judul atau deskripsi…'} value={query} onChange={e=>setQuery(e.target.value)}/>{tab==='posts'&&<button className="landing-primary" onClick={()=>setComposer(true)}><Plus size={17}/>Buat iklan</button>}</div>}
    {busy&&<p role="status">Memproses…</p>}
    {tab==='users'&&<div className="admin-table-wrap"><table><thead><tr><th>Pengguna</th><th>Status</th><th>Verifikasi</th><th>Moderasi</th></tr></thead><tbody>{users.filter(u=>match(`${u.name} ${u.username} ${u.email}`)).map(u=><tr key={u.id}><td><Link to={profileUrl(u)}><strong>{u.name}</strong></Link><small>@{u.username} · {u.email}</small></td><td>{u.account_status||'active'}<small>{u.role}</small></td><td><button disabled={busy} onClick={()=>action(()=>adminApi.verifyUser(u.id,!u.admin_verified),'Verifikasi diperbarui.')}><ShieldCheck size={15}/>{u.admin_verified?'Cabut verifikasi admin':'Berikan centang biru'}</button></td><td><div className="admin-row-actions"><button disabled={busy||u.id===user.id||u.account_status==='deleted'} onClick={()=>action(()=>u.account_status==='blocked'?adminApi.unblockUser(u.id):adminApi.blockUser(u.id),'Status akun diperbarui.')}>{u.account_status==='blocked'?'Buka blokir':'Blokir'}</button><button className="text-error" disabled={busy||u.role==='admin'||u.account_status==='deleted'} onClick={()=>{if(window.confirm(`Hapus akun ${u.name}? Akun akan dinonaktifkan, kontennya disembunyikan, dan sesinya dicabut.`))action(()=>adminApi.deleteUser(u.id),'Akun dihapus dari platform.');}}>Hapus akun</button></div></td></tr>)}</tbody></table>{!users.length&&!busy&&<p>Belum ada pengguna.</p>}</div>}
    {tab==='posts'&&<div className="admin-post-list">{posts.filter(p=>match(`${p.title} ${p.content} ${p.user?.name}`)).map(p=><article key={p.id}><div><Link to={postUrl(p)}><h2>{p.title||'Tanpa judul'}</h2></Link><p>{p.user?.name} · {p.visibility} {p.is_sponsored&&'· Iklan'}</p><p className="line-clamp-2">{p.content}</p></div><div className="admin-row-actions"><button disabled={busy} onClick={()=>action(()=>adminApi.sponsorPost(p.public_hash||p.id,!p.is_sponsored),'Status iklan diperbarui.')}><Megaphone size={16}/>{p.is_sponsored?'Hentikan iklan':'Jadikan iklan'}</button><button disabled={busy} className="text-error" onClick={()=>{if(window.confirm(`Hapus postingan “${p.title||'tanpa judul'}”?`))action(()=>adminApi.deletePost(p.public_hash||p.id),'Postingan dihapus.');}}>Hapus konten</button></div></article>)}{!posts.length&&!busy&&<p>Belum ada postingan.</p>}</div>}
    {tab==='posts'&&hasMore&&<button disabled={busy} className="landing-primary mt-5" onClick={async()=>{setBusy(true);try{const items=(await adminApi.getPosts(query,posts.at(-1)?.id))||[];setPosts(current=>[...current,...items]);setMore(items.length===100);}catch(e){setError(e.response?.data?.error||'Gagal memuat konten berikutnya.');}finally{setBusy(false);}}}>Muat konten berikutnya</button>}
    {tab==='reports'&&<AdminModerationTab stats={stats} reports={reports} onReview={(id,status,remove)=>action(()=>adminApi.reviewReport(id,status,remove),'Laporan diperbarui.')}/>}
    {tab==='activity'&&<><h2 className="font-bold text-lg mb-3">Aktivitas sesi terbaru</h2><div className="admin-table-wrap"><table><thead><tr><th>Pengguna</th><th>Aktivitas terakhir</th><th>Sesi berlaku sampai</th></tr></thead><tbody>{sessions.map((s,i)=><tr key={i}><td>{s.name}<small>@{s.username}</small></td><td>{new Date(s.last_activity).toLocaleString('id-ID')}</td><td>{new Date(s.expires_at).toLocaleString('id-ID')}</td></tr>)}</tbody></table></div><h2 className="font-bold text-lg mt-8 mb-3">Riwayat tindakan</h2><div className="admin-table-wrap"><table><thead><tr><th>Pengguna</th><th>Tindakan</th><th>Waktu</th></tr></thead><tbody>{activity.map(a=><tr key={a.id}><td>{a.user?.name||a.user_id}</td><td><strong>{a.action}</strong><small>{a.target}</small></td><td>{new Date(a.created_at).toLocaleString('id-ID')}</td></tr>)}</tbody></table>{!activity.length&&<p>Belum ada aktivitas tercatat.</p>}</div></>}
    {tab==='settings'&&<div className="admin-policy"><div><h2>Pembatasan upload & paket</h2><p>{uploadLimitsEnabled?'Kuota posting sesuai paket sedang aktif.':'Posting bebas kuota paket. Halaman pricing disembunyikan di desktop dan mobile.'}</p></div><label><input type="checkbox" checked={uploadLimitsEnabled} disabled={busy} onChange={e=>{const enabled=e.target.checked;action(async()=>{await adminApi.updateSettings(enabled);await refreshSettings();},'Pengaturan upload disimpan.');}}/>Aktifkan pembatasan upload</label><p className="text-text-secondary text-sm">Centang biru yang diberikan admin tetap berlaku tanpa langganan. Batas keamanan ukuran dan jenis file tetap mengikuti kapasitas platform.</p></div>}
    <CreatePostModal isOpen={composer} onClose={()=>setComposer(false)} onSaved={async post=>{setComposer(false);await action(()=>adminApi.sponsorPost(post.public_hash||post.id,true),'Postingan iklan berhasil dibuat.');}}/>
  </section></AppLayout>;
}
