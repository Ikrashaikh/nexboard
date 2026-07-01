import api from './axios';

export const getDepartments    = ()     => api.get('/departments');
export const createDepartment  = (data) => api.post('/departments', data);
