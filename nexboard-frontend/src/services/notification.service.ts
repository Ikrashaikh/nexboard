import api from '../lib/axios';
import type { NotificationResponse } from '../types';

export const notificationService = {
  getAll: () => api.get<NotificationResponse[]>('/notifications'),
  getByEmployee: (employeeId: number) =>
    api.get<NotificationResponse[]>(`/notifications/employee/${employeeId}`),
  markRead: (notificationId: number) =>
    api.put(`/notifications/${notificationId}/read`),
};
