import { apiClient } from './api';
import { Customer, PaginatedResponse } from '../types';

export interface CreateCustomerData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export const customerService = {
  async getAll(params?: { search?: string; page?: number }): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<Customer>>(`/customers/${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}/`);
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    return apiClient.post<Customer>('/customers/', data);
  },

  async update(id: number, data: UpdateCustomerData): Promise<Customer> {
    return apiClient.patch<Customer>(`/customers/${id}/`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/customers/${id}/`);
  },
};
