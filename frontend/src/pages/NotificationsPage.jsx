import AppLayout from '../components/modern/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { profileUrl } from '../utils/profileUrl';

export default function NotificationsPage() {
  const navigate=useNavigate();
  const {notifications,notificationsLoading,openNotification,markAllAsRead}=useNotifications(n=>n.entity_hash?navigate(`/post/${n.entity_hash}`):n.actor&&navigate(profileUrl(n.actor)));
  return <AppLayout currentTab="notifications"><section className="postter-page-panel"><div className="flex justify-between gap-3"><h1 className="text-2xl font-bold">Notifikasi</h1><button onClick={markAllAsRead}>Tandai dibaca</button></div><p className="text-text-secondary mt-2 mb-6">Ikuti kabar terbaru dari percakapan dan interaksi Anda.</p>{notificationsLoading&&<p>Memuat…</p>}{!notificationsLoading&&!notifications.length&&<p>Belum ada notifikasi.</p>}{notifications.map(n=><button className="postter-notification" key={n.id} onClick={()=>openNotification(n)}><strong>{n.actor?.name||'Postter'}</strong><span>{n.message||n.body||n.type}</span>{!n.read_at&&<small>Baru</small>}</button>)}</section></AppLayout>;
}
