import { apiClient } from './api';
import { PropertyTransaction, PaginatedResponse, TransactionType } from '../types';

export interface CreateTransactionData {
  property_id: number;
  customer_id: number;
  transaction_type: TransactionType;
  price: number;
  transaction_date?: string;
}

export const transactionService = {
  async getAll(params?: { 
    transaction_type?: TransactionType;
    customer_id?: number;
    page?: number;
  }): Promise<PaginatedResponse<PropertyTransaction>> {
    const queryParams = new URLSearchParams();
    if (params?.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiClient.get<PaginatedResponse<PropertyTransaction>>(`/transactions/${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<PropertyTransaction> {
    return apiClient.get<PropertyTransaction>(`/transactions/${id}/`);
  },

  async create(data: CreateTransactionData): Promise<PropertyTransaction> {
    return apiClient.post<PropertyTransaction>('/transactions/', data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/${id}/`);
  },
};
