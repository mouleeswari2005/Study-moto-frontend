/**
 * Notifications page.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    deleteAllRead,
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'read') return notification.is_read;
    if (filter === 'unread') return !notification.is_read;
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleMarkAllRead = async () => {
    if (!confirm('Mark all notifications as read?')) return;
    try {
      await markAllAsRead();
    } catch (error) {
      alert('Failed to mark all as read');
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Delete all read notifications? This action cannot be undone.')) return;
    try {
      await deleteAllRead();
    } catch (error) {
      alert('Failed to delete all read notifications');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Mark All Read
              </button>
            )}
            {notifications.some((n) => n.is_read) && (
              <button
                onClick={handleDeleteAllRead}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete All Read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-md ${
                filter === 'read'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Read ({notifications.filter((n) => n.is_read).length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                        {notification.notification_type && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {notification.notification_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-semibold text-gray-900 mb-1 ${
                        !notification.is_read ? 'font-bold' : ''
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="text-xs text-gray-500">
                        {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      {notification.is_read ? (
                        <button
                          onClick={() => markAsUnread(notification.id)}
                          className="text-indigo-600 hover:text-indigo-500 text-sm"
                          title="Mark as unread"
                        >
                          Mark Unread
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-green-600 hover:text-green-500 text-sm"
                          title="Mark as read"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Delete this notification?')) {
                            deleteNotification(notification.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-500 text-sm"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};




