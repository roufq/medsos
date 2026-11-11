import { postUrl } from '../../utils/postUrl';
import { profileUrl } from '../../utils/profileUrl';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneIncoming, PhoneOff, Video as VideoIcon } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../../context/AuthContext';
import { messageApi } from '../../api/messageApi';

interface AppLayoutProps {
  currentTab: string;
  wide?: boolean;
  children: ReactNode;
  /** Receives posts created from the sidebar/header composer. */
  onPostCreated?: (post: any) => void;
  /** Lets a page open the shared composer (e.g. the feed's "create" card). */
  composerOpen?: boolean;
  composerType?: string;
  onComposerTypeChange?: (type: string) => void;
  setComposerType?: (type?: string) => void;
  setComposerOpen?: (open: boolean) => void;
}

const ROUTES: Record<string, string> = {
  home: '/', shop: '/shop', shorts: '/videos', videos: '/videos', network: '/network', messages: '/messages', saved: '/saved',
  settings: '/settings', pricing: '/pricing', admin: '/admin/dashboard', analytics: '/analytics',
};

export function useAppNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (tab: string) => navigate(tab === 'profile' ? profileUrl(user) : ROUTES[tab] || '/');
}

export default function AppLayout({ currentTab, children, onPostCreated, composerOpen, setComposerOpen, wide, composerType, setComposerType, onComposerTypeChange }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goTo = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownComposerType, setOwnComposerType] = useState<string | undefined>();
  const [ownComposer, setOwnComposer] = useState(false);
  const isComposerOpen = composerOpen ?? ownComposer;
  const setComposer = setComposerOpen ?? setOwnComposer;
  const openComposer = () => { onComposerTypeChange?.('image'); (setComposerType ?? setOwnComposerType)(undefined); setComposer(true); };

  const currentUser = { id: user?.id, username: user?.username || '', name: user?.name || '', title: user?.title || '', company: user?.company || '', avatar: user?.avatar_url || `${import.meta.env.BASE_URL}favicon.svg` };

  const [globalIncomingCall, setGlobalIncomingCall] = useState<{
    callId: string;
    mode: 'voice' | 'video';
    fromUser: any;
  } | null>(null);
  const handledGlobalCallsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (currentTab === 'messages' || !user?.id) {
      setGlobalIncomingCall(null);
      return;
    }
    let active = true;
    const pollGlobalCall = async () => {
      if (!active) return;
      try {
        const data = await messageApi.pollCallSignals();
        const inc = data?.active_incoming;
        if (inc && inc.call_id && !handledGlobalCallsRef.current.has(inc.call_id)) {
          setGlobalIncomingCall({
            callId: inc.call_id,
            mode: inc.call_mode === 'video' ? 'video' : 'voice',
            fromUser: inc.from_user || { id: inc.from_user_id, name: 'Pengguna' },
          });
        } else {
          setGlobalIncomingCall(null);
        }
      } catch {
        /* ignore */
      }
    };
    pollGlobalCall();
    const timer = window.setInterval(pollGlobalCall, 1500);
    window.addEventListener('focus', pollGlobalCall);
    document.addEventListener('visibilitychange', pollGlobalCall);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', pollGlobalCall);
      document.removeEventListener('visibilitychange', pollGlobalCall);
    };
  }, [currentTab, user?.id]);

  useEffect(() => {
    if (!globalIncomingCall) return;
    let audioCtx: AudioContext | null = null;
    const playBeep = () => {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        /* ignore */
      }
    };
    playBeep();
    const timer = window.setInterval(playBeep, 1800);
    return () => {
      window.clearInterval(timer);
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, [globalIncomingCall?.callId]);

  const handleAcceptGlobalCall = () => {
    if (!globalIncomingCall) return;
    const cid = globalIncomingCall.callId;
    handledGlobalCallsRef.current.add(cid);
    setGlobalIncomingCall(null);
    try {
      sessionStorage.setItem('auto_accept_call_id', cid);
    } catch {
      /* ignore */
    }
    navigate('/messages');
  };

  const handleRejectGlobalCall = async () => {
    if (!globalIncomingCall) return;
    const cid = globalIncomingCall.callId;
    handledGlobalCallsRef.current.add(cid);
    setGlobalIncomingCall(null);
    try {
      await messageApi.sendCallSignal({ call_id: cid, signal_type: 'reject' });
    } catch {
      /* ignore */
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/thanks');
  };

  return (
    <div className="poster-app bg-background text-on-background min-h-screen font-sans">
      <Header
        currentUser={currentUser as any}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={goTo as any}
        onOpenProfile={(id) => navigate(`/profile/${id}`)}
        onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
        currentTab={isComposerOpen ? 'newpost' : currentTab}
        onRequestCreatePost={openComposer}
        onLogout={handleLogout}
      />
      <main className={`poster-main ${wide ? 'poster-main-wide' : ''} ${currentTab === 'messages' ? 'poster-main-flush' : ''}`}>
        <Sidebar currentTab={currentTab} onNavigate={goTo} onRequestCreatePost={openComposer} onLogout={handleLogout} />
        {mobileOpen && <Sidebar currentTab={currentTab} onNavigate={goTo} onRequestCreatePost={openComposer} onLogout={handleLogout} mobileOpen onCloseMobile={() => setMobileOpen(false)} />}
        <div className={`flex-grow min-w-0 ${currentTab === 'messages' ? 'h-full' : ''}`}>{children}</div>
      </main>
      <CreatePostModal onTypeChange={onComposerTypeChange} initialType={setComposerType ? composerType : ownComposerType} isOpen={isComposerOpen} onClose={() => setComposer(false)} onSaved={(post) => (onPostCreated ? onPostCreated(post) : navigate(postUrl(post)))} />

      {globalIncomingCall && currentTab !== 'messages' && (
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151922] text-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-white/10 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <span className="absolute -inset-2 rounded-full bg-emerald-500/25 animate-ping" />
              <img
                src={globalIncomingCall.fromUser?.avatar_url || '/favicon.svg'}
                alt={globalIncomingCall.fromUser?.name}
                className="relative w-20 h-20 rounded-full object-cover border-2 border-emerald-400"
              />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              {globalIncomingCall.mode === 'video' ? (
                <>
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Video Call Masuk...</span>
                </>
              ) : (
                <>
                  <PhoneIncoming className="w-3.5 h-3.5" />
                  <span>Panggilan Suara Masuk...</span>
                </>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white truncate max-w-full">
              {globalIncomingCall.fromUser?.name || 'Pengguna'}
            </h3>
            {globalIncomingCall.fromUser?.username && (
              <p className="text-xs text-slate-400 mt-0.5">@{globalIncomingCall.fromUser.username}</p>
            )}
            <div className="flex items-center justify-center gap-6 mt-7 w-full">
              <button
                type="button"
                onClick={handleRejectGlobalCall}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className="w-14 h-14 rounded-full bg-rose-600 group-hover:bg-rose-500 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
                  <PhoneOff className="w-6 h-6" />
                </span>
                <span className="text-[11px] font-semibold text-slate-300">Tolak</span>
              </button>
              <button
                type="button"
                onClick={handleAcceptGlobalCall}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className="w-14 h-14 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
                  {globalIncomingCall.mode === 'video' ? (
                    <VideoIcon className="w-6 h-6" />
                  ) : (
                    <Phone className="w-6 h-6" />
                  )}
                </span>
                <span className="text-[11px] font-semibold text-slate-300">Terima</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
