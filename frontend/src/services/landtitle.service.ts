import { apiClient } from './api';
import { LandTitle, PaginatedResponse } from '../types';

export interface CreateLandTitleData {
  project_id: number;
  document_type: 'survey_map' | 'land_title' | 'boundary_report';
}

export const landTitleService = {
  async getAll(params?: { 
    project_id?: number;
    page?: number;
  }): Promise<PaginatedResponse<LandTitle>> {
    const queryParams = new URLSearchParams();
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<LandTitle>>(`/land-titles/${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<LandTitle> {
    return apiClient.get<LandTitle>(`/land-titles/${id}/`);
  },

  async upload(file: File, data: CreateLandTitleData): Promise<LandTitle> {
    return apiClient.uploadFile<LandTitle>('/land-titles/', file, {
      project_id: data.project_id.toString(),
      document_type: data.document_type,
    }, 'document_file');
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/land-titles/${id}/`);
  },

  async download(id: number): Promise<Blob> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${apiClient.getBaseURL()}/land-titles/${id}/download/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    return response.blob();
  },
};
