import api from './axios';

export const runEscalationScan  = ()   => api.post('/escalations/run');
export const getAllEscalations   = ()   => api.get('/escalations');
export const getOpenEscalations  = ()   => api.get('/escalations/open');
export const resolveEscalation   = (id) => api.put(`/escalations/${id}/resolve`);
