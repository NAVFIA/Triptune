import { apiClient } from './client';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const loginApi = async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data;
};
