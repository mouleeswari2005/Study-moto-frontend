/**
 * Timer Context for managing Pomodoro timer state globally.
 * Persists across page navigation and handles background running.
 */
import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { SessionType, PomodoroSession } from '../types';

interface TimerState {
  isRunning: boolean;
  timeLeft: number; // in seconds
  sessionId: number | null;
  sessionType: SessionType | null;
  startTime: Date | null;
  duration: number; // in seconds
  taskId: number | null;
}

interface TimerContextType {
  isRunning: boolean;
  timeLeft: number;
  sessionId: number | null;
  sessionType: SessionType | null;
  startTimer: (sessionType: SessionType, duration: number, taskId?: number | null) => Promise<void>;
  stopTimer: () => Promise<void>;
  formatTime: (seconds: number) => string;
  setCompletionCallback: (callback: (() => void) | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const STORAGE_KEY = 'pomodoro_timer_state';

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    timeLeft: 0,
    sessionId: null,
    sessionType: null,
    startTime: null,
    duration: 0,
    taskId: null,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionCallbackRef = useRef<(() => void) | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    if (!user) return;
    
    const loadState = async () => {
      try {
        // First, try to get active session from backend
        const response = await api.get('/pomodoro/active');
        if (response.data) {
          const session: PomodoroSession = response.data;
          const startTime = new Date(session.started_at);
          const durationSeconds = session.planned_duration_minutes * 60;
          const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
          const timeLeft = Math.max(0, durationSeconds - elapsedSeconds);
          
          setState({
            isRunning: timeLeft > 0,
            timeLeft,
            sessionId: session.id,
            sessionType: session.session_type as SessionType,
            startTime,
            duration: durationSeconds,
            taskId: session.task_id || null,
          });
          
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            sessionId: session.id,
            sessionType: session.session_type,
            startTime: startTime.toISOString(),
            duration: durationSeconds,
            taskId: session.task_id,
          }));
        } else {
          // No active session, try to load from localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            const startTime = new Date(parsed.startTime);
            const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
            const timeLeft = Math.max(0, parsed.duration - elapsedSeconds);
            
            if (timeLeft > 0 && parsed.sessionId) {
              // Verify session still exists
              try {
                const verifyResponse = await api.get(`/pomodoro/${parsed.sessionId}`);
                if (verifyResponse.data && !verifyResponse.data.is_completed) {
                  setState({
                    isRunning: true,
                    timeLeft,
                    sessionId: parsed.sessionId,
                    sessionType: parsed.sessionType,
                    startTime,
                    duration: parsed.duration,
                    taskId: parsed.taskId,
                  });
                } else {
                  localStorage.removeItem(STORAGE_KEY);
                }
              } catch {
                localStorage.removeItem(STORAGE_KEY);
              }
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load timer state:', error);
        // Clear invalid localStorage
        localStorage.removeItem(STORAGE_KEY);
      }
    };
    
    loadState();
  }, [user]);

  // Timer interval - calculates from start time for accuracy
  useEffect(() => {
    if (state.isRunning && state.startTime && state.duration > 0) {
      const updateTimer = () => {
        const elapsedSeconds = Math.floor((Date.now() - state.startTime!.getTime()) / 1000);
        const timeLeft = Math.max(0, state.duration - elapsedSeconds);
        
        if (timeLeft <= 0) {
          // Timer completed - stop the timer and call completion callback
          setState(prev => ({
            ...prev,
            isRunning: false,
            timeLeft: 0,
          }));
          
          if (completionCallbackRef.current) {
            completionCallbackRef.current();
          }
        } else {
          setState(prev => ({ ...prev, timeLeft }));
        }
      };
      
      // Update immediately
      updateTimer();
      
      // Then update every second
      intervalRef.current = setInterval(updateTimer, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.isRunning, state.startTime, state.duration]);

  // Persist to localStorage when state changes
  useEffect(() => {
    if (state.sessionId && state.startTime) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId: state.sessionId,
        sessionType: state.sessionType,
        startTime: state.startTime.toISOString(),
        duration: state.duration,
        taskId: state.taskId,
      }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.sessionId, state.startTime, state.sessionType, state.duration, state.taskId]);

  const startTimer = useCallback(async (sessionType: SessionType, duration: number, taskId?: number | null) => {
    try {
      const plannedMinutes = Math.floor(duration / 60);
      const response = await api.post('/pomodoro/start', {
        session_type: sessionType,
        planned_duration_minutes: plannedMinutes,
        task_id: taskId || undefined,
      });
      
      const startTime = new Date();
      setState({
        isRunning: true,
        timeLeft: duration,
        sessionId: response.data.id,
        sessionType,
        startTime,
        duration,
        taskId: taskId || null,
      });
    } catch (error) {
      console.error('Failed to start timer:', error);
      throw error;
    }
  }, []);

  const stopTimer = useCallback(async () => {
    if (!state.sessionId) return;
    
    try {
      await api.put(`/pomodoro/${state.sessionId}/stop`);
      setState({
        isRunning: false,
        timeLeft: 0,
        sessionId: null,
        sessionType: null,
        startTime: null,
        duration: 0,
        taskId: null,
      });
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to stop timer:', error);
      throw error;
    }
  }, [state.sessionId]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const setCompletionCallback = useCallback((callback: (() => void) | null) => {
    completionCallbackRef.current = callback;
  }, []);

  return (
    <TimerContext.Provider
      value={{
        isRunning: state.isRunning,
        timeLeft: state.timeLeft,
        sessionId: state.sessionId,
        sessionType: state.sessionType,
        startTimer,
        stopTimer,
        formatTime,
        setCompletionCallback,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

