import { apiClient } from './api';
import { Expense, PaginatedResponse, ExpenseCategory } from '../types';

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expense_date: string;
}

export const expenseService = {
  async getAll(params?: { search?: string; page?: number }): Promise<PaginatedResponse<Expense>> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', params.page.toString());
    const qs = q.toString();
    return apiClient.get<PaginatedResponse<Expense>>(`/expenses/${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateExpenseData): Promise<Expense> {
    return apiClient.post<Expense>('/expenses/', data);
  },

  async update(id: number, data: Partial<CreateExpenseData>): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${id}/`, data);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/expenses/${id}/`);
  },
};
