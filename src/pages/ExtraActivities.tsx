/**
 * Extra Activities list page.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ExtraActivity } from '../types';
import { Navigation } from '../components/Navigation';

export const ExtraActivities: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ExtraActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ExtraActivity | null>(null);
  
  // Form state
  const [categories, setCategories] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [winningPrizes, setWinningPrizes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/extra-activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await api.delete(`/extra-activities/${id}`);
      fetchActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert('Failed to delete activity');
    }
  };

  const handleEdit = (activity: ExtraActivity) => {
    setEditingActivity(activity);
    setCategories(activity.categories);
    setEventTitle(activity.event_title);
    setWinningPrizes(activity.winning_prizes || '');
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingActivity(null);
    setCategories('');
    setEventTitle('');
    setWinningPrizes('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const activityData: any = {
        categories,
        event_title: eventTitle,
        winning_prizes: winningPrizes || undefined,
      };

      if (editingActivity) {
        await api.put(`/extra-activities/${editingActivity.id}`, activityData);
      } else {
        await api.post('/extra-activities', activityData);
      }

      handleCancel();
      fetchActivities();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save activity');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Extra Activities</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your extra activities</p>
          </div>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
            className="btn-primary w-full sm:w-auto text-center"
          >
            ➕ New Activity
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="card-glass mb-6 animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingActivity ? 'Edit Activity' : 'Create New Activity'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categories <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Sports, Arts, Competition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="input-field"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Winning Prizes
                  </label>
                  <input
                    type="text"
                    value={winningPrizes}
                    onChange={(e) => setWinningPrizes(e.target.value)}
                    className="input-field"
                    placeholder="Enter winning prizes (if any)"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {formLoading ? 'Saving...' : editingActivity ? 'Update Activity' : 'Create Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Activities List */}
        {activities.length === 0 && !showForm ? (
          <div className="card-glass">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600 mb-6">Create your first activity to get started!</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-block"
              >
                Create Your First Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="card-glass card-hover group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {activity.event_title}
                      </h3>
                      <p className="text-sm text-gray-600">{activity.categories}</p>
                    </div>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {activity.winning_prizes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Winning Prizes:</span> {activity.winning_prizes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




