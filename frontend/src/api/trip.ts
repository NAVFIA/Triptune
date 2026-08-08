import axios from 'axios';
import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';
import type { PageResponse, Trip, TripCreateRequest, Itinerary, SelectedDestinationSummary } from '../types/trip';

export const getTripsApi = async (page = 0, size = 10): Promise<ApiResponse<PageResponse<Trip>>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<Trip>>>(`/trips?page=${page}&size=${size}`);
  return response.data;
};

export const getTripApiErrorMessage = (error: unknown, fallback = 'Failed to create trip'): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Network error. Please check your connection and try again.';
    }
    const status = error.response.status;
    const message = error.response.data?.message as string | undefined;
    if (status === 401) {
      return message || 'Unauthorized. Please log in again.';
    }
    if (status === 403) {
      return message || 'Forbidden. You do not have permission to perform this action.';
    }
    return message || fallback;
  }
  return fallback;
};

export const createTripApi = async (data: TripCreateRequest): Promise<ApiResponse<Trip>> => {
  if (import.meta.env.DEV) {
    console.log('[createTripApi] payload:', data);
  }
  const response = await apiClient.post<ApiResponse<Trip>>('/trips', data);
  return response.data;
};

export const getTripApi = async (tripId: number): Promise<ApiResponse<Trip>> => {
  const response = await apiClient.get<ApiResponse<Trip>>(`/trips/${tripId}`);
  return response.data;
};

export const getDestinationRecommendationsApi = async (tripId: number): Promise<ApiResponse<unknown[]>> => {
  const response = await apiClient.get<ApiResponse<unknown[]>>(`/trips/${tripId}/destination-recommendations`);
  return response.data;
};

export const selectDestinationApi = async (tripId: number, destinationId: number): Promise<ApiResponse<Trip>> => {
  const response = await apiClient.post<ApiResponse<Trip>>(`/trips/${tripId}/select-destination/${destinationId}`);
  return response.data;
};

export const getItineraryApi = async (tripId: number): Promise<ApiResponse<Itinerary>> => {
  const response = await apiClient.get<ApiResponse<Itinerary>>(`/trips/${tripId}/itinerary`);
  return response.data;
};

export const rejectItineraryActivityApi = async (tripId: number, activityId: number): Promise<ApiResponse<Itinerary>> => {
  const response = await apiClient.post<ApiResponse<Itinerary>>(`/trips/${tripId}/itinerary/reject/${activityId}`);
  return response.data;
};

export const confirmTripApi = async (tripId: number): Promise<ApiResponse<Trip>> => {
  const response = await apiClient.post<ApiResponse<Trip>>(`/trips/${tripId}/confirm`);
  return response.data;
};

export const getDestinationsApi = async (): Promise<ApiResponse<SelectedDestinationSummary[]>> => {
  const response = await apiClient.get<ApiResponse<SelectedDestinationSummary[]>>('/destinations');
  return response.data;
};
