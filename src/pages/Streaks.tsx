/**
 * Streaks page showing current streak and history.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import api from '../services/api';
import { Streak, StreakHistoryList } from '../types';
import { format, parseISO, startOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const Streaks: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [history, setHistory] = useState<StreakHistoryList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const [streakResponse, historyResponse] = await Promise.all([
        api.get('/streaks'),
        api.get('/streaks/history', { params: { limit: 100 } })
      ]);
      setStreak(streakResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your streaks...</p>
        </div>
      </div>
    );
  }

  // Generate calendar view for the last 30 days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 29); // Last 30 days including today
  const days = eachDayOfInterval({ start: startDate, end: today });

  // Create a map of dates to history entries
  const historyMap = new Map<string, { completed: boolean; streak_count: number }>();
  if (history) {
    history.history.forEach((entry) => {
      historyMap.set(entry.date, {
        completed: entry.completed,
        streak_count: entry.streak_count
      });
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      {preferences?.banner_image_url && (
        <div 
          className="w-full h-48 bg-cover bg-center mb-8 -mt-20 pt-20"
          style={{ backgroundImage: `url(${preferences.banner_image_url})` }}
        />
      )}

      <main className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Your Streaks
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Keep your momentum going by completing at least one task every day!
          </p>
        </div>

        {/* Current Streak Card */}
        <div className="card-glass mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                <div className="text-sm font-medium text-gray-600 mb-2">Current Streak</div>
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <span className="text-5xl md:text-6xl font-bold text-indigo-600">
                    {streak?.current_streak || 0}
                  </span>
                  <span className="text-3xl md:text-4xl">🔥</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {streak?.is_active 
                    ? 'Great job! You completed a task today!'
                    : streak?.last_completion_date
                    ? `Last completed: ${format(parseISO(streak.last_completion_date), 'MMM d, yyyy')}`
                    : 'Complete your first task to start a streak!'}
                </div>
              </div>
              {history && history.best_streak > 0 && (
                <div className="text-center md:text-right">
                  <div className="text-sm font-medium text-gray-600 mb-2">Best Streak</div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600">
                    {history.best_streak}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">days</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Streak History Calendar */}
        <div className="card-glass">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Last 30 Days</h3>
            <div className="grid grid-cols-7 gap-2">
              {/* Day labels */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {days.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const entry = historyMap.get(dateStr);
                const isCompleted = entry?.completed || false;
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-xs font-medium
                      ${isCompleted
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                        : isTodayDate
                        ? 'bg-indigo-100 border-2 border-indigo-400 text-indigo-700'
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                    title={format(day, 'MMM d, yyyy') + (entry ? ` - Streak: ${entry.streak_count}` : '')}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-600"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-100"></div>
                <span className="text-gray-600">Missed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-indigo-100 border-2 border-indigo-400"></div>
                <span className="text-gray-600">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card-glass mt-6">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">How Streaks Work</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Complete at least <strong>1 task per day</strong> to maintain your streak</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔥</span>
                <span>Each consecutive day adds to your streak count</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>Missing a day resets your streak to 0</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Track your progress and beat your best streak!</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

