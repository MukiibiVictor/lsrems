import { apiClient } from './api';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'report' | 'booking' | 'transaction' | 'system' | 'project';
  actionUrl?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  transactionAlerts: boolean;
  projectUpdates: boolean;
  systemAlerts: boolean;
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    // For now, return mock data. In production, this would be:
    // return apiClient.get<Notification[]>('/notifications/');
    
    return [
      {
        id: '1',
        type: 'info',
        title: 'Weekly Report Generated',
        message: 'Your weekly property report is ready for download.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        category: 'report',
        actionUrl: '/dashboard/reports'
      },
      {
        id: '2',
        type: 'success',
        title: 'New Transaction Recorded',
        message: 'Property sale completed successfully.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        category: 'transaction',
        actionUrl: '/dashboard/transactions'
      }
    ];
  },

  async markAsRead(id: string): Promise<void> {
    // return apiClient.patch(`/notifications/${id}/`, { read: true });
    console.log(`Marking notification ${id} as read`);
  },

  async markAllAsRead(): Promise<void> {
    // return apiClient.post('/notifications/mark-all-read/', {});
    console.log('Marking all notifications as read');
  },

  async delete(id: string): Promise<void> {
    // return apiClient.delete(`/notifications/${id}/`);
    console.log(`Deleting notification ${id}`);
  },

  async getSettings(): Promise<NotificationSettings> {
    // return apiClient.get<NotificationSettings>('/notifications/settings/');
    return {
      emailNotifications: true,
      smsNotifications: false,
      weeklyReports: true,
      transactionAlerts: true,
      projectUpdates: true,
      systemAlerts: true,
    };
  },

  async updateSettings(settings: NotificationSettings): Promise<void> {
    // return apiClient.put('/notifications/settings/', settings);
    console.log('Updating notification settings:', settings);
  },
};