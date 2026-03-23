import { apiClient } from './api';
import { Property, PaginatedResponse, PropertyStatus } from '../types';

export interface CreatePropertyData {
  property_name: string;
  location: string;
  size: string;
  description?: string;
  price?: number | null;
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
    hide_taken?: boolean;
  }): Promise<PaginatedResponse<Property>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.property_type) queryParams.append('property_type', params.property_type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.hide_taken) queryParams.append('hide_taken', '1');
    
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

  async uploadImage(propertyId: number, file: File, caption = '', isPrimary = false): Promise<any> {
    return apiClient.uploadFile<any>(
      `/properties/${propertyId}/upload-image/`,
      file,
      { caption, is_primary: isPrimary ? 'true' : 'false' },
      'image'
    );
  },

  async deleteImage(propertyId: number, imageId: number): Promise<void> {
    return apiClient.delete<void>(`/properties/${propertyId}/images/${imageId}/`);
  },
};
