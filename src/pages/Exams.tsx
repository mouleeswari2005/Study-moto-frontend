/**
 * Exams list page.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Exam, TaskPriority } from '../types';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const Exams: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams', { params: { limit: 100 } });
      setExams(response.data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      alert('Failed to delete exam');
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isUpcoming = (examDate: string) => {
    return new Date(examDate) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading exams...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Exams</h1>
            <p className="text-sm md:text-base text-gray-600">Track and manage your upcoming exams</p>
          </div>
          <Link to="/exams/new" className="btn-primary w-full sm:w-auto text-center">
            ➕ New Exam
          </Link>
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="card">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 mb-6">Schedule your first exam to get started!</p>
              <Link to="/exams/new" className="btn-primary inline-block">
                Schedule Your First Exam
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className={`card-glass card-hover ${
                  !isUpcoming(exam.exam_date) ? 'opacity-75' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{exam.title}</h3>
                    <div className="flex space-x-2 ml-2">
                      <Link
                        to={`/exams/${exam.id}/edit`}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`badge border ${getPriorityColor(exam.priority)}`}>
                      {exam.priority}
                    </span>
                    {!isUpcoming(exam.exam_date) && (
                      <span className="badge border bg-gray-200 text-gray-700 border-gray-300">
                        Past
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span className="font-medium">
                        {format(new Date(exam.exam_date), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {exam.location && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        <span>{exam.location}</span>
                      </div>
                    )}
                    {exam.duration_minutes && (
                      <div className="flex items-center">
                        <span className="mr-2">⏱️</span>
                        <span>{exam.duration_minutes} minutes</span>
                      </div>
                    )}
                  </div>
                  
                  {exam.syllabus_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Notes:</div>
                      <div className="text-sm text-gray-600">{exam.syllabus_notes}</div>
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

