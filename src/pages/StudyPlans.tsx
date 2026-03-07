/**
 * Study Plans list page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { StudyPlan } from '../types';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const StudyPlans: React.FC = () => {
  const { user } = useAuth();
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyPlans();
  }, []);

  const fetchStudyPlans = async () => {
    try {
      const response = await api.get('/study-plans', { params: { limit: 100 } });
      setStudyPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch study plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this study plan?')) return;

    try {
      await api.delete(`/study-plans/${id}`);
      fetchStudyPlans();
    } catch (error) {
      console.error('Failed to delete study plan:', error);
      alert('Failed to delete study plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading study plans...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Study Plans</h1>
            <p className="text-sm md:text-base text-gray-600">Create and manage your study plans</p>
          </div>
          <Link to="/study-plans/new" className="btn-primary w-full sm:w-auto text-center">
            ➕ New Study Plan
          </Link>
        </div>

        {/* Study Plans List */}
        {studyPlans.length === 0 ? (
          <div className="card">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No study plans found</h3>
              <p className="text-gray-600 mb-6">Create your first study plan to get started!</p>
              <Link to="/study-plans/new" className="btn-primary inline-block">
                Create Your First Study Plan
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {studyPlans.map((plan) => (
              <div key={plan.id} className="card-glass card-hover group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1 group-hover:text-indigo-600 transition-colors">
                      {plan.title}
                    </h3>
                    <div className="flex space-x-2 ml-2">
                      <Link
                        to={`/study-plans/${plan.id}/edit`}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                  )}
                  
                  {plan.plan_content && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{plan.plan_content}</p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">📅</span>
                    <span>{format(new Date(plan.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




