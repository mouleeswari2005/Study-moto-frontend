/**
 * Pomodoro timer page.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import api from '../services/api';
import { SessionType, Task } from '../types';
import { format } from 'date-fns';
import { Navigation } from '../components/Navigation';

export const Pomodoro: React.FC = () => {
  const { user } = useAuth();
  const { preferences, refreshPreferences } = usePreferences();
  // Initialize with Study session type (default)
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.STUDY);
  // Duration will be set from preferences when available
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [stats, setStats] = useState<any>({
    total_minutes_today: 0,
    sessions_today: 0,
    total_minutes_this_week: 0,
    average_session_duration: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isEditingDurations, setIsEditingDurations] = useState(false);
  const [editDurations, setEditDurations] = useState({
    study: 0,
    shortBreak: 0,
    longBreak: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks?status=todo&limit=20');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchStats = useCallback(async (retryCount = 0) => {
    try {
      setStatsLoading(true);
      const response = await api.get('/pomodoro/stats');
      
      // Ensure we have all required fields
      if (response.data) {
        setStats({
          total_minutes_today: response.data.total_minutes_today ?? 0,
          sessions_today: response.data.sessions_today ?? 0,
          total_minutes_this_week: response.data.total_minutes_this_week ?? 0,
          average_session_duration: response.data.average_session_duration ?? 0,
        });
      } else {
        setStats({
          total_minutes_today: 0,
          sessions_today: 0,
          total_minutes_this_week: 0,
          average_session_duration: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      
      // Retry once after a delay if this was called after a session completion
      if (retryCount < 1) {
        setTimeout(() => {
          fetchStats(retryCount + 1);
        }, 1000);
        return;
      }
      
      // Keep default values on error after retry
      setStats({
        total_minutes_today: 0,
        sessions_today: 0,
        total_minutes_this_week: 0,
        average_session_duration: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
    if (preferences) {
      // Use only database preferences, no fallback defaults
      setEditDurations({
        study: preferences.study_duration_minutes || 0,
        shortBreak: preferences.short_break_duration_minutes || 0,
        longBreak: preferences.long_break_duration_minutes || 0,
      });
    }
  }, [preferences, fetchStats]);

  // Refresh stats periodically (every 30 seconds) when not running
  useEffect(() => {
    if (isRunning) return;

    const statsInterval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => {
      clearInterval(statsInterval);
    };
  }, [isRunning, fetchStats]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = async () => {
    try {
      const plannedMinutes = Math.floor(duration / 60);
      const response = await api.post('/pomodoro/start', {
        session_type: sessionType,
        planned_duration_minutes: plannedMinutes,
        task_id: selectedTaskId || undefined,
      });
      setCurrentSessionId(response.data.id);
      setTimeLeft(duration);
      setIsRunning(true);
      startTimeRef.current = new Date();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleStop = async () => {
    if (!currentSessionId) return;

    try {
      // Let the backend calculate exact duration from timestamps for accuracy
      // This ensures we get the exact time, not rounded/approximated values
      await api.put(`/pomodoro/${currentSessionId}/stop`);
      setIsRunning(false);
      setCurrentSessionId(null);
      setTimeLeft(duration);
      // Add a small delay to ensure backend has processed the session
      setTimeout(() => {
        fetchStats(0);
      }, 500);
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const handleComplete = async () => {
    if (!currentSessionId) return;

    try {
      // Let the backend calculate exact duration from timestamps for accuracy
      await api.put(`/pomodoro/${currentSessionId}/stop`);
      setIsRunning(false);
      setCurrentSessionId(null);
      setTimeLeft(duration);
      // Add a small delay to ensure backend has processed the session before fetching stats
      setTimeout(() => {
        fetchStats(0);
        alert('Session completed! Great work! 🎉');
      }, 500);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionDuration = (type: SessionType) => {
    // Use only database preferences, no fallback defaults
    const studyMinutes = preferences?.study_duration_minutes || 0;
    const shortBreakMinutes = preferences?.short_break_duration_minutes || 0;
    const longBreakMinutes = preferences?.long_break_duration_minutes || 0;
    
    switch (type) {
      case SessionType.STUDY:
        return studyMinutes * 60;
      case SessionType.SHORT_BREAK:
        return shortBreakMinutes * 60;
      case SessionType.LONG_BREAK:
        return longBreakMinutes * 60;
      default:
        // Default to Study session type
        return studyMinutes * 60;
    }
  };

  const handleSaveDurations = async () => {
    try {
      await api.put('/preferences', {
        study_duration_minutes: editDurations.study,
        short_break_duration_minutes: editDurations.shortBreak,
        long_break_duration_minutes: editDurations.longBreak,
      });
      await refreshPreferences();
      setIsEditingDurations(false);
      // Update current duration if not running
      if (!isRunning) {
        const newDuration = getSessionDuration(sessionType);
        setDuration(newDuration);
        setTimeLeft(newDuration);
      }
    } catch (error) {
      console.error('Failed to save durations:', error);
      alert('Failed to save durations');
    }
  };

  useEffect(() => {
    // Initialize duration when preferences are loaded or session type changes
    if (preferences) {
      const newDuration = getSessionDuration(sessionType);
      setDuration(newDuration);
      if (!isRunning) {
        setTimeLeft(newDuration);
      }
    }
  }, [sessionType, preferences, isRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navigation />
      <div className="page-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pomodoro Timer</h1>

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-indigo-600 mb-4">
              {formatTime(timeLeft)}
            </div>
            <div className="text-lg text-gray-600">
              {sessionType === SessionType.STUDY && 'Focus Time'}
              {sessionType === SessionType.SHORT_BREAK && 'Short Break'}
              {sessionType === SessionType.LONG_BREAK && 'Long Break'}
            </div>
          </div>

          {/* Session Type Selection */}
          {!isRunning && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Session Type
                </label>
                <button
                  onClick={() => setIsEditingDurations(!isEditingDurations)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {isEditingDurations ? 'Cancel' : 'Edit Timings'}
                </button>
              </div>
              
              {isEditingDurations ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Study (min)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={editDurations.study}
                        onChange={(e) => setEditDurations({ ...editDurations, study: parseInt(e.target.value) || 25 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Short Break (min)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={editDurations.shortBreak}
                        onChange={(e) => setEditDurations({ ...editDurations, shortBreak: parseInt(e.target.value) || 5 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Long Break (min)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={editDurations.longBreak}
                        onChange={(e) => setEditDurations({ ...editDurations, longBreak: parseInt(e.target.value) || 15 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveDurations}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Timings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSessionType(SessionType.STUDY)}
                    className={`px-4 py-2 rounded-md ${
                      sessionType === SessionType.STUDY
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Study {preferences?.study_duration_minutes ? `(${preferences.study_duration_minutes} min)` : ''}
                  </button>
                  <button
                    onClick={() => setSessionType(SessionType.SHORT_BREAK)}
                    className={`px-4 py-2 rounded-md ${
                      sessionType === SessionType.SHORT_BREAK
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Short Break {preferences?.short_break_duration_minutes ? `(${preferences.short_break_duration_minutes} min)` : ''}
                  </button>
                  <button
                    onClick={() => setSessionType(SessionType.LONG_BREAK)}
                    className={`px-4 py-2 rounded-md ${
                      sessionType === SessionType.LONG_BREAK
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Long Break {preferences?.long_break_duration_minutes ? `(${preferences.long_break_duration_minutes} min)` : ''}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Task Selection */}
          {!isRunning && sessionType === SessionType.STUDY && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task (Optional)
              </label>
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No task selected</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Start
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

