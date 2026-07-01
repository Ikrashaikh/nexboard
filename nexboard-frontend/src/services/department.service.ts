import api from '../lib/axios';
import type { DepartmentResponse, DepartmentRequest } from '../types';

export const departmentService = {
  getAll: () => api.get<DepartmentResponse[]>('/departments'),
  create: (data: DepartmentRequest) => api.post<DepartmentResponse>('/departments', data),
};
