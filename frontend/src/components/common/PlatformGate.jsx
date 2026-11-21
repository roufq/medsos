import {useLocation} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {usePlatform} from '../../context/PlatformContext';
export default function PlatformGate({children}){const {pathname}=useLocation();const {user,loading}=useAuth();const {settings}=usePlatform();if(!loading&&settings?.maintenance&&user?.role!=='admin'&&!['/login','/forgot-password'].includes(pathname))return <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center"><h1 className="text-3xl font-bold">Maintenance Mode</h1><p className="mt-4">{settings.maintenance_message||'We are performing maintenance. Please check back later.'}</p><a className="mt-6 underline" href="/login">Administrator Login</a></main>;return children;}
