import api from './axios';

export const getEmployeeReport    = () => api.get('/reports/employees');
export const getDepartmentReport  = () => api.get('/reports/departments');
export const getSlaReport         = () => api.get('/reports/sla');
export const getReadinessReport   = () => api.get('/reports/readiness');
export const getAuditReport       = () => api.get('/reports/audit');
export const getAuditLogs         = () => api.get('/audit-logs');
