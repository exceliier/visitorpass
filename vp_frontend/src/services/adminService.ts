import axiosInstance from '../axiosInstance';
import { AppSettings } from './settingsService';

export interface UserAccount {
  _id: string;
  username: string;
  role: 'admin' | 'user';
  officeId: string;
  name?: string;
}

export const fetchOffices = async (): Promise<AppSettings[]> => {
  const response = await axiosInstance.get('/admin/offices');
  return response.data;
};

export const createOffice = async (officeData: Partial<AppSettings>): Promise<AppSettings> => {
  const response = await axiosInstance.post('/admin/offices', officeData);
  return response.data.office;
};

export const updateOffice = async (officeId: string, officeData: Partial<AppSettings>): Promise<AppSettings> => {
  const response = await axiosInstance.put(`/admin/offices/${officeId}`, officeData);
  return response.data.office;
};

export const fetchUsers = async (): Promise<UserAccount[]> => {
  const response = await axiosInstance.get('/admin/users');
  return response.data;
};

export const createUser = async (userData: {
  username: string;
  password: string;
  role: string;
  officeId: string;
  name?: string;
}): Promise<UserAccount> => {
  const response = await axiosInstance.post('/admin/users', userData);
  return response.data.user;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/admin/users/${userId}`);
};

export const fetchCaptcha = async (): Promise<{ captchaId: string; captchaText: string }> => {
  const response = await axiosInstance.get('/auth/captcha');
  return response.data;
};
