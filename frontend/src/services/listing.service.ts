import { apiClient } from './api';
import { PropertyListing, PaginatedResponse, ListingType, ListingStatus } from '../types';

export interface CreateListingData {
  property_id: number;
  listing_type: ListingType;
  price: number;
}

export interface UpdateListingData extends Partial<CreateListingData> {
  status?: ListingStatus;
}

export const listingService = {
  async getAll(params?: { 
    listing_type?: ListingType;
    status?: ListingStatus;
    page?: number;
  }): Promise<PaginatedResponse<PropertyListing>> {
    const queryParams = new URLSearchParams();
    if (params?.listing_type) queryParams.append('listing_type', params.listing_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<PropertyListing>>(`/listings/${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<PropertyListing> {
    return apiClient.get<PropertyListing>(`/listings/${id}/`);
  },

  async create(data: CreateListingData): Promise<PropertyListing> {
    return apiClient.post<PropertyListing>('/listings/', data);
  },

  async update(id: number, data: UpdateListingData): Promise<PropertyListing> {
    return apiClient.patch<PropertyListing>(`/listings/${id}/`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/listings/${id}/`);
  },
};
