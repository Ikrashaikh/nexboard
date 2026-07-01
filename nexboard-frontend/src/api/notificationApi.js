import api from './axios';

export const getAllNotifications         = ()           => api.get('/notifications');
export const getNotificationsByEmployee  = (employeeId) => api.get(`/notifications/employee/${employeeId}`);
export const markNotificationRead        = (id)         => api.put(`/notifications/${id}/read`);
