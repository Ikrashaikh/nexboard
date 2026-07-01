import api from './axios';

export const getUsers  = ()     => api.get('/users');
export const createUser = (data) => api.post('/users', data);
