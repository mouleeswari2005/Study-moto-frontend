/**
 * Reminders page.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

interface Reminder {
  id: number;
  user_id: number;
  task_id?: number;
  exam_id?: number;
  event_id?: number;
  reminder_type: string;
  reminder_time: string;
  message?: string;
  is_sent: boolean;
  channels: string;
  created_at: string;
  sent_at?: string;
}

export const Reminders: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSent, setFilterSent] = useState<boolean | null>(null);

  useEffect(() => {
    fetchReminders();
  }, [filterSent]);

  const fetchReminders = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterSent !== null) {
        params.is_sent = filterSent;
      }
      const response = await api.get('/reminders', { params });
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSent = async (id: number) => {
    try {
      await api.put(`/reminders/${id}/mark-sent`);
      fetchReminders();
    } catch (error) {
      console.error('Failed to mark reminder as sent:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await api.delete(`/reminders/${id}`);
      fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleCheckOverdue = async () => {
    try {
      await api.post('/reminders/check-overdue');
      fetchReminders();
    } catch (error) {
      console.error('Failed to check overdue:', error);
    }
  };

  const handleCheckNearDue = async () => {
    try {
      await api.post('/reminders/check-near-due');
      fetchReminders();
    } catch (error) {
      console.error('Failed to check near due:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleCheckOverdue}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Check Overdue
            </button>
            <button
              onClick={handleCheckNearDue}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Check Near Due
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterSent(null)}
              className={`px-4 py-2 rounded-md ${
                filterSent === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSent(false)}
              className={`px-4 py-2 rounded-md ${
                filterSent === false
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterSent(true)}
              className={`px-4 py-2 rounded-md ${
                filterSent === true
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sent
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reminders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reminders found.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className={`p-6 hover:bg-gray-50 ${
                    reminder.is_sent ? 'bg-gray-50 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {reminder.reminder_type}
                        </span>
                        {reminder.is_sent && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Sent
                          </span>
                        )}
                      </div>
                      {reminder.message && (
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {reminder.message}
                        </p>
                      )}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Time:</span>{' '}
                        {format(new Date(reminder.reminder_time), 'MMM d, yyyy h:mm a')}
                      </div>
                      {reminder.sent_at && (
                        <div className="text-sm text-gray-500 mt-1">
                          Sent: {format(new Date(reminder.sent_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Channels: {reminder.channels}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!reminder.is_sent && (
                        <button
                          onClick={() => handleMarkSent(reminder.id)}
                          className="text-green-600 hover:text-green-500"
                        >
                          Mark Sent
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="text-red-600 hover:text-red-500"
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

