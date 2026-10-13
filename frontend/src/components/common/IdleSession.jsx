import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi } from '../../api/authApi';
const LOGOUT_KEY = 'theposter-logout';
export default function IdleSession() {
  const { user, logout } = useAuth(); const { language } = useLanguage();
  const [remaining, setRemaining] = useState(null); const resume = useRef(() => {});
  useEffect(() => {
    if (!user) { setRemaining(null); return; }
    let disposed = false, timer, trailing, idleLimit = 1800000, lastActivity = Date.now(), lastPing = 0, key = '', ending = false;
    const readActivity = () => { try { return Number(localStorage.getItem(key)) || lastActivity; } catch { return lastActivity; } };
    const end = async () => {
      if (ending || disposed) return; ending = true; clearInterval(timer); clearTimeout(trailing);
      await logout(); window.location.assign('/login?reason=session_idle_expired');
    };
    const check = () => {
      if (!key || ending) return;
      lastActivity = Math.max(lastActivity, readActivity());
      const left = idleLimit - (Date.now() - lastActivity);
      if (left <= 0) { end(); return; }
      setRemaining(left <= 60000 ? Math.ceil(left / 1000) : null);
    };
    const ping = () => { if (disposed || ending) return; lastPing = Date.now(); authApi.activity().catch(() => {}); };
    const activity = () => {
      if (!key || ending) return;
      // Activity after the deadline cannot revive an expired session.
      if (Date.now() - Math.max(lastActivity, readActivity()) >= idleLimit) { end(); return; }
      if (Date.now() - lastActivity < 1000) return;
      lastActivity = Date.now(); setRemaining(null);
      try { localStorage.setItem(key, String(lastActivity)); } catch { /* storage disabled */ }
      if (Date.now() - lastPing >= 15000) { clearTimeout(trailing); ping(); }
      else if (!trailing) trailing = window.setTimeout(() => { trailing = null; ping(); }, 15000 - (Date.now() - lastPing));
    };
    resume.current = activity;
    const storage = (event) => {
      if (event.key === LOGOUT_KEY) { disposed = true; window.location.assign('/login'); }
      else if (event.key === key) check();
    };
    const wake = () => { if (document.visibilityState === 'visible') check(); };
    authApi.session().then((info) => {
      if (disposed) return;
      idleLimit = info.idle_timeout_seconds * 1000;
      key = `theposter-session-activity-${info.session_id || user.id}`;
      lastActivity = new Date(info.last_activity).getTime() || Date.now();
      lastActivity = Math.max(lastActivity, readActivity()); check();
      timer = window.setInterval(check, 1000);
    }).catch(() => {});
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];
    events.forEach((name) => window.addEventListener(name, activity, { passive: true }));
    window.addEventListener('storage', storage); window.addEventListener('focus', check); document.addEventListener('visibilitychange', wake);
    return () => { disposed = true; clearInterval(timer); clearTimeout(trailing); events.forEach((name) => window.removeEventListener(name, activity)); window.removeEventListener('storage', storage); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', wake); };
  }, [user?.id]);
  if (!user || remaining === null) return null;
  return <div className="idle-session-warning" role="alert"><Clock size={21}/><div><strong>{language === 'en' ? 'Your session is about to expire' : 'Sesi Anda akan berakhir'}</strong><p>{language === 'en' ? `You will be logged out in ${remaining} seconds due to inactivity.` : `Anda akan keluar dalam ${remaining} detik karena tidak aktif.`}</p></div><button type="button" onClick={() => resume.current()}>{language === 'en' ? 'Stay signed in' : 'Tetap masuk'}</button></div>;
}
