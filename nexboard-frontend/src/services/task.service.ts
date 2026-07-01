import api from '../lib/axios';
import type { WorkflowTaskResponse, OverdueTask, ReadinessResponse } from '../types';

export const taskService = {
  getByEmployee: (employeeId: number) =>
    api.get<WorkflowTaskResponse[]>(`/tasks/employee/${employeeId}`),
  updateStatus: (taskId: number, status: string) =>
    api.put(`/tasks/${taskId}/status`, { status }),
  getOverdue: () => api.get<OverdueTask[]>('/tasks/overdue'),
  getReadiness: (employeeId: number) =>
    api.get<ReadinessResponse>(`/tasks/readiness/${employeeId}`),
  getBottleneck: () => api.get('/tasks/analytics/bottleneck'),
  create: (data: { taskName: string; dueDate: string; employeeId: number }) =>
    api.post<WorkflowTaskResponse>('/tasks', data),
};
