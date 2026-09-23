import { useEffect, useState } from 'react';
import { socialApi } from '../api/socialApi';

// Shared by Header.tsx and AdminDashboardPage.jsx, which previously each kept
// their own copy of this fetch/dropdown/mark-read logic and had already begun
// to drift (e.g. one lacked a 99+ unread cap the other had).
export function useNotifications(onOpenActor) {
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
    if (notification.actor?.id && onOpenActor) onOpenActor(String(notification.actor.id));
  };

  return {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsLoading,
    unreadCount,
    loadNotifications,
    openNotification,
  };
}
