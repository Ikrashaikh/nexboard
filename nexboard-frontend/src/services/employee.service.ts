import api from '../lib/axios';
import type { EmployeeResponse, EmployeeRequest, Page } from '../types';

export const employeeService = {
  getAll: () => api.get<EmployeeResponse[]>('/employees'),
  getById: (id: number) => api.get<EmployeeResponse>(`/employees/${id}`),
  create: (data: EmployeeRequest) => api.post<EmployeeResponse>('/employees', data),
  search: (params: Record<string, unknown>) =>
    api.get<Page<EmployeeResponse>>('/employees/search', { params }),
};
