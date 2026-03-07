/**
 * Notification context for managing in-app notifications.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const [notificationsResponse, countResponse] = await Promise.all([
        api.get('/notifications', { params: { limit: 100 } }),
        api.get('/notifications/unread-count'),
      ]);

      setNotifications(notificationsResponse.data);
      setUnreadCount(countResponse.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.put(`/notifications/${id}/mark-read`);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, [fetchNotifications]);

  const markAsUnread = useCallback(async (id: number) => {
    try {
      await api.put(`/notifications/${id}/mark-unread`);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      throw error;
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, [fetchNotifications]);

  const deleteAllRead = useCallback(async () => {
    try {
      await api.delete('/notifications');
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to delete all read notifications:', error);
      throw error;
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAsUnread,
        deleteNotification,
        markAllAsRead,
        deleteAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

