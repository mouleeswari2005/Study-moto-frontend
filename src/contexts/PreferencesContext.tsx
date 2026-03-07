/**
 * Preferences Context for managing user preferences.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface Preferences {
  theme_color?: string;
  banner_image_url?: string;
  default_calendar_view: string;
  time_format: string;
  timezone: string;
  week_start_day: number;
  email_notifications_enabled: string;
  push_notifications_enabled: string;
  study_duration_minutes?: number;
  short_break_duration_minutes?: number;
  long_break_duration_minutes?: number;
}

interface PreferencesContextType {
  preferences: Preferences | null;
  loading: boolean;
  refreshPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/preferences');
      setPreferences(response.data);
      
      // Apply theme color
      if (response.data.theme_color) {
        document.documentElement.style.setProperty('--theme-color', response.data.theme_color);
        // Also update indigo colors to use theme color
        const root = document.documentElement;
        root.style.setProperty('--indigo-600', response.data.theme_color);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return (
    <PreferencesContext.Provider value={{ preferences, loading, refreshPreferences: fetchPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

