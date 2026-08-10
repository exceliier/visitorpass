import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSettings, defaultSettings, fetchSettings, updateSettings as apiUpdateSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  reloadSettings: () => Promise<void>;
  saveSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  reloadSettings: async () => {},
  saveSettings: async () => defaultSettings,
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings context:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
    const updated = await apiUpdateSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        reloadSettings: loadSettings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  return useContext(SettingsContext);
};
