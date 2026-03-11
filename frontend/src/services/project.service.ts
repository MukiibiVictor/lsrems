import { apiClient } from './api';
import { SurveyProject, ProjectUpdate, PaginatedResponse, ProjectStatus } from '../types';

export interface CreateProjectData {
  customer_id: number;
  surveyor_id: number;
  project_name: string;
  location: string;
  status?: ProjectStatus;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface CreateProjectUpdateData {
  project_id: number;
  status: ProjectStatus;
  notes: string;
}

export const projectService = {
  async getAll(params?: { 
    search?: string; 
    status?: ProjectStatus;
    page?: number;
  }): Promise<PaginatedResponse<SurveyProject>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<SurveyProject>>(`/projects/${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<SurveyProject> {
    return apiClient.get<SurveyProject>(`/projects/${id}/`);
  },

  async create(data: CreateProjectData): Promise<SurveyProject> {
    return apiClient.post<SurveyProject>('/projects/', data);
  },

  async update(id: number, data: UpdateProjectData): Promise<SurveyProject> {
    return apiClient.patch<SurveyProject>(`/projects/${id}/`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}/`);
  },

  async getUpdates(projectId: number): Promise<ProjectUpdate[]> {
    return apiClient.get<ProjectUpdate[]>(`/projects/${projectId}/updates/`);
  },

  async addUpdate(data: CreateProjectUpdateData): Promise<ProjectUpdate> {
    return apiClient.post<ProjectUpdate>('/project-updates/', data);
  },
};
