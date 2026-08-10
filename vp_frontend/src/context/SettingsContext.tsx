import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, defaultSettings, fetchSettings, updateSettings as apiUpdateSettings } from '../services/settingsService';

export interface UserSession {
  id: string;
  username: string;
  role: 'admin' | 'user';
  officeId: string;
  name?: string;
}

interface SettingsContextType {
  settings: AppSettings;
  user: UserSession | null;
  loading: boolean;
  isAdmin: boolean;
  reloadSettings: () => Promise<void>;
  saveSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
  setCurrentUserSession: (user: UserSession | null, officeSettings?: AppSettings) => void;
  logout: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  user: null,
  loading: true,
  isAdmin: false,
  reloadSettings: async () => {},
  saveSettings: async () => defaultSettings,
  setCurrentUserSession: () => {},
  logout: () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const storedUserStr = sessionStorage.getItem('userInfo');
      let sessionUser: UserSession | null = null;
      if (storedUserStr) {
        try {
          sessionUser = JSON.parse(storedUserStr);
          setUser(sessionUser);
        } catch (e) {
          console.error('Failed to parse userInfo:', e);
        }
      }

      const token = sessionStorage.getItem('authToken');
      if (token) {
        const data = await fetchSettings();
        setSettings(data);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings context:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentUserSession = (userSession: UserSession | null, officeSettings?: AppSettings) => {
    setUser(userSession);
    if (userSession) {
      sessionStorage.setItem('userInfo', JSON.stringify(userSession));
    } else {
      sessionStorage.removeItem('userInfo');
    }
    if (officeSettings) {
      setSettings(officeSettings);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('visitorData');
    setUser(null);
    setSettings(defaultSettings);
  };

  const saveSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
    const updated = await apiUpdateSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        user,
        loading,
        isAdmin,
        reloadSettings: loadSettings,
        saveSettings,
        setCurrentUserSession,
        logout,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  return useContext(SettingsContext);
};
