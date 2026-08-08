import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';
import type { UserTravelProfile } from '../types/profile';

export const getProfileApi = async (): Promise<ApiResponse<UserTravelProfile>> => {
  const response = await apiClient.get<ApiResponse<UserTravelProfile>>('/profile');
  return response.data;
};

export const createProfileApi = async (profileData: Partial<UserTravelProfile>): Promise<ApiResponse<UserTravelProfile>> => {
  const response = await apiClient.post<ApiResponse<UserTravelProfile>>('/profile', profileData);
  return response.data;
};

export const updateProfileApi = async (profileData: Partial<UserTravelProfile>): Promise<ApiResponse<UserTravelProfile>> => {
  const response = await apiClient.put<ApiResponse<UserTravelProfile>>('/profile', profileData);
  return response.data;
};
