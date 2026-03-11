import { apiClient } from './api';
import { Property, PaginatedResponse, PropertyStatus } from '../types';

export interface CreatePropertyData {
  property_name: string;
  location: string;
  size: string;
  land_title_id?: number;
  property_type: 'land' | 'house' | 'commercial' | 'apartment';
  status?: PropertyStatus;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {}

export const propertyService = {
  async getAll(params?: { 
    search?: string;
    status?: PropertyStatus;
    property_type?: string;
    page?: number;
  }): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.property_type) queryParams.append('property_type', params.property_type);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Property>>(`/properties/${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<Property> {
    return apiClient.get<Property>(`/properties/${id}/`);
  },

  async create(data: CreatePropertyData): Promise<Property> {
    return apiClient.post<Property>('/properties/', data);
  },

  async update(id: number, data: UpdatePropertyData): Promise<Property> {
    return apiClient.patch<Property>(`/properties/${id}/`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/properties/${id}/`);
  },
};
