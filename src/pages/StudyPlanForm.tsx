/**
 * Study Plan create/edit form page.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Navigation } from '../components/Navigation';

export const StudyPlanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [planContent, setPlanContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchStudyPlan();
    }
  }, [id]);

  const fetchStudyPlan = async () => {
    try {
      const response = await api.get(`/study-plans/${id}`);
      const plan = response.data;
      setTitle(plan.title);
      setDescription(plan.description || '');
      setPlanContent(plan.plan_content || '');
    } catch (error) {
      console.error('Failed to fetch study plan:', error);
      setError('Failed to load study plan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const planData: any = {
        title,
        description: description || null,
        plan_content: planContent || null,
      };

      if (isEdit) {
        await api.put(`/study-plans/${id}`, planData);
      } else {
        await api.post('/study-plans', planData);
      }

      navigate('/study-plans');
    } catch (err: any) {
      console.error('Error saving study plan:', err);
      setError(err.response?.data?.detail || 'Failed to save study plan');
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
                  {isEdit ? '✏️ Edit Study Plan' : '➕ Create New Study Plan'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update your study plan' : 'Create a new study plan'}
                </p>
              </div>
              <Link 
                to="/study-plans" 
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter study plan title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Content
                </label>
                <textarea
                  value={planContent}
                  onChange={(e) => setPlanContent(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Enter your study plan content (optional)"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  to="/study-plans"
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
                    'Update Study Plan'
                  ) : (
                    'Create Study Plan'
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




