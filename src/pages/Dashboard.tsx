/**
 * Dashboard page.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import api from '../services/api';
import { DashboardData, Streak } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, streakResponse] = await Promise.all([
        api.get('/dashboard'),
        api.get('/streaks').catch(() => null) // Don't fail if streak endpoint fails
      ]);
      setDashboardData(dashboardResponse.data);
      if (streakResponse) {
        setStreak(streakResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Current Streak',
      value: streak?.current_streak || 0,
      icon: '🔥',
      color: 'from-orange-500 to-red-600',
      link: '/streaks',
      subtitle: streak?.is_active ? 'Active today!' : 'Keep going!',
    },
    {
      label: 'Upcoming Tasks',
      value: dashboardData?.upcoming_tasks?.length || 0,
      icon: '✅',
      color: 'from-blue-500 to-blue-600',
      link: '/tasks',
    },
    {
      label: 'Upcoming Exams',
      value: dashboardData?.upcoming_exams?.length || 0,
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
      link: '/exams',
    },
    {
      label: 'Classes',
      value: dashboardData?.upcoming_classes?.length || 0,
      icon: '📚',
      color: 'from-green-500 to-green-600',
      link: '/classes',
    },
    {
      label: 'Overdue Tasks',
      value: dashboardData?.overdue_tasks?.length || 0,
      icon: '⚠️',
      color: 'from-red-500 to-red-600',
      link: '/tasks',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      {preferences?.banner_image_url && (
        <div 
          className="w-full h-48 bg-cover bg-center mb-8 -mt-20 pt-20"
          style={{ backgroundImage: `url(${preferences.banner_image_url})` }}
        />
      )}

      {/* Main Content */}
      <main className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-sm md:text-base text-gray-600">Here's what's happening with your studies today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="card-glass card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-md`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                {stat.subtitle && (
                  <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* Upcoming Classes */}
          <div className="card-glass card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📚</span> Upcoming Classes
                </h3>
              </div>
              {dashboardData?.upcoming_classes && dashboardData.upcoming_classes.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.upcoming_classes.map((cls) => (
                    <li key={cls.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: cls.color || '#6366f1' }}></div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{cls.name}</div>
                        {cls.code && <div className="text-xs text-gray-500">{cls.code}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 py-4">No upcoming classes</p>
              )}
              <Link
                to="/classes"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all classes →
              </Link>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card-glass card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="mr-2">✅</span> Upcoming Tasks
                </h3>
              </div>
              {dashboardData?.upcoming_tasks && dashboardData.upcoming_tasks.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.upcoming_tasks.map((task) => (
                    <li key={task.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-1">{task.title}</div>
                          {task.due_date && (
                            <div className="text-xs text-gray-500">
                              📅 {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 py-4">No upcoming tasks</p>
              )}
              <Link
                to="/tasks"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all tasks →
              </Link>
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="card-glass card-hover">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📝</span> Upcoming Exams
                </h3>
              </div>
              {dashboardData?.upcoming_exams && dashboardData.upcoming_exams.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.upcoming_exams.map((exam) => (
                    <li key={exam.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-1">{exam.title}</div>
                          <div className="text-xs text-gray-500">
                            📅 {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 py-4">No upcoming exams</p>
              )}
              <Link
                to="/exams"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all exams →
              </Link>
            </div>
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        {dashboardData?.overdue_tasks && dashboardData.overdue_tasks.length > 0 && (
          <div className="card-glass border-2 border-red-200/50 bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-md mb-8">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">⚠️</span>
                <h3 className="text-lg font-bold text-red-900">Overdue Tasks</h3>
              </div>
              <ul className="space-y-2">
                {dashboardData.overdue_tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <span className="text-sm font-semibold text-red-900">{task.title}</span>
                      {task.due_date && (
                        <span className="ml-2 text-xs text-red-700">
                          (Due: {format(new Date(task.due_date), 'MMM d, yyyy')})
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/tasks/${task.id}/edit`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Update →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card-glass">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Link
                to="/tasks/new"
                className="btn-primary text-center"
              >
                ➕ Add Task
              </Link>
              <Link
                to="/exams/new"
                className="btn-primary text-center"
              >
                📝 Add Exam
              </Link>
              <Link
                to="/classes/new"
                className="btn-primary text-center"
              >
                📚 Add Class
              </Link>
              <Link
                to="/pomodoro"
                className="btn-primary text-center"
              >
                ⏱️ Start Focus
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

