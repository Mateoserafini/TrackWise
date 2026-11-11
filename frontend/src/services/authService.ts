import { api } from './api';
import { AuthResponse, LoginPayload, RegisterPayload, RegisterResponse, User, VerifyOtpPayload } from '@/types/auth.types';

export const authService = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return api.post<RegisterResponse>('/auth/register', payload);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/verify-otp', payload);
  },

  async resendOtp(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    return api.post('/auth/resend-otp', { email });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', payload);
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return api.get<{ success: boolean; user: User }>('/auth/me');
  },
};
