
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode, UserPreferences } from '@/lib/types';

interface PreferenceState extends UserPreferences {
  backgroundTheme: 'rainbow' | 'particles' | 'waves' | 'minimal';
  googleIntegration: {
    isConnected: boolean;
    email: string | null;
  };
  setTheme: (theme: ThemeMode) => void;
  setDefaultView: (view: UserPreferences['defaultView']) => void;
  setBackgroundTheme: (theme: 'rainbow' | 'particles' | 'waves' | 'minimal') => void;
  setGoogleIntegration: (status: boolean, email: string | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      theme: 'dark',
      defaultView: 'list',
      defaultTaskDuration: 30,
      defaultPriority: 'medium',
      showCompletedTasks: true,
      enableNotifications: true,
      notificationChannels: ['in-app'],
      enableTimeTracking: true,
      enableCollaboration: false,
      enableSmartSuggestions: true,
      enableNaturalLanguageInput: true,
      backgroundTheme: 'rainbow',
      googleIntegration: {
        isConnected: false,
        email: null,
      },
      integrations: {
        googleCalendar: false,
        slack: false,
        microsoftTeams: false,
      },
      focusMode: {
        enabled: false,
        hideNotifications: true,
        hideNavigation: false,
        pomodoroDuration: 25,
        breakDuration: 5,
      },
      setTheme: (theme) => set({ theme }),
      setDefaultView: (defaultView) => set({ defaultView }),
      setBackgroundTheme: (backgroundTheme) => set({ backgroundTheme }),
      setGoogleIntegration: (isConnected, email) => 
        set({ googleIntegration: { isConnected, email } }),
      updatePreferences: (preferences) => set((state) => ({ ...state, ...preferences })),
    }),
    {
      name: 'taskminder-preferences',
    }
  )
);
