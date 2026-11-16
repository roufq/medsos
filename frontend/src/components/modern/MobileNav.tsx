import { Home, Compass, ShoppingBag, Plus, Bell, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profileUrl } from '../../utils/profileUrl';

export default function MobileNav({ user, currentTab, onCreate }: any) {
  const navigate = useNavigate();
  const items = [
    ['home', 'Home', Home, user ? '/' : '/home'], ['explore', 'Explore', Compass, '/explore'],
    ['shop', 'Shop', ShoppingBag, '/shop'], ['newpost', 'New Post', Plus, null],
    ['notifications', 'Notification', Bell, '/notifications'], ['profile', 'Profil', UserRound, user ? profileUrl(user) : '/login'],
  ] as const;
  return <nav className="postter-mobile-nav" aria-label="Navigasi mobile">{items.map(([id,label,Icon,path]) =>
    <button key={id} type="button" aria-current={currentTab===id?'page':undefined} className={`${currentTab===id?'active':''} ${id==='newpost'?'mobile-create':''}`} onClick={() => path ? navigate(path) : onCreate()}>
      <span><Icon size={21}/></span><small>{label}</small>
    </button>
  )}</nav>;
}
