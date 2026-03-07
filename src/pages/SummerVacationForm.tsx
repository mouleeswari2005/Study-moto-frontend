/**
 * Summer Vacation create/edit form page.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Navigation } from '../components/Navigation';

export const SummerVacationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vacationPlan, setVacationPlan] = useState('');
  const [tripPlan, setTripPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchSummerVacation();
    }
  }, [id]);

  const fetchSummerVacation = async () => {
    try {
      const response = await api.get(`/summer-vacations/${id}`);
      const vacation = response.data;
      setDate(vacation.date || '');
      setTime(vacation.time || '');
      setVacationPlan(vacation.vacation_plan || '');
      setTripPlan(vacation.trip_plan || '');
    } catch (error) {
      console.error('Failed to fetch summer vacation:', error);
      setError('Failed to load summer vacation');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const vacationData: any = {
        date,
        time,
        vacation_plan: vacationPlan || null,
        trip_plan: tripPlan || null,
      };

      if (isEdit) {
        await api.put(`/summer-vacations/${id}`, vacationData);
      } else {
        await api.post('/summer-vacations', vacationData);
      }

      navigate('/summer-vacations');
    } catch (err: any) {
      console.error('Error saving summer vacation:', err);
      setError(err.response?.data?.detail || 'Failed to save summer vacation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <div className="page-container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEdit ? '✏️ Edit Summer Vacation' : '➕ Create New Summer Vacation'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update your summer vacation plan' : 'Plan your summer vacation'}
                </p>
              </div>
              <Link 
                to="/summer-vacations" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                    placeholder="Enter date (e.g., 2024-07-15)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input-field"
                    placeholder="Enter time (e.g., 10:00 AM)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vacation Plan
                </label>
                <textarea
                  value={vacationPlan}
                  onChange={(e) => setVacationPlan(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Enter your vacation plan (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trip Plan
                </label>
                <textarea
                  value={tripPlan}
                  onChange={(e) => setTripPlan(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Enter your trip plan (optional)"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  to="/summer-vacations"
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="mr-2">⏳</span> Saving...
                    </span>
                  ) : isEdit ? (
                    'Update Summer Vacation'
                  ) : (
                    'Create Summer Vacation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};




