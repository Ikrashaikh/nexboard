import api from './axios';

export const getEmployees   = ()       => api.get('/employees');
export const getEmployeeById = (id)    => api.get(`/employees/${id}`);
export const createEmployee  = (data)  => api.post('/employees', data);
export const searchEmployees = (params) =>
  api.get('/employees/search', { params });
