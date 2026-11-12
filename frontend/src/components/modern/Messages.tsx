import { useLanguage } from '../../context/LanguageContext';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  CheckCheck,
  MessageSquare,
  ArrowLeft,
  Plus,
  MapPin,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  ShoppingBag,
  Link as LinkIcon,
  ChevronRight,
  Search,
  Smile,
  Phone,
  PhoneOff,
  PhoneIncoming,
  PhoneCall,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  VolumeX,
  Info,
  BellOff,
  Download,
  Loader2,
  X,
  Play,
  SquarePen,
  Music,
} from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import ChatDetails from './ChatDetails';
import { userApi } from '../../api/userApi';
import { postApi } from '../../api/postApi';
import { socialApi } from '../../api/socialApi';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User } from '../../types';
import { formatPrice, timeAgo } from '../../utils/postFormat';
import { postUrl } from '../../utils/postUrl';
import { acquireCallMedia } from '../../utils/callMedia';

interface MessagesProps {
  currentUser: User;
}

const QUICK_EMOJIS = ['😀', '😍', '🔥', '👏', '🙌', '❤️', '👍', '🎉', '🙏', '✨', '🤝', '🛒'];

function formatCallDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMsgTime(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function parseMeta(raw?: string): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const URL_REGEX = /(https?:\/\/[^\s]+)/i;

async function reverseGeocodeLocation(lat: number, lng: number): Promise<string> {
  const key = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
  if (key) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
    );
    const data = await res.json();
    if (data.results?.[0]?.formatted_address) return data.results[0].formatted_address;
  } else {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': navigator.language || 'id' } }
    );
    const data = await res.json();
    if (data.display_name) return data.display_name;
    const a = data.address || {};
    const place = [a.road, a.suburb || a.village || a.town || a.city, a.state, a.country]
      .filter(Boolean)
      .join(', ');
    if (place) return place;
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export default function Messages({ currentUser }: MessagesProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const intentToken = searchParams.get('t');

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | string | null>(null);
  const selectedConvIdRef = useRef<number | string | null>(null);
  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
  }, [selectedConvId]);
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(Boolean(intentToken));
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [chatBlocked, setChatBlocked] = useState(false);
  const [presenceNow, setPresenceNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setPresenceNow(Date.now());
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);
  const detailsButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { setDetailsOpen(false); setChatBlocked(false); }, [selectedConvId]);
  const [uploading, setUploading] = useState(false);

  // Left sidebar search & filter tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'shop' | 'unread'>('all');

  // Composer menus & modals
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [manualLocationLabel, setManualLocationLabel] = useState('Lokasi Saya');
  const [manualLocationAddress, setManualLocationAddress] = useState('');
  const [linkInputUrl, setLinkInputUrl] = useState('');
  const [linkInputTitle, setLinkInputTitle] = useState('');

  // Resolved one-time intent target user & shop post
  const [intentTargetUser, setIntentTargetUser] = useState<any | null>(null);
  const [pendingShopPost, setPendingShopPost] = useState<any | null>(null);
  const resolvedTokenRef = useRef<string>('');
  const autoSentShopKeyRef = useRef<string>('');

  // Real-time WebRTC Voice & Video Call state
  const [activeCall, setActiveCall] = useState<{
    callId: string;
    mode: 'voice' | 'video';
    status: 'calling' | 'ringing' | 'connecting' | 'connected';
    peerUser: any;
    isCaller: boolean;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    mode: 'voice' | 'video';
    fromUser: any;
    sdp: string;
    candidates?: string[];
  } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState(false);
  const callOwnerRef = useRef(false);
  const startingCallRef = useRef(false);
  const callConfigRef = useRef<RTCConfiguration | null>(null);

  const activeCallRef = useRef<typeof activeCall>(null);
  const incomingCallRef = useRef<typeof incomingCall>(null);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);
  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingIceRef = useRef<{ callId: string; candidate: RTCIceCandidateInit }[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callDurationRef = useRef<number>(0);
  const handledCallIdsRef = useRef<Set<string>>(new Set());

  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Resolve one-time encrypted intent token (?t=...) and immediately strip all query parameters from URL
  useEffect(() => {
    if (!intentToken) {
      if (Array.from(searchParams.keys()).length > 0) {
        setSearchParams({}, { replace: true });
      }
      return;
    }
    if (resolvedTokenRef.current === intentToken) return;
    resolvedTokenRef.current = intentToken;
    setSearchParams({}, { replace: true });

    messageApi
      .resolveIntent(intentToken)
      .then((res) => {
        if (res?.shop_post) {
          setPendingShopPost(res.shop_post);
        }
        if (res?.target_user) {
          setIntentTargetUser(res.target_user);
          setMobileShowChat(true);
        }
      })
      .catch((err: any) => {
        setError(err.response?.data?.error || 'Tautan percakapan tidak valid atau sudah kedaluwarsa.');
      });
  }, [intentToken, searchParams, setSearchParams]);

  // Load conversations and synchronize with resolved intentTargetUser
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const data = await messageApi.getConversations();
        const rawList = Array.isArray(data) ? data : [];
        const mapped = rawList.map((c: any) => {
          const lastMsg = c.messages && c.messages.length > 0 ? c.messages[0] : null;
          return {
            id: c.id,
            nickname: c.nickname || '',
            muted: Boolean(c.muted),
            peerOnline: typeof c.peer_online === 'boolean' ? c.peer_online : null,
            presenceCheckedAt: Date.now(),
            otherUser: String(c.user1_id) === String(currentUser.id) ? c.user2 : c.user1,
            lastMsg,
            unreadCount: c.id === selectedConvIdRef.current ? 0 : Number(c.unread_count || 0),
            hasShop: Boolean(c.has_shop_message || lastMsg?.message_type === 'shop'),
          };
        });

        setConversations((prev) => {
          const drafts = prev.filter(
            (d) =>
              String(d.id).startsWith('new-') &&
              !mapped.some((m) => String(m.otherUser?.id) === String(d.otherUser?.id))
          );
          return [...drafts, ...mapped];
        });
        if (mapped.length > 0 && !selectedConvIdRef.current) {
          setSelectedConvId(mapped[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat daftar percakapan.');
      }
    };
    fetchConvs();
    const syncConvs = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const data = await messageApi.getConversations();
        const rawList = Array.isArray(data) ? data : [];
        const mapped = rawList.map((c: any) => {
          const lastMsg = c.messages && c.messages.length > 0 ? c.messages[0] : null;
          return {
            id: c.id,
            nickname: c.nickname || '',
            muted: Boolean(c.muted),
            peerOnline: typeof c.peer_online === 'boolean' ? c.peer_online : null,
            presenceCheckedAt: Date.now(),
            otherUser: String(c.user1_id) === String(currentUser.id) ? c.user2 : c.user1,
            lastMsg,
            unreadCount: c.id === selectedConvIdRef.current ? 0 : Number(c.unread_count || 0),
            hasShop: Boolean(c.has_shop_message || lastMsg?.message_type === 'shop'),
          };
        });
        setConversations((prev) => {
          const drafts = prev.filter(
            (d) =>
              String(d.id).startsWith('new-') &&
              !mapped.some((m) => String(m.otherUser?.id) === String(d.otherUser?.id))
          );
          return [...drafts, ...mapped];
        });
        setSelectedConvId((currentId) => {
          if (currentId && String(currentId).startsWith('new-')) {
            const targetToken = String(currentId).replace(/^new-/, '');
            const upgraded = mapped.find(
              (m) =>
                String(m.otherUser?.public_hash) === targetToken ||
                String(m.otherUser?.id) === targetToken
            );
            if (upgraded) return upgraded.id;
          }
          return currentId || (mapped[0]?.id ?? null);
        });
      } catch {
        /* ignore background poll errors */
      }
    };
    const interval = window.setInterval(syncConvs, 2000);
    window.addEventListener('focus', syncConvs);
    document.addEventListener('visibilitychange', syncConvs);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncConvs);
      document.removeEventListener('visibilitychange', syncConvs);
    };
  }, [currentUser.id]);

  // Apply resolved intentTargetUser to conversations list
  useEffect(() => {
    if (!intentTargetUser || String(intentTargetUser.id) === String(currentUser.id)) return;
    setConversations((prev) => {
      const existing = prev.find((c) => String(c.otherUser?.id) === String(intentTargetUser.id));
      if (existing) {
        setSelectedConvId(existing.id);
        return prev;
      }
      const draftId = `new-${intentTargetUser.public_hash || intentTargetUser.id}`;
      const draft = {
        id: draftId,
        otherUser: intentTargetUser,
        lastMsg: null,
        unreadCount: 0,
        hasShop: Boolean(pendingShopPost),
      };
      setSelectedConvId(draftId);
      return [draft, ...prev];
    });
    setMobileShowChat(true);
  }, [intentTargetUser, currentUser.id, pendingShopPost]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConvId || String(selectedConvId).startsWith('new-')) {
      setMessages([]);
      return;
    }
    let active = true;
    const fetchMsgs = async () => {
      try {
        const data = await messageApi.getMessages(selectedConvId);
        if (!active) return;
        setMessages(data || []);
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConvId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err: any) {
        if (active) setError(err.response?.data?.error || 'Gagal memuat pesan.');
      }
    };
    fetchMsgs();
    const pollMsgs = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const data = await messageApi.getMessages(selectedConvId);
        if (!active) return;
        const next = Array.isArray(data) ? data : [];
        setMessages((prev) => {
          const changed =
            next.length !== prev.length ||
            next[next.length - 1]?.id !== prev[prev.length - 1]?.id ||
            next.some((m: any, idx: number) => m.is_read !== prev[idx]?.is_read);
          return changed ? next : prev;
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId
              ? { ...c, unreadCount: 0, lastMsg: next[next.length - 1] || c.lastMsg }
              : c
          )
        );
      } catch {
        /* ignore transient poll error */
      }
    };
    const interval = window.setInterval(pollMsgs, 1500);
    window.addEventListener('focus', pollMsgs);
    document.addEventListener('visibilitychange', pollMsgs);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', pollMsgs);
      document.removeEventListener('visibilitychange', pollMsgs);
    };
  }, [selectedConvId]);

  // Search users when typing in sidebar search box
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 1) {
      setUserSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const res = await socialApi.search(q);
        setUserSearchResults(res?.users || []);
      } catch {
        setUserSearchResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const selectedConv = useMemo(
    () => conversations.find((c) => c.id === selectedConvId) || null,
    [conversations, selectedConvId]
  );

  const onlineStatus = (conv: any): boolean | null => {
    if (!navigator.onLine || !conv?.presenceCheckedAt || presenceNow - conv.presenceCheckedAt > 25000) return null;
    return typeof conv.peerOnline === 'boolean' ? conv.peerOnline : null;
  };
  const presenceLabel = (online: boolean | null) => t(online === null ? 'Status tidak tersedia' : online ? 'Online' : 'Offline');
  const selectedOnline = onlineStatus(selectedConv);

  useEffect(() => {
    if (!selectedConv || !String(selectedConv.id).startsWith('new-')) return;
    const draftId = selectedConv.id;
    const peerId = selectedConv.otherUser.id;
    let active = true;
    const refresh = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const data = await messageApi.getPresence(peerId);
        if (active) setConversations(items => items.map(conv => conv.id === draftId
          ? { ...conv, peerOnline: data.online, presenceCheckedAt: Date.now() } : conv));
      } catch {
        if (active) setConversations(items => items.map(conv => conv.id === draftId ? { ...conv, peerOnline: null } : conv));
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [selectedConv?.id, selectedConv?.otherUser?.id]);

  // Auto-send Shop Product Card when redirected from a Shop post with both target_user and shop_post
  useEffect(() => {
    if (!pendingShopPost || !selectedConv?.otherUser?.id || !intentTargetUser) return;
    if (String(selectedConv.otherUser.id) === String(currentUser.id)) return;
    const key = `${selectedConv.otherUser.public_hash || selectedConv.otherUser.id}:${pendingShopPost.public_hash || pendingShopPost.id}`;
    if (autoSentShopKeyRef.current === key) return;
    if (String(selectedConv.otherUser.id) === String(intentTargetUser.id)) {
      autoSentShopKeyRef.current = key;
      sendShopProductCard(pendingShopPost);
    }
  }, [pendingShopPost, selectedConv?.otherUser?.id, intentTargetUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const appendSentMessage = (sentMsg: any, isShopMsg = false) => {
    setMessages((prev) => [...prev, sentMsg]);
    const persistedConversationId = sentMsg.conversation_id;
    setSelectedConvId(persistedConversationId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? {
              ...c,
              id: persistedConversationId,
              lastMsg: sentMsg,
              hasShop: c.hasShop || isShopMsg || sentMsg.message_type === 'shop',
            }
          : c
      )
    );
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || !selectedConv || sending || chatBlocked) return;

    messageInputRef.current?.focus({ preventScroll: true });
    setSending(true);
    setError('');
    try {
      const urlMatch = text.match(URL_REGEX);
      let extra: any = { message_type: 'text' };
      if (urlMatch) {
        const matchedUrl = urlMatch[1];
        let host = matchedUrl;
        try {
          host = new URL(matchedUrl).hostname.replace(/^www\./, '');
        } catch {
          /* keep raw */
        }
        extra = {
          message_type: 'link',
          metadata_json: JSON.stringify({
            url: matchedUrl,
            title: text.replace(matchedUrl, '').trim() || host,
          }),
        };
      }
      const sentMsg = await messageApi.sendMessage(selectedConv.otherUser.id, text, extra);
      appendSentMessage(sentMsg);
      setMessageText('');
      setEmojiMenuOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim pesan.');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (files: File[] | FileList | null) => {
    const fileList = files ? Array.from(files) : [];
    if (!fileList.length || !selectedConv) return;
    setAttachMenuOpen(false);
    setUploading(true);
    setError('');

    for (const file of fileList) {
      try {
        const uploaded = await messageApi.uploadAttachment(file);
        const caption = messageText.trim() || file.name;
        const sentMsg = await messageApi.sendMessage(selectedConv.otherUser.id, caption, {
          message_type: uploaded.message_type || 'file',
          attachment_url: uploaded.url,
          attachment_name: uploaded.file_name || file.name,
          attachment_size: uploaded.file_size || file.size,
          attachment_mime: uploaded.mime_type || file.type,
        });
        appendSentMessage(sentMsg);
        if (messageText.trim()) setMessageText('');
      } catch (err: any) {
        setError(err.response?.data?.error || `Gagal mengirim file ${file.name}`);
      }
    }
    setUploading(false);
  };

  const sendCurrentGpsLocation = () => {
    if (!selectedConv) return;
    setAttachMenuOpen(false);
    if (!navigator.geolocation) {
      setLocationModalOpen(true);
      return;
    }
    setLocatingGps(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const address = await reverseGeocodeLocation(lat, lng);
          const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          const sentMsg = await messageApi.sendMessage(
            selectedConv.otherUser.id,
            `📍 Lokasi Saya: ${address}`,
            {
              message_type: 'location',
              metadata_json: JSON.stringify({
                label: 'Lokasi Saya',
                address,
                lat,
                lng,
                map_url: mapUrl,
              }),
            }
          );
          appendSentMessage(sentMsg);
        } catch (err: any) {
          setError(err.response?.data?.error || 'Gagal mengirim lokasi.');
        } finally {
          setLocatingGps(false);
        }
      },
      () => {
        setLocatingGps(false);
        setLocationModalOpen(true);
      },
      { timeout: 10000 }
    );
  };

  const sendManualLocation = async () => {
    if (!selectedConv || !manualLocationAddress.trim()) return;
    setSending(true);
    setError('');
    try {
      const label = manualLocationLabel.trim() || 'Lokasi Saya';
      const address = manualLocationAddress.trim();
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      const sentMsg = await messageApi.sendMessage(
        selectedConv.otherUser.id,
        `📍 ${label}: ${address}`,
        {
          message_type: 'location',
          metadata_json: JSON.stringify({
            label,
            address,
            map_url: mapUrl,
          }),
        }
      );
      appendSentMessage(sentMsg);
      setManualLocationAddress('');
      setLocationModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim lokasi.');
    } finally {
      setSending(false);
    }
  };

  const sendLinkAttachment = async () => {
    if (!selectedConv || !linkInputUrl.trim()) return;
    setSending(true);
    setError('');
    try {
      let url = linkInputUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      const title = linkInputTitle.trim() || new URL(url).hostname.replace(/^www\./, '');
      const sentMsg = await messageApi.sendMessage(selectedConv.otherUser.id, `${title} — ${url}`, {
        message_type: 'link',
        metadata_json: JSON.stringify({ title, url }),
      });
      appendSentMessage(sentMsg);
      setLinkInputUrl('');
      setLinkInputTitle('');
      setLinkModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim tautan.');
    } finally {
      setSending(false);
    }
  };

  const sendShopProductCard = async (post: any) => {
    if (!selectedConv || !post) return;
    setSending(true);
    setError('');
    try {
      const shop = post.shop || {};
      const firstImage = (post.media || []).find((m: any) => m.media_type === 'image')?.media_url || '';
      const priceText = shop.price_minor
        ? formatPrice(shop.price_minor, shop.currency || 'IDR')
        : '';
      const productUrl = postUrl(post);
      const token = post.public_hash || post.id;
      const sentMsg = await messageApi.sendMessage(
        selectedConv.otherUser.public_hash || selectedConv.otherUser.id,
        `🛍️ ${post.title || 'Produk'}${priceText ? ` - ${priceText}` : ''}`,
        {
          message_type: 'shop',
          metadata_json: JSON.stringify({
            post_id: token,
            title: post.title || 'Produk Marketplace',
            price_formatted: priceText,
            price_minor: shop.price_minor,
            currency: shop.currency || 'IDR',
            image_url: firstImage,
            category: shop.category || '',
            condition: shop.condition || '',
            url: productUrl,
          }),
        }
      );
      appendSentMessage(sentMsg, true);
      setPendingShopPost(null);
      setIntentTargetUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim kartu produk.');
    } finally {
      setSending(false);
    }
  };

  const startConversationWithUser = (u: any) => {
    if (!u || String(u.id) === String(currentUser.id)) return;
    setSearchQuery('');
    setUserSearchResults([]);
    const existing = conversations.find((c) => String(c.otherUser?.id) === String(u.id));
    if (existing) {
      setSelectedConvId(existing.id);
      setMobileShowChat(true);
      return;
    }
    const draft = {
      id: `new-${u.id}`,
      otherUser: u,
      lastMsg: null,
      unreadCount: 0,
      hasShop: false,
    };
    setConversations((prev) => [draft, ...prev]);
    setSelectedConvId(draft.id);
    setMobileShowChat(true);
  };

  // ==========================================================
  // WebRTC Voice Call & Video Call Logic
  // ==========================================================
  const cleanupCallMedia = () => {
    if (pcRef.current) {
      try {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
      } catch {
        /* ignore */
      }
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          /* ignore */
        }
      });
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    pendingIceRef.current = [];
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    activeCallRef.current = null;
    incomingCallRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
    setCallDuration(0);
    callDurationRef.current = 0;
    setIsMicMuted(false);
    setIsCamOff(false);
    setIsSpeakerMuted(false);
    setAudioPlaybackBlocked(false);
  };

  useEffect(() => {
    return () => {
      const callId = activeCallRef.current?.callId;
      cleanupCallMedia();
      if (callId) void messageApi.sendCallSignal({ call_id: callId, signal_type: 'hangup' }).catch(() => {});
    };
  }, []);

  // Synthesized ringtone / ringback tone via Web Audio API while calling or receiving a call
  useEffect(() => {
    const isRinging =
      Boolean(incomingCall) ||
      activeCall?.status === 'calling' ||
      activeCall?.status === 'ringing';
    if (!isRinging) return;
    let audioCtx: AudioContext | null = null;
    const playBeep = () => {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(incomingCall ? 520 : 440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        /* ignore audio autoplay restrictions */
      }
    };
    playBeep();
    const timer = window.setInterval(playBeep, 1800);
    return () => {
      window.clearInterval(timer);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [incomingCall, activeCall?.status]);

  // Live duration timer & 35s unanswered ring timeout
  useEffect(() => {
    if (!activeCall) return;
    if (activeCall.status === 'calling' || activeCall.status === 'ringing') {
      const timeout = window.setTimeout(() => {
        if (
          activeCallRef.current?.status === 'calling' ||
          activeCallRef.current?.status === 'ringing'
        ) {
          const cid = activeCallRef.current.callId;
          cleanupCallMedia();
          if (cid) {
            messageApi
              .sendCallSignal({ call_id: cid, signal_type: 'hangup', duration_seconds: 0 })
              .then((res) => {
                if (res?.message) appendSentMessage(res.message);
              })
              .catch(() => {});
          }
        }
      }, 35000);
      return () => window.clearTimeout(timeout);
    }
    if (activeCall.status === 'connecting') {
      const timeout = window.setTimeout(() => {
        setError('Koneksi suara/video gagal terbentuk. Periksa jaringan atau konfigurasi TURN server.');
        endActiveCall();
      }, 30000);
      return () => window.clearTimeout(timeout);
    }
    if (activeCall.status === 'connected') {
      const interval = window.setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          callDurationRef.current = next;
          return next;
        });
      }, 1000);
      return () => window.clearInterval(interval);
    }
  }, [activeCall?.status, activeCall?.callId]);

  const playRemoteAudio = async () => {
    const audio = remoteAudioRef.current;
    if (!audio?.srcObject) return;
    try {
      await audio.play();
      if (remoteAudioRef.current === audio) setAudioPlaybackBlocked(false);
    } catch {
      if (remoteAudioRef.current === audio) setAudioPlaybackBlocked(true);
    }
  };

  // Attach streams after the call overlay mounts; audio has one playback element.
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
    if (remoteAudioRef.current && remoteStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
      void playRemoteAudio();
    }
  }, [activeCall]);

  const acquireMediaStream = (mode: 'voice' | 'video'): Promise<MediaStream> =>
    acquireCallMedia(navigator.mediaDevices, mode, () => setIsCamOff(true));

  const loadCallConfig = async () => {
    const config = await messageApi.getCallConfig();
    callConfigRef.current = { iceServers: config.iceServers };
  };

  const setupPeerConnection = (callId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(callConfigRef.current!);
    pcRef.current = pc;

    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
      void playRemoteAudio();
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && callId) {
        messageApi
          .sendCallSignal({
            call_id: callId,
            signal_type: 'candidate',
            candidate: JSON.stringify(event.candidate.toJSON()),
          })
          .catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('Koneksi suara/video terputus. Periksa jaringan dan konfigurasi TURN server.');
        endActiveCall();
      }
    };

    return pc;
  };

  const startCall = async (mode: 'voice' | 'video', targetUserOverride?: any) => {
    const peerUser = targetUserOverride || selectedConv?.otherUser;
    if (!peerUser || activeCallRef.current || incomingCallRef.current || startingCallRef.current) return;
    if (!callOwnerRef.current) {
      setError('Panggilan ditangani tab Messages lain. Tutup tab tersebut, lalu coba lagi.');
      return;
    }
    startingCallRef.current = true;
    setError('');
    try {
      await loadCallConfig();
      const stream = await acquireMediaStream(mode);
      if (!callOwnerRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(callConfigRef.current!);
      pcRef.current = pc;
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const queuedLocalCandidates: string[] = [];
      let assignedCallId = '';

      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track));
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
        void playRemoteAudio();
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const candStr = JSON.stringify(event.candidate.toJSON());
        if (assignedCallId) {
          messageApi
            .sendCallSignal({
              call_id: assignedCallId,
              signal_type: 'candidate',
              candidate: candStr,
            })
            .catch(() => {});
        } else {
          queuedLocalCandidates.push(candStr);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        } else if (pc.connectionState === 'failed') {
          setError('Koneksi suara/video gagal. Periksa jaringan dan konfigurasi TURN server.');
          endActiveCall();
        }
      };

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: mode === 'video',
      });
      await pc.setLocalDescription(offer);

      const res = await messageApi.sendCallSignal({
        target_id: peerUser.public_hash || peerUser.username || peerUser.id,
        signal_type: 'offer',
        call_mode: mode,
        sdp: JSON.stringify(offer),
      });

      assignedCallId = res.call_id;
      if (!callOwnerRef.current) {
        void messageApi.sendCallSignal({ call_id: assignedCallId, signal_type: 'hangup' }).catch(() => {});
        return;
      }
      const initialStatus = res.callee_online ? 'ringing' : 'calling';
      const nextActive = {
        callId: assignedCallId,
        mode,
        status: initialStatus as 'calling' | 'ringing',
        peerUser,
        isCaller: true,
      };
      activeCallRef.current = nextActive;
      setActiveCall(nextActive);

      for (const candStr of queuedLocalCandidates) {
        messageApi
          .sendCallSignal({
            call_id: assignedCallId,
            signal_type: 'candidate',
            candidate: candStr,
          })
          .catch(() => {});
      }
    } catch (err: any) {
      cleanupCallMedia();
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Gagal memulai panggilan. Pastikan izin mikrofon/kamera diaktifkan.'
      );
    } finally {
      startingCallRef.current = false;
    }
  };

  const acceptIncomingCallWithInfo = async (callInfo: {
    callId: string;
    mode: 'voice' | 'video';
    fromUser: any;
    sdp: string;
    candidates?: string[];
  }) => {
    handledCallIdsRef.current.add(callInfo.callId);
    incomingCallRef.current = null;
    setIncomingCall(null);
    setError('');

    const nextActive = {
      callId: callInfo.callId,
      mode: callInfo.mode,
      status: 'connecting' as const,
      peerUser: callInfo.fromUser,
      isCaller: false,
    };
    activeCallRef.current = nextActive;
    setActiveCall(nextActive);

    try {
      await loadCallConfig();
      const stream = await acquireMediaStream(callInfo.mode);
      if (activeCallRef.current?.callId !== callInfo.callId || !callOwnerRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      localStreamRef.current = stream;

      const pc = setupPeerConnection(callInfo.callId, stream);
      const offerDesc = JSON.parse(callInfo.sdp);
      await pc.setRemoteDescription(new RTCSessionDescription(offerDesc));

      if (Array.isArray(callInfo.candidates)) {
        for (const rawCand of callInfo.candidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(rawCand)));
          } catch {
            /* ignore */
          }
        }
      }
      for (const cand of pendingIceRef.current) {
        if (cand.callId !== callInfo.callId) continue;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand.candidate));
        } catch {
          /* ignore */
        }
      }
      pendingIceRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await messageApi.sendCallSignal({
        call_id: callInfo.callId,
        signal_type: 'answer',
        sdp: JSON.stringify(answer),
      });

    } catch (err: any) {
      cleanupCallMedia();
      messageApi
        .sendCallSignal({ call_id: callInfo.callId, signal_type: 'reject' })
        .catch(() => {});
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Gagal menerima panggilan. Pastikan izin mikrofon/kamera diaktifkan.'
      );
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    await acceptIncomingCallWithInfo(incomingCall);
  };

  const rejectIncomingCall = async () => {
    if (!incomingCall) return;
    const cid = incomingCall.callId;
    handledCallIdsRef.current.add(cid);
    incomingCallRef.current = null;
    setIncomingCall(null);
    try {
      const res = await messageApi.sendCallSignal({ call_id: cid, signal_type: 'reject' });
      if (res?.message && selectedConvIdRef.current === res.message.conversation_id) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch {
      /* ignore */
    }
  };

  const endActiveCall = async () => {
    const current = activeCallRef.current;
    const dur = callDurationRef.current;
    if (current?.callId) {
      handledCallIdsRef.current.add(current.callId);
    }
    cleanupCallMedia();
    if (!current?.callId) return;
    try {
      const res = await messageApi.sendCallSignal({
        call_id: current.callId,
        signal_type: 'hangup',
        duration_seconds: dur,
      });
      if (res?.message) {
        appendSentMessage(res.message);
      }
    } catch {
      /* ignore */
    }
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    const nextMuted = !isMicMuted;
    audioTracks.forEach((t) => {
      t.enabled = !nextMuted;
    });
    setIsMicMuted(nextMuted);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const videoTracks = localStreamRef.current.getVideoTracks();
    if (videoTracks.length === 0) return;
    const nextOff = !isCamOff;
    videoTracks.forEach((t) => {
      t.enabled = !nextOff;
    });
    setIsCamOff(nextOff);
  };

  const toggleSpeaker = () => {
    const nextMuted = !isSpeakerMuted;
    if (remoteAudioRef.current) remoteAudioRef.current.muted = nextMuted;
    setIsSpeakerMuted(nextMuted);
  };

  // Real-time polling for incoming calls and WebRTC signaling events (keeps running even in background tabs)
  useEffect(() => {
    let active = true;
    let polling = false;
    let ack = 0;
    let interval: number | undefined;
    let release: (() => void) | undefined;
    const controller = new AbortController();
    const pollSignals = async () => {
      if (!active || !callOwnerRef.current || polling) return;
      polling = true;
      try {
        const data = await messageApi.pollCallSignals(ack);
        if (!active) return;
        if (typeof data.sequence === 'number' && data.sequence < ack) ack = 0;
        const events = Array.isArray(data?.events) ? data.events : [];

        let receivedOfferInBatch = false;
        for (const ev of events) {
          if (ev.signal_type === 'offer') {
            // Old offers may be replayed after a tab closes or a response is lost.
            if (data.active_incoming?.call_id !== ev.call_id) continue;
            if (handledCallIdsRef.current.has(ev.call_id)) {
              continue;
            }
            if (activeCallRef.current || incomingCallRef.current || startingCallRef.current) {
              if (
                activeCallRef.current?.callId !== ev.call_id &&
                incomingCallRef.current?.callId !== ev.call_id
              ) {
                messageApi
                  .sendCallSignal({ call_id: ev.call_id, signal_type: 'busy' })
                  .catch(() => {});
              }
              continue;
            }
            receivedOfferInBatch = true;
            const nextInc = {
              callId: ev.call_id,
              mode: (ev.call_mode === 'video' ? 'video' : 'voice') as 'voice' | 'video',
              fromUser: ev.from_user || { id: ev.from_user_id, name: 'Pengguna' },
              sdp: ev.sdp,
            };
            incomingCallRef.current = nextInc;
            setIncomingCall(nextInc);
            messageApi
              .sendCallSignal({ call_id: ev.call_id, signal_type: 'ringing' })
              .catch(() => {});
          } else if (
            ev.signal_type === 'ringing' &&
            activeCallRef.current?.callId === ev.call_id
          ) {
            setActiveCall((prev) =>
              prev && prev.status === 'calling' ? { ...prev, status: 'ringing' } : prev
            );
          } else if (
            ev.signal_type === 'answer' &&
            activeCallRef.current?.callId === ev.call_id &&
            pcRef.current
          ) {
            const pc = pcRef.current;
            if (pc.remoteDescription) continue;
            const answerDesc = JSON.parse(ev.sdp);
            await pc.setRemoteDescription(new RTCSessionDescription(answerDesc));
            for (const cand of pendingIceRef.current) {
              if (cand.callId !== ev.call_id) continue;
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand.candidate));
              } catch {
                /* ignore */
              }
            }
            pendingIceRef.current = [];
            setActiveCall((prev) =>
              prev && prev.callId === ev.call_id && prev.status !== 'connected' ? { ...prev, status: 'connecting' } : prev
            );
          } else if (ev.signal_type === 'candidate' && ev.candidate) {
            const candInit = JSON.parse(ev.candidate);
            if (
              activeCallRef.current?.callId === ev.call_id &&
              pcRef.current &&
              pcRef.current.remoteDescription
            ) {
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candInit));
              } catch {
                /* ignore */
              }
            } else {
              pendingIceRef.current.push({ callId: ev.call_id, candidate: candInit });
              if (pendingIceRef.current.length > 100) pendingIceRef.current.shift();
            }
          } else if (
            ev.signal_type === 'reject' ||
            ev.signal_type === 'busy' ||
            ev.signal_type === 'hangup'
          ) {
            if (ev.call_id) {
              handledCallIdsRef.current.add(ev.call_id);
            }
            if (incomingCallRef.current?.callId === ev.call_id) {
              incomingCallRef.current = null;
              setIncomingCall(null);
            }
            if (activeCallRef.current?.callId === ev.call_id) {
              cleanupCallMedia();
            }
          }
        }

        // Sync outgoing call ringing state if callee is online or acknowledged ringing
        if (
          data?.active_outgoing &&
          activeCallRef.current?.callId === data.active_outgoing.call_id &&
          activeCallRef.current?.status === 'calling' &&
          (data.active_outgoing.ringing_notified || data.active_outgoing.callee_online)
        ) {
          setActiveCall((prev) =>
            prev && prev.status === 'calling' ? { ...prev, status: 'ringing' } : prev
          );
        }

        // Recover ringing incoming call (or auto-accept when redirected from global call banner)
        if (
          data?.active_incoming &&
          !activeCallRef.current &&
          !handledCallIdsRef.current.has(data.active_incoming.call_id)
        ) {
          const inc = data.active_incoming;
          const nextInc = {
            callId: inc.call_id,
            mode: (inc.call_mode === 'video' ? 'video' : 'voice') as 'voice' | 'video',
            fromUser: inc.from_user || { id: inc.from_user_id, name: 'Pengguna' },
            sdp: inc.sdp,
            candidates: inc.candidates || [],
          };
          const autoAcceptId = sessionStorage.getItem('auto_accept_call_id');
          if (autoAcceptId && autoAcceptId === inc.call_id) {
            sessionStorage.removeItem('auto_accept_call_id');
            await acceptIncomingCallWithInfo(nextInc);
          } else if (!incomingCallRef.current) {
            incomingCallRef.current = nextInc;
            setIncomingCall(nextInc);
            messageApi
              .sendCallSignal({ call_id: inc.call_id, signal_type: 'ringing' })
              .catch(() => {});
          }
        } else if (!data?.active_incoming && !receivedOfferInBatch && incomingCallRef.current) {
          incomingCallRef.current = null;
          setIncomingCall(null);
        }
        for (const ev of events) ack = Math.max(ack, Number(ev.sequence) || 0);
      } catch {
        if (active && activeCallRef.current) setError('Sinyal panggilan terganggu. Mencoba menghubungkan kembali...');
      } finally {
        polling = false;
      }
    };

    if (navigator.locks) {
      void navigator.locks.request(`postter-calls:${currentUser.id}`, { signal: controller.signal }, async () => {
        if (!active) return;
        callOwnerRef.current = true;
        void pollSignals();
        interval = window.setInterval(pollSignals, 900);
        window.addEventListener('focus', pollSignals);
        document.addEventListener('visibilitychange', pollSignals);
        await new Promise<void>((resolve) => { release = resolve; });
      }).catch(() => {
        if (active) setError('Tidak dapat mengaktifkan panggilan. Muat ulang halaman.');
      });
    } else {
      setError('Panggilan memerlukan HTTPS dan browser terbaru yang mendukung Web Locks.');
    }
    return () => {
      active = false;
      callOwnerRef.current = false;
      controller.abort();
      release?.();
      window.clearInterval(interval);
      window.removeEventListener('focus', pollSignals);
      document.removeEventListener('visibilitychange', pollSignals);
    };
  }, [currentUser.id]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (activeFilter === 'shop' && !conv.hasShop && conv.lastMsg?.message_type !== 'shop') {
        return false;
      }
      if (activeFilter === 'direct' && (conv.hasShop || conv.lastMsg?.message_type === 'shop')) {
        return false;
      }
      if (activeFilter === 'unread' && !(conv.unreadCount > 0)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = (conv.nickname || conv.otherUser?.name)?.toLowerCase().includes(q);
      const userMatch = conv.otherUser?.username?.toLowerCase().includes(q);
      const msgMatch = conv.lastMsg?.content?.toLowerCase().includes(q);
      return nameMatch || userMatch || msgMatch;
    });
  }, [conversations, activeFilter, searchQuery]);

  const renderMessageContent = (msg: any, isMe: boolean) => {
    const msgType = msg.message_type || 'text';
    const meta = parseMeta(msg.metadata_json);

    // 1. Video message card (matches screenshot)
    if (msgType === 'video' && msg.attachment_url) {
      return (
        <div className="w-72 sm:w-96 rounded-2xl overflow-hidden bg-white border border-border-subtle/30 shadow-xs text-text-primary">
          <div className="relative bg-black aspect-video">
            <video
              src={msg.attachment_url}
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 flex items-center gap-2.5 bg-surface-container-low/60">
            <span className="w-7 h-7 rounded-lg bg-[#e6192b] text-white flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 fill-current" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-text-primary truncate">
                {msg.attachment_name || msg.content || 'Video'}
              </div>
              <div className="text-[11px] text-text-secondary">
                Video {msg.attachment_size ? `• ${formatFileSize(msg.attachment_size)}` : ''}
              </div>
            </div>
            <a
              href={msg.attachment_url}
              download={msg.attachment_name || true}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full hover:bg-surface-container text-text-secondary"
              title="Unduh video"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      );
    }

    // 2. Image message card (matches screenshot)
    if (msgType === 'image' && msg.attachment_url) {
      return (
        <div className="max-w-xs sm:max-w-md rounded-2xl overflow-hidden border border-border-subtle/30 shadow-xs bg-white">
          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
            <img
              src={msg.attachment_url}
              alt={msg.attachment_name || 'Gambar'}
              className="w-full max-h-72 object-cover hover:brightness-95 transition-all"
            />
          </a>
          {msg.content && msg.content !== msg.attachment_name && msg.content !== '📷 Mengirim gambar' && (
            <div className="px-3.5 py-2 text-xs text-text-primary bg-white">{msg.content}</div>
          )}
        </div>
      );
    }

    // 3. Audio message card
    if (msgType === 'audio' && msg.attachment_url) {
      return (
        <div className="w-72 sm:w-80 rounded-2xl p-3.5 bg-white border border-border-subtle/40 shadow-xs text-text-primary flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Music className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs truncate">{msg.attachment_name || 'Audio'}</div>
              <div className="text-[11px] text-text-secondary">{formatFileSize(msg.attachment_size)}</div>
            </div>
          </div>
          <audio src={msg.attachment_url} controls className="w-full h-9" />
        </div>
      );
    }

    // 4. Document / Various File attachment card
    if (msgType === 'file' && msg.attachment_url) {
      return (
        <a
          href={msg.attachment_url}
          download={msg.attachment_name || true}
          target="_blank"
          rel="noopener noreferrer"
          className="w-72 sm:w-85 rounded-2xl p-3.5 bg-surface-container-low hover:bg-surface-container border border-border-subtle/40 shadow-xs text-text-primary flex items-center gap-3 transition-colors"
        >
          <span className="w-10 h-10 rounded-xl bg-white border border-border-subtle/30 flex items-center justify-center shrink-0 text-primary">
            <FileText className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-text-primary truncate">
              {msg.attachment_name || msg.content || 'Dokumen'}
            </div>
            <div className="text-[11px] text-text-secondary">
              {formatFileSize(msg.attachment_size) || 'File Lampiran'} • Klik untuk unduh
            </div>
          </div>
          <Download className="w-4 h-4 text-text-secondary shrink-0" />
        </a>
      );
    }

    // 5. Shop Product Card (matches screenshot: Nike Air Max 270 + Rp 1.499.000 + red "Lihat Produk" button)
    if (msgType === 'shop' && meta) {
      const rawUrl = meta.url ? String(meta.url).replace(/^\/posts\//, '/post/') : '';
      const targetUrl = rawUrl || (meta.post_id ? `/post/${meta.post_id}` : '/shop');
      return (
        <div className="w-72 sm:w-85 rounded-2xl p-3 bg-white border border-border-subtle/40 shadow-xs text-text-primary flex items-center gap-3">
          {meta.image_url ? (
            <img
              src={meta.image_url}
              alt={meta.title}
              className="w-16 h-16 rounded-xl object-cover bg-surface-container-low shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
              <ShoppingBag className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="font-bold text-xs text-text-primary truncate">{meta.title || 'Produk'}</div>
              <ShoppingBag className="w-4 h-4 text-text-primary shrink-0" />
            </div>
            {(meta.price_formatted || meta.price_minor) && (
              <div className="font-extrabold text-xs text-text-primary mt-0.5">
                {meta.price_formatted || formatPrice(meta.price_minor, meta.currency || 'IDR')}
              </div>
            )}
            <div className="mt-2">
              <Link
                to={targetUrl}
                className="inline-block rounded-full bg-[#e6192b] hover:brightness-110 px-3.5 py-1 text-[11px] font-bold text-white transition-all"
              >
                Lihat Produk
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // 6. Location Card ("Lokasi Saya" + map thumbnail + address + chevron, matches screenshot)
    if (msgType === 'location') {
      const label = meta?.label || 'Lokasi Saya';
      const address = meta?.address || msg.content?.replace(/^📍\s*(Lokasi Saya:\s*)?/i, '') || 'Lihat di Peta';
      const mapUrl =
        meta?.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      return (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-72 sm:w-85 rounded-2xl p-2.5 bg-surface-container-low hover:bg-surface-container border border-border-subtle/40 shadow-xs text-text-primary flex items-center gap-3 transition-colors"
        >
          <div className="w-20 h-14 rounded-xl bg-[#e8f0fe] relative overflow-hidden flex items-center justify-center shrink-0 border border-border-subtle/20">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #cbd5e1 1px, transparent 1px), linear-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className="w-7 h-7 rounded-full bg-[#e6192b]/15 flex items-center justify-center relative z-10">
              <MapPin className="w-4 h-4 text-[#e6192b] fill-[#e6192b]/20" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-text-primary truncate">{label}</div>
            <div className="text-[11px] text-text-secondary line-clamp-2 mt-0.5">{address}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
        </a>
      );
    }

    // 7. Call History Card (Voice Call / Video Call)
    if (msgType === 'call') {
      const callMode: 'voice' | 'video' = meta?.call_mode === 'video' ? 'video' : 'voice';
      const status = meta?.status || 'completed';
      const isMissedOrRejected = status === 'missed' || status === 'rejected' || status === 'busy';
      return (
        <div className="w-64 sm:w-76 rounded-2xl p-3 bg-surface-container-low border border-border-subtle/40 shadow-xs text-text-primary flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isMissedOrRejected
                  ? 'bg-rose-500/15 text-rose-600'
                  : 'bg-emerald-500/15 text-emerald-600'
              }`}
            >
              {callMode === 'video' ? (
                <VideoIcon className="w-4.5 h-4.5" />
              ) : (
                <PhoneCall className="w-4.5 h-4.5" />
              )}
            </span>
            <div className="min-w-0">
              <div className="font-bold text-xs text-text-primary truncate">
                {callMode === 'video' ? 'Video Call' : 'Panggilan Suara'}
              </div>
              <div
                className={`text-[11px] truncate ${
                  isMissedOrRejected ? 'text-rose-500 font-semibold' : 'text-text-secondary'
                }`}
              >
                {status === 'completed'
                  ? `Berlangsung • ${formatCallDuration(Number(meta?.duration_seconds || 0))}`
                  : status === 'rejected'
                    ? 'Panggilan ditolak'
                    : status === 'busy'
                      ? 'Pengguna sedang sibuk'
                      : 'Panggilan tak terjawab'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => startCall(callMode)}
            className="rounded-full bg-[#151515] text-white px-3 py-1.5 text-[11px] font-bold hover:brightness-110 transition-all shrink-0 cursor-pointer"
          >
            Panggil Lagi
          </button>
        </div>
      );
    }

    // 8. Link Card (matches screenshot: circular link icon + title + url + chevron)
    const inlineUrlMatch = msg.content?.match(URL_REGEX);
    if (msgType === 'link' || inlineUrlMatch) {
      const url = meta?.url || inlineUrlMatch?.[1] || '#';
      let defaultTitle = url;
      try {
        defaultTitle = new URL(url).hostname.replace(/^www\./, '');
      } catch {
        /* ignore */
      }
      const title =
        meta?.title ||
        msg.content?.replace(url, '').replace(/^[—\-\s]+|[—\-\s]+$/g, '') ||
        defaultTitle;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className="w-72 sm:w-85 rounded-2xl p-3 bg-surface-container-low hover:bg-surface-container border border-border-subtle/40 shadow-xs text-text-primary flex items-center gap-3 transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-white border border-border-subtle/30 flex items-center justify-center shrink-0 text-text-primary">
            <LinkIcon className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-text-primary truncate">{title}</div>
            <div className="text-[11px] text-text-secondary truncate">{url}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
        </a>
      );
    }

    // 8. Standard text bubble
    return (
      <div
        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
          isMe
            ? 'bg-[#151515] text-white rounded-br-xs'
            : 'bg-surface-container-low text-text-primary border border-border-subtle/20 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full h-full select-none">
      <div className="bg-white overflow-hidden flex w-full h-full relative">
        {/* Left Sidebar: Conversations & Filters */}
        <div
          className={`${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-88 border-r border-border-subtle/30 flex-col bg-white`}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-text-primary text-lg tracking-tight">Messages</h2>
            <button
              type="button"
              onClick={() => document.getElementById('messages-search-input')?.focus()}
              className="p-1.5 rounded-lg hover:bg-surface-container-low text-text-secondary cursor-pointer"
              title="Pesan baru"
            >
              <SquarePen className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-4 pb-3">
            <div
              className="message-composer-input flex items-center gap-2 rounded-full bg-surface-container-low px-3.5 py-2 border border-border-subtle/20 focus-within:border-primary transition-all"
              style={{ backgroundColor: 'rgb(var(--surface-low))', color: 'rgb(var(--text-main))' }}
            >
              <Search className="w-4 h-4 text-outline shrink-0" />
              <input
                id="messages-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search messages...')}
                className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-outline"
                style={{ backgroundColor: 'transparent', color: 'rgb(var(--text-main))', caretColor: 'rgb(var(--text-main))' }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-outline hover:text-text-primary">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills: All, Direct, Shop, Notifications/Unread */}
          <div className="px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'direct', label: 'Direct' },
              { id: 'shop', label: 'Shop' },
              { id: 'unread', label: 'Notifications' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  activeFilter === tab.id
                    ? 'bg-[#151515] text-white'
                    : 'bg-surface-container-low text-text-secondary hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User Search Results (to start a new conversation) */}
          {searchQuery.trim().length > 0 && userSearchResults.length > 0 && (
            <div className="px-3 pb-2 border-b border-border-subtle/20">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Mulai Chat Baru
              </div>
              {userSearchResults.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => startConversationWithUser(u)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-container-low text-left cursor-pointer"
                >
                  <img
                    src={u.avatar_url || '/favicon.svg'}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-text-primary truncate">{u.name}</div>
                    {u.username && <div className="text-[10px] text-text-secondary truncate">@{u.username}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {filteredConversations.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-text-secondary">
                Belum ada percakapan di tab ini.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const lastMsg = conv.lastMsg;
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setMobileShowChat(true);
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    className={`p-3 rounded-2xl flex gap-3 items-center cursor-pointer transition-all ${
                      isSelected ? 'bg-surface-container-low' : 'hover:bg-surface-container-low/60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full flex-shrink-0 relative">
                      <img
                        src={conv.otherUser?.avatar_url || '/frontend/dist/favicon.svg'}
                        alt={conv.otherUser?.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                      <span role="img" aria-label={presenceLabel(onlineStatus(conv))} title={presenceLabel(onlineStatus(conv))}
                        className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${onlineStatus(conv) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center gap-2 mb-0.5">
                        <span className="font-bold text-text-primary text-xs truncate inline-flex items-center gap-1">
                          {conv.nickname || conv.otherUser?.name}
                          {conv.muted && <BellOff className="w-3 h-3 shrink-0 text-text-secondary" aria-label="Messages muted" />}
                          {conv.otherUser?.is_blue_verified && (
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] leading-none shrink-0">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-text-secondary shrink-0">
                          {lastMsg?.created_at ? timeAgo(lastMsg.created_at) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            conv.unreadCount > 0 ? 'font-bold text-text-primary' : 'text-text-secondary'
                          }`}
                        >
                          {lastMsg ? lastMsg.content : 'Mulai percakapan baru'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#151515] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Conversation Thread */}
        <div
          className={`${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-white min-w-0`}
        >
          {selectedConv ? (
            <>
              {/* Top Chat Header */}
              <div className="px-5 py-3.5 bg-white border-b border-border-subtle/25 flex gap-3 items-center justify-between">
                <div className="flex gap-3 items-center min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-full hover:bg-surface-container-low text-text-primary"
                    aria-label="Kembali"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/profile/${selectedConv.otherUser.username || selectedConv.otherUser.id}`)
                    }
                    className="w-10 h-10 rounded-full flex-shrink-0 relative cursor-pointer"
                  >
                    <img
                      src={selectedConv.otherUser?.avatar_url || '/frontend/dist/favicon.svg'}
                      alt={selectedConv.otherUser?.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span role="img" aria-label={presenceLabel(selectedOnline)} title={presenceLabel(selectedOnline)}
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${selectedOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </button>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/profile/${selectedConv.otherUser.username || selectedConv.otherUser.id}`)
                      }
                      className="font-bold text-text-primary text-sm truncate hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {selectedConv.nickname || selectedConv.otherUser?.name}
                      {selectedConv.otherUser?.is_blue_verified && (
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] leading-none">
                          ✓
                        </span>
                      )}
                    </button>
                    <div className={`text-[11px] font-medium truncate ${selectedOnline ? 'text-emerald-600' : 'text-text-secondary'}`}>
                      {presenceLabel(selectedOnline)}
                      {selectedConv.otherUser?.title ? ` • ${selectedConv.otherUser.title}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-text-secondary">
                  <button
                    type="button"
                    onClick={() => startCall('voice')}
                    disabled={chatBlocked || Boolean(activeCall || incomingCall)}
                    className="p-2 rounded-full hover:bg-surface-container-low text-text-primary cursor-pointer disabled:opacity-40"
                    title="Telepon Suara"
                    aria-label="Telepon Suara"
                  >
                    <Phone className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startCall('video')}
                    disabled={chatBlocked || Boolean(activeCall || incomingCall)}
                    className="p-2 rounded-full hover:bg-surface-container-low text-text-primary cursor-pointer disabled:opacity-40"
                    title="Video Call (VC)"
                    aria-label="Video Call (VC)"
                  >
                    <VideoIcon className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    ref={detailsButtonRef}
                    onClick={() => setDetailsOpen((open) => !open)}
                    className="p-2 rounded-full hover:bg-surface-container-low text-text-primary cursor-pointer"
                    title="Details"
                    aria-label="Chat details"
                    aria-expanded={detailsOpen}
                    aria-controls="chat-details"
                  >
                    <Info className={`w-4.5 h-4.5 ${detailsOpen ? 'text-primary' : ''}`} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {chatBlocked && <p role="status" className="px-5 py-2 text-xs text-red-500">Pesan dan panggilan tidak tersedia karena pengguna diblokir.</p>}
              {/* Pending Shop Product Banner (when redirected from Shop) */}
              {pendingShopPost && (
                <div className="mx-5 mt-3 p-3 rounded-2xl bg-surface-container-low border border-border-subtle/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {pendingShopPost.media?.[0]?.media_url ? (
                      <img
                        src={pendingShopPost.media[0].media_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate">
                        {pendingShopPost.title || 'Produk Shop'}
                      </div>
                      {pendingShopPost.shop?.price_minor && (
                        <div className="text-xs font-extrabold text-primary">
                          {formatPrice(pendingShopPost.shop.price_minor, pendingShopPost.shop.currency || 'IDR')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => sendShopProductCard(pendingShopPost)}
                      disabled={sending}
                      className="rounded-full bg-[#e6192b] hover:brightness-110 px-4 py-1.5 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                    >
                      Kirim Kartu Produk
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingShopPost(null)}
                      className="p-1 rounded-full hover:bg-surface-container text-text-secondary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3.5">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="w-12 h-12 text-outline mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-text-secondary">{t('No messages yet.')}</p>
                    <p className="text-xs text-outline mt-1">
                      Kirim pesan, lokasi, produk shop, atau berbagai file ke {selectedConv.otherUser?.name}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = String(msg.sender_id) === String(currentUser.id);
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${
                          isMe ? 'self-end flex-row-reverse' : 'self-start'
                        } max-w-[88%] sm:max-w-[75%] animate-fadeIn`}
                      >
                        <img
                          src={
                            (isMe
                              ? (currentUser as any).avatar || (currentUser as any).avatar_url
                              : selectedConv.otherUser?.avatar_url) || '/frontend/dist/favicon.svg'
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0 mb-4"
                        />
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {renderMessageContent(msg, isMe)}
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-outline px-1">
                            <span>{formatMsgTime(msg.created_at)}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error / Uploading Status Banner */}
              {error && (
                <div className="bg-error/10 px-5 py-2 text-xs text-error flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {(uploading || locatingGps) && (
                <div className="bg-surface-container-low px-5 py-2 text-xs text-text-secondary flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>{locatingGps ? 'Mengambil titik Lokasi Saya...' : 'Mengunggah & mengirim file...'}</span>
                </div>
              )}

              {/* Bottom Message Composer Bar (matches screenshot: + button, rounded input with emoji, circular send button) */}
              <div className="p-4 bg-white border-t border-border-subtle/20 flex gap-2.5 items-center relative">
                {/* Hidden File Inputs */}
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = '';
                    if (selected.length > 0) {
                      handleFileUpload(selected);
                    }
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = '';
                    if (selected.length > 0) {
                      handleFileUpload(selected);
                    }
                  }}
                />

                {/* + Attachment Menu Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setAttachMenuOpen((v) => !v);
                      setEmojiMenuOpen(false);
                    }}
                    className="w-10 h-10 rounded-full border border-border-subtle/50 hover:bg-surface-container-low flex items-center justify-center text-text-primary cursor-pointer transition-colors"
                    aria-label="Lampirkan file atau lokasi"
                    title="Kirim File, Foto/Video, Lokasi, atau Link"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {attachMenuOpen && (
                    <div className="absolute bottom-full mb-2 left-0 z-50 w-64 rounded-2xl bg-white border border-border-subtle/40 shadow-xl p-2 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => mediaInputRef.current?.click()}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-text-primary text-left cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <div>Foto & Video</div>
                          <div className="text-[10px] font-normal text-text-secondary">JPG, PNG, MP4, MOV, WebM</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-text-primary text-left cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </span>
                        <div>
                          <div>Berbagai File & Dokumen</div>
                          <div className="text-[10px] font-normal text-text-secondary">
                            PDF, DOCX, XLSX, ZIP, Audio, dll.
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={sendCurrentGpsLocation}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-text-primary text-left cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <div>
                          <div>Kirim Lokasi Saya (GPS)</div>
                          <div className="text-[10px] font-normal text-text-secondary">
                            Deteksi koordinat & alamat otomatis
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAttachMenuOpen(false);
                          setLocationModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-text-primary text-left cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <div>
                          <div>Ketik Alamat Lokasi</div>
                          <div className="text-[10px] font-normal text-text-secondary">
                            Tulis nama tempat / alamat manual
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAttachMenuOpen(false);
                          setLinkModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-text-primary text-left cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <LinkIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <div>Bagikan Link Website</div>
                          <div className="text-[10px] font-normal text-text-secondary">
                            Kirim kartu tautan interaktif
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Rounded Input Field + Emoji Trigger */}
                <div
                  className="message-composer-input flex-1 flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-border-subtle/30 focus-within:border-primary transition-all relative"
                  style={{ backgroundColor: 'rgb(var(--surface-low))', color: 'rgb(var(--text-main))' }}
                >
                  <input
                    ref={messageInputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={chatBlocked}
                    readOnly={sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    aria-label={t('Ketik pesan')}
                    className="w-full bg-transparent text-xs sm:text-sm text-text-primary outline-none placeholder:text-outline"
                    style={{ backgroundColor: 'transparent', color: 'rgb(var(--text-main))', caretColor: 'rgb(var(--text-main))' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEmojiMenuOpen((v) => !v);
                      setAttachMenuOpen(false);
                    }}
                    className="ml-2 text-text-secondary hover:text-text-primary cursor-pointer"
                    aria-label="Pilih emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {emojiMenuOpen && (
                    <div className="absolute bottom-full mb-2 right-0 z-50 rounded-2xl bg-white border border-border-subtle/40 shadow-xl p-2.5 grid grid-cols-6 gap-1.5">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setMessageText((prev) => prev + emoji);
                            setEmojiMenuOpen(false);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-surface-container-low text-base flex items-center justify-center cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Circular Send Button */}
                <button
                  type="button"
                  aria-label={t('Kirim pesan')}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={handleSendMessage}
                  disabled={sending || chatBlocked || !messageText.trim()}
                  className="w-10 h-10 bg-[#151515] text-white rounded-full shadow-xs hover:brightness-125 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="w-12 h-12 text-outline mb-2 opacity-50" />
              <p className="text-sm font-semibold text-text-secondary">
                Pilih percakapan untuk mulai mengirim pesan
              </p>
            </div>
          )}
        </div>
        {detailsOpen && selectedConv && <ChatDetails key={selectedConv.otherUser.id} peer={selectedConv.otherUser}
          onClose={() => { setDetailsOpen(false); detailsButtonRef.current?.focus(); }}
          onSettings={(settings) => {
            if (selectedConvIdRef.current === selectedConv.id) setChatBlocked(settings.blocked_between);
            setConversations((items) => items.map((conv) => conv.id === selectedConv.id ? { ...conv, muted: settings.muted, nickname: settings.nickname } : conv));
          }}
          onDelete={() => {
            const removedId = selectedConv.id;
            setConversations((items) => items.filter((conv) => conv.id !== removedId));
            if (selectedConvIdRef.current === removedId) {
              selectedConvIdRef.current = null;
              setSelectedConvId(null); setMessages([]); setDetailsOpen(false); setMobileShowChat(false);
              setIntentTargetUser(null); setPendingShopPost(null);
            }
          }}
        />}
      </div>

      {/* Modal: Manual Location Input */}
      {locationModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setLocationModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e6192b]" />
                Kirim Lokasi
              </h3>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container-low"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-secondary">
                Judul Lokasi
                <input
                  type="text"
                  value={manualLocationLabel}
                  onChange={(e) => setManualLocationLabel(e.target.value)}
                  placeholder="Lokasi Saya"
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
                  style={{ backgroundColor: 'rgb(var(--surface-low))', color: 'rgb(var(--text-main))' }}
                />
              </label>
              <label className="block text-xs font-semibold text-text-secondary">
                Alamat Lengkap / Nama Tempat *
                <input
                  type="text"
                  value={manualLocationAddress}
                  onChange={(e) => setManualLocationAddress(e.target.value)}
                  placeholder="Contoh: Jl. Sudirman No.123, Jakarta"
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
                  style={{ backgroundColor: 'rgb(var(--surface-low))', color: 'rgb(var(--text-main))' }}
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={sendCurrentGpsLocation}
                  className="rounded-full border border-border-subtle px-4 py-2 text-xs font-bold text-text-primary hover:bg-surface-container-low cursor-pointer"
                >
                  Gunakan GPS Saat Ini
                </button>
                <button
                  type="button"
                  onClick={sendManualLocation}
                  disabled={!manualLocationAddress.trim() || sending}
                  className="rounded-full bg-[#151515] px-4 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  Kirim Lokasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Share Link Input */}
      {linkModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setLinkModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" />
                Bagikan Tautan
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container-low"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-secondary">
                Judul Tautan (opsional)
                <input
                  type="text"
                  value={linkInputTitle}
                  onChange={(e) => setLinkInputTitle(e.target.value)}
                  placeholder="Contoh: Teknologi AI untuk Masa Depan"
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
                  style={{ backgroundColor: 'rgb(var(--surface-low))', color: 'rgb(var(--text-main))' }}
                />
              </label>
              <label className="block text-xs font-semibold text-text-secondary">
                URL Website *
                <input
                  type="url"
                  value={linkInputUrl}
                  onChange={(e) => setLinkInputUrl(e.target.value)}
                  placeholder="https://postter.us/ai-future"
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-container-low px-3 py-2 text-xs text-text-primary outline-none focus:border-primary"
                  style={{ backgroundColor: 'rgb(var(--surface-low))', color: 'rgb(var(--text-main))' }}
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={sendLinkAttachment}
                  disabled={!linkInputUrl.trim() || sending}
                  className="rounded-full bg-[#151515] px-4 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  Kirim Tautan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Incoming Voice / Video Call */}
      {incomingCall && !activeCall && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151922] text-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-white/10 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <span className="absolute -inset-2 rounded-full bg-emerald-500/25 animate-ping" />
              <img
                src={incomingCall.fromUser?.avatar_url || '/favicon.svg'}
                alt={incomingCall.fromUser?.name}
                className="relative w-20 h-20 rounded-full object-cover border-2 border-emerald-400"
              />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              {incomingCall.mode === 'video' ? (
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
              {incomingCall.fromUser?.name || 'Pengguna'}
            </h3>
            {incomingCall.fromUser?.username && (
              <p className="text-xs text-slate-400 mt-0.5">@{incomingCall.fromUser.username}</p>
            )}

            <div className="flex items-center justify-center gap-6 mt-7 w-full">
              <button
                type="button"
                onClick={rejectIncomingCall}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className="w-14 h-14 rounded-full bg-rose-600 group-hover:bg-rose-500 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
                  <PhoneOff className="w-6 h-6" />
                </span>
                <span className="text-[11px] font-semibold text-slate-300">Tolak</span>
              </button>

              <button
                type="button"
                onClick={acceptIncomingCall}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className="w-14 h-14 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95">
                  {incomingCall.mode === 'video' ? (
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

      {/* Modal: Active Voice / Video Call Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-[120] bg-[#0d1117]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white">
          {/* Hidden audio element ensures voice stream plays on all browsers */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
          {audioPlaybackBlocked && (
            <button type="button" onClick={() => void playRemoteAudio()} className="absolute top-24 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
              Aktifkan suara
            </button>
          )}

          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 z-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeCall.peerUser?.name || 'Pengguna'}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-semibold">
                    {activeCall.mode === 'video' ? 'Video Call' : 'Panggilan Suara'}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  {activeCall.status === 'ringing'
                    ? 'Berdering • Online (Menunggu jawaban)'
                    : activeCall.status === 'calling'
                      ? 'Memanggil... (Menghubungi perangkat)'
                      : activeCall.status === 'connecting'
                        ? 'Menghubungkan suara/video...'
                        : formatCallDuration(callDuration)}
                </div>
              </div>
            </div>
          </div>

          {/* Center Stage: Video Streams or Voice Avatar */}
          <div className="relative flex-1 my-4 rounded-3xl overflow-hidden bg-[#161c26] border border-white/10 flex items-center justify-center">
            {activeCall.mode === 'video' ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {activeCall.status !== 'connected' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
                    <img
                      src={activeCall.peerUser?.avatar_url || '/favicon.svg'}
                      alt={activeCall.peerUser?.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-white/30 mb-3"
                    />
                    <div className="text-base font-bold">{activeCall.peerUser?.name}</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-1">
                      {activeCall.status === 'ringing'
                        ? 'Berdering • Online...'
                        : activeCall.status === 'calling'
                          ? 'Memanggil...'
                          : 'Menyiapkan video...'}
                    </div>
                  </div>
                )}
                {/* Picture-in-Picture Local Camera Preview */}
                <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden bg-black border-2 border-white/20 shadow-xl">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isCamOff ? 'hidden' : ''}`}
                  />
                  {isCamOff && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-slate-400 gap-1">
                      <VideoOff className="w-5 h-5" />
                      <span>Kamera Mati</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="relative mb-5">
                  <span className="absolute -inset-4 rounded-full bg-sky-500/20 animate-ping" />
                  <img
                    src={activeCall.peerUser?.avatar_url || '/favicon.svg'}
                    alt={activeCall.peerUser?.name}
                    className="relative w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                  />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  {activeCall.peerUser?.name || 'Pengguna'}
                </h3>
                <p className="text-sm text-emerald-400 font-semibold mt-1">
                  {activeCall.status === 'ringing'
                    ? 'Berdering • Online...'
                    : activeCall.status === 'calling'
                      ? 'Memanggil...'
                      : activeCall.status === 'connecting'
                        ? 'Menghubungkan...'
                        : formatCallDuration(callDuration)}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Call Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pb-2 z-10">
            <button
              type="button"
              onClick={toggleMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMicMuted ? 'bg-rose-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title={isMicMuted ? 'Nyalakan Mikrofon' : 'Bisukan Mikrofon'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {activeCall.mode === 'video' && (
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isCamOff ? 'bg-rose-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
                title={isCamOff ? 'Nyalakan Kamera' : 'Matikan Kamera'}
              >
                {isCamOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </button>
            )}

            <button
              type="button"
              onClick={toggleSpeaker}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isSpeakerMuted
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title={isSpeakerMuted ? 'Nyalakan Suara Speaker' : 'Bisukan Speaker'}
            >
              {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={endActiveCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer"
              title="Akhiri Panggilan"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
