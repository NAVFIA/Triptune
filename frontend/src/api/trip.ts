import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';
import type { PageResponse, Trip } from '../types/trip';

export const getTripsApi = async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Trip>>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<Trip>>>(`/trips?page=${page}&size=${size}`);
  return response.data;
};

export const createTripApi = async (data: any): Promise<ApiResponse<Trip>> => {
  const response = await apiClient.post<ApiResponse<Trip>>('/trips', data);
  return response.data;
};

export const getTripApi = async (tripId: number): Promise<ApiResponse<Trip>> => {
  const response = await apiClient.get<ApiResponse<Trip>>(`/trips/${tripId}`);
  return response.data;
};

export const getDestinationRecommendationsApi = async (tripId: number): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/trips/${tripId}/destination-recommendations`);
  return response.data;
};

export const selectDestinationApi = async (tripId: number, destinationId: number): Promise<ApiResponse<Trip>> => {
  const response = await apiClient.post<ApiResponse<Trip>>(`/trips/${tripId}/select-destination/${destinationId}`);
  return response.data;
};
