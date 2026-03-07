/**
 * Settings page.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import api from '../services/api';
import { Navigation } from '../components/Navigation';
import { pushNotificationService } from '../services/pushNotificationService';
import { DeviceSubscription } from '../types';

interface Preferences {
  theme_color?: string;
  banner_image_url?: string;
  default_calendar_view: string;
  time_format: string;
  timezone: string;
  week_start_day: number;
  email_notifications_enabled: string;
  push_notifications_enabled: string;
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { preferences: contextPreferences, refreshPreferences } = usePreferences();
  const [preferences, setPreferences] = useState<Preferences>({
    default_calendar_view: 'week',
    time_format: '12h',
    timezone: 'Asia/Kolkata',
    week_start_day: 0,
    email_notifications_enabled: 'true',
    push_notifications_enabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushSubscriptions, setPushSubscriptions] = useState<DeviceSubscription[]>([]);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (contextPreferences) {
      setPreferences(contextPreferences);
      setLoading(false);
    }
  }, [contextPreferences]);

  useEffect(() => {
    checkPushSubscription();
    fetchPushSubscriptions();
  }, []);

  const checkPushSubscription = async () => {
    if (pushNotificationService.isSupported()) {
      const subscribed = await pushNotificationService.isSubscribed();
      setPushSubscribed(subscribed);
    }
  };

  const fetchPushSubscriptions = async () => {
    try {
      const response = await api.get('/push-subscriptions');
      setPushSubscriptions(response.data);
    } catch (error) {
      console.error('Failed to fetch push subscriptions:', error);
    }
  };

  const handleSubscribePush = async () => {
    if (!pushNotificationService.isSupported()) {
      alert('Push notifications are not supported in this browser');
      return;
    }

    setPushLoading(true);
    try {
      await pushNotificationService.subscribe();
      setPushSubscribed(true);
      await fetchPushSubscriptions();
      setMessage('Push notifications enabled successfully!');
    } catch (error: any) {
      console.error('Failed to subscribe to push notifications:', error);
      alert(error.message || 'Failed to enable push notifications');
    } finally {
      setPushLoading(false);
    }
  };

  const handleUnsubscribePush = async (subscriptionId?: number) => {
    if (!confirm('Disable push notifications for this device?')) return;

    setPushLoading(true);
    try {
      if (subscriptionId) {
        await api.delete(`/push-subscriptions/${subscriptionId}`);
      } else {
        await pushNotificationService.unsubscribe();
      }
      setPushSubscribed(false);
      await fetchPushSubscriptions();
      setMessage('Push notifications disabled successfully!');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      alert('Failed to disable push notifications');
    } finally {
      setPushLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/preferences', preferences);
      setMessage('Preferences saved successfully!');
      // Refresh preferences to apply changes
      await refreshPreferences();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <div className="page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes('success')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Appearance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Color
                </label>
                <input
                  type="color"
                  value={preferences.theme_color || '#6366f1'}
                  onChange={(e) => handleChange('theme_color', e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={preferences.banner_image_url || ''}
                  onChange={(e) => handleChange('banner_image_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Calendar Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Calendar View
                </label>
                <select
                  value={preferences.default_calendar_view}
                  onChange={(e) => handleChange('default_calendar_view', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Format
                </label>
                <select
                  value={preferences.time_format}
                  onChange={(e) => handleChange('time_format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week Starts On
                </label>
                <select
                  value={preferences.week_start_day}
                  onChange={(e) => handleChange('week_start_day', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">Monday</option>
                  <option value="1">Tuesday</option>
                  <option value="2">Wednesday</option>
                  <option value="3">Thursday</option>
                  <option value="4">Friday</option>
                  <option value="5">Saturday</option>
                  <option value="6">Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Notifications
                </label>
                <select
                  value={preferences.email_notifications_enabled}
                  onChange={(e) => handleChange('email_notifications_enabled', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                  <option value="digest">Digest (daily summary)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Push Notifications
                </label>
                <select
                  value={preferences.push_notifications_enabled}
                  onChange={(e) => handleChange('push_notifications_enabled', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browser Push Subscription
                </label>
                {pushNotificationService.isSupported() ? (
                  <div className="space-y-2">
                    {pushSubscribed ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">✓ Subscribed</span>
                        <button
                          onClick={() => handleUnsubscribePush()}
                          disabled={pushLoading}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          {pushLoading ? 'Disabling...' : 'Disable'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubscribePush}
                        disabled={pushLoading}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {pushLoading ? 'Enabling...' : 'Enable Push Notifications'}
                      </button>
                    )}
                    {pushSubscriptions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Registered Devices:</p>
                        <ul className="space-y-2">
                          {pushSubscriptions.map((sub) => (
                            <li key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-600">
                                {sub.user_agent || 'Unknown Device'}
                              </span>
                              <button
                                onClick={() => handleUnsubscribePush(sub.id)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Push notifications are not supported in this browser.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {user?.full_name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Role:</span> {user?.role}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Premium:</span>{' '}
                {user?.is_premium ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

