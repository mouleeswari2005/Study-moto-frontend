/**
 * Profile page showing user information and statistics.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Streak, TaskStatus } from '../types';
import { Navigation } from '../components/Navigation';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Refresh data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchProfileData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchProfileData();
      }
    };

    // Listen for custom task update events
    const handleTaskUpdate = () => {
      if (user) {
        fetchProfileData();
      }
    };

    // Periodic refresh when page is visible (every 10 seconds)
    const refreshInterval = setInterval(() => {
      if (!document.hidden && user) {
        fetchProfileData();
      }
    }, 10000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      clearInterval(refreshInterval);
    };
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch streak data and task stats in parallel
      const [streakResponse, statsResponse] = await Promise.all([
        api.get('/streaks').catch(() => null),
        api.get('/tasks/stats').catch(() => null)
      ]);
      
      if (streakResponse) {
        setStreak(streakResponse.data);
      }

      if (statsResponse) {
        setCompletedTasks(statsResponse.data.completed || 0);
        setPendingTasks(statsResponse.data.pending || 0);
      } else {
        // Fallback to old method if stats endpoint fails
        const completedResponse = await api.get('/tasks', {
          params: { status: TaskStatus.COMPLETED, limit: 500 }
        });
        setCompletedTasks(completedResponse.data.length || 0);

        const [todoResponse, inProgressResponse] = await Promise.all([
          api.get('/tasks', { params: { status: TaskStatus.TODO, limit: 500 } }),
          api.get('/tasks', { params: { status: TaskStatus.IN_PROGRESS, limit: 500 } })
        ]);
        const pendingCount = (todoResponse.data?.length || 0) + (inProgressResponse.data?.length || 0);
        setPendingTasks(pendingCount);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitial = () => {
    if (!user?.full_name) return 'U';
    return user.full_name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      
      <div className="page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="card-glass">
          <div className="p-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8 relative w-full">
              {/* Refresh Button */}
              <button
                onClick={fetchProfileData}
                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Avatar with first letter */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                {getInitial()}
              </div>
              
              {/* Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.full_name || 'User'}
              </h1>
              
              {/* Email */}
              <p className="text-gray-600 text-lg">
                {user?.email || ''}
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Tasks Completed */}
              <div className="card-glass p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {completedTasks}
                </div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>

              {/* Pending Tasks */}
              <div className="card-glass p-6 text-center">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {pendingTasks}
                </div>
                <div className="text-sm text-gray-600">Pending Tasks</div>
              </div>

              {/* Streaks */}
              <div className="card-glass p-6 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {streak?.current_streak || 0}
                </div>
                <div className="text-sm text-gray-600">Your Streaks</div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="btn-secondary px-8 py-3 text-base font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

