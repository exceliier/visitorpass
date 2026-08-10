import axiosInstance from '../axiosInstance';

export interface AppSettings {
  _id?: string;
  organizationName: string;
  appTitle: string;
  passTitle: string;
  logoUrl: string;
  offices: string[];
  validityHours: number;
  cutoffTime: string;
  footerNotice: string;
  fontFamily: string;
}

export const defaultSettings: AppSettings = {
  organizationName: 'सिंचन भवन, छत्रपती संभाजीनगर',
  appTitle: 'Visitor Pass Management',
  passTitle: 'अभ्यागत प्रवेश परवाना',
  logoUrl: '/logo.png',
  offices: [
    'GMIDC Technical-section',
    'GMIDC Accounts-section',
    'GMIDC Dakshata-court-section',
    'GMIDC-Ex Dir',
    'GMIDC-Sup Engr',
    'GMIDC-EE/DySE',
    'CEWRD-Techincal',
    'CEWRD-Corr. Branch',
    'CEWRD-Chief Engr',
    'CEWRD-Ex Engr',
    'QCC',
    'AID',
    'MID-1',
    'Other',
  ],
  validityHours: 2,
  cutoffTime: '17:00',
  footerNotice: 'पर्यन्त प्रवेश परवाना वैध आहे.',
  fontFamily: "'DVOT-Surekh', 'DVOT Surekh', 'Nirmala UI', 'Mangal', sans-serif",
};

export const fetchSettings = async (): Promise<AppSettings> => {
  try {
    const response = await axiosInstance.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings from API, falling back to defaults:', error);
    return defaultSettings;
  }
};

export const updateSettings = async (settingsData: Partial<AppSettings>): Promise<AppSettings> => {
  const response = await axiosInstance.put('/settings', settingsData);
  return response.data.settings;
};
