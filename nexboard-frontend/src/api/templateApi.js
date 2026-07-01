import api from './axios';

export const getTemplates      = ()              => api.get('/workflow-templates');
export const getTemplateById   = (id)            => api.get(`/workflow-templates/${id}`);
export const createTemplate    = (data)          => api.post('/workflow-templates', data);
export const addStage          = (templateId, data) =>
  api.post(`/workflow-templates/${templateId}/stages`, data);
export const assignTemplate    = (employeeId)    =>
  api.post(`/workflow-templates/assign/${employeeId}`);
export const getProgress       = (employeeId)    =>
  api.get(`/workflow-templates/progress/${employeeId}`);
