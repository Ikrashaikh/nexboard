import api from '../lib/axios';
import type { EscalationResponse } from '../types';

export const escalationService = {
  run: () => api.post<EscalationResponse[]>('/escalations/run'),
  getAll: () => api.get<EscalationResponse[]>('/escalations'),
  getOpen: () => api.get<EscalationResponse[]>('/escalations/open'),
  resolve: (id: number) => api.put(`/escalations/${id}/resolve`),
};
