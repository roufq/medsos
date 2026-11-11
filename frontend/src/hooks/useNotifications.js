import { useEffect, useState } from 'react';
import { socialApi } from '../api/socialApi';
import { messageApi } from '../api/messageApi';
import { useNavigate } from 'react-router-dom';

// Shared by Header.tsx and AdminDashboardPage.jsx, which previously each kept
// their own copy of this fetch/dropdown/mark-read logic and had already begun
// to drift (e.g. one lacked a 99+ unread cap the other had).
// onOpen receives the whole notification so callers can route to the post
// (entity_type "post") or fall back to the actor's profile.
export function useNotifications(onOpen) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const data = await socialApi.notifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') loadNotifications();
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      try {
        await socialApi.readNotification(notification.id);
        setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item)));
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    }
    setNotificationsOpen(false);
    if (notification.entity_type === 'conversation' && notification.actor_id) {
      try {
        const intent = await messageApi.createIntent({ user_id: notification.actor_id });
        navigate(`/messages?t=${encodeURIComponent(intent.token)}`);
      } catch (error) {
        console.error('Failed to open conversation', error);
      }
      return;
    }
    if (onOpen) onOpen(notification);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await socialApi.readNotification('all');
      const now = new Date().toISOString();
      setNotifications((items) => items.map((item) => (item.read_at ? item : { ...item, read_at: now })));
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  return {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsLoading,
    unreadCount,
    loadNotifications,
    openNotification,
    markAllAsRead,
  };
}
