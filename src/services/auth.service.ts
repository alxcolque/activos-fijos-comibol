import api from '../api/axios.instance';
import type { LoginCredentials, LoginResponseData, UserProfile } from '../interfaces/auth.interface';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponseData> {
    const response = await api.post<{ success: boolean; data: any }>(
      '/auth/login',
      credentials,
    );
    const data = response.data.data;
    const token = data.token || data.accessToken;
    const user = data.user;
    if (user && !user.name) {
      user.name = user.fullName;
    }
    return {
      token,
      user,
    };
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<{ success: boolean; data: any }>(
      '/auth/me',
    );
    const rawData = response.data.data;
    const user = rawData.user || rawData;
    if (user && !user.name) {
      user.name = user.fullName;
    }
    return user;
  },
};
