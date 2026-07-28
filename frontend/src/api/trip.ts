import { apiClient } from './client';
import { ApiResponse } from '../types/auth';
import { PageResponse, Trip } from '../types/trip';

export const getTripsApi = async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Trip>>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<Trip>>>(`/trips?page=${page}&size=${size}`);
  return response.data;
};
