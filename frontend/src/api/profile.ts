import { apiClient } from './client';
import { ApiResponse } from '../types/auth';
import { UserTravelProfile } from '../types/profile';

export const getProfileApi = async (): Promise<ApiResponse<UserTravelProfile>> => {
  const response = await apiClient.get<ApiResponse<UserTravelProfile>>('/profile');
  return response.data;
};
