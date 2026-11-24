import { useLanguage } from '../context/LanguageContext';
import AppLayout from '../components/modern/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { profileUrl } from '../utils/profileUrl';

export default function NotificationsPage() {
  const { t: translateUI } = useLanguage();

  const navigate=useNavigate();
  const {notifications,notificationsLoading,openNotification,markAllAsRead}=useNotifications(n=>n.entity_hash?navigate(`/post/${n.entity_hash}`):n.actor&&navigate(profileUrl(n.actor)));
  return <AppLayout currentTab="notifications"><section className="postter-page-panel"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{translateUI("Notifikasi")}</h1><button className="shrink-0" onClick={markAllAsRead}>{translateUI("Tandai dibaca")}</button></div><p className="text-text-secondary mt-2 mb-6">{translateUI("Ikuti kabar terbaru dari percakapan dan interaksi Anda.")}</p>{notificationsLoading&&<p>{translateUI("Memuat…")}</p>}{!notificationsLoading&&!notifications.length&&<p>{translateUI("Belum ada notifikasi.")}</p>}{notifications.map(n=><button className="postter-notification" key={n.id} onClick={()=>openNotification(n)}><strong>{n.actor?.name||translateUI("Postter")}</strong><span>{n.message||n.body||n.type}</span>{!n.read_at&&<small>{translateUI("Baru")}</small>}</button>)}</section></AppLayout>;
}
