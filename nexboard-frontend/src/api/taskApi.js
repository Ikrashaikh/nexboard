import api from './axios';

export const getTasksByEmployee = (employeeId)       => api.get(`/tasks/employee/${employeeId}`);
export const createTask         = (data)             => api.post('/tasks', data);
export const updateTaskStatus   = (taskId, status)   => api.put(`/tasks/${taskId}/status`, { status });
export const getReadiness       = (employeeId)       => api.get(`/tasks/readiness/${employeeId}`);
export const getOverdueTasks    = ()                 => api.get('/tasks/overdue');
export const getBottleneck      = ()                 => api.get('/tasks/analytics/bottleneck');
