import api from '../lib/axios';
import type { EmployeeReport, SlaReport, AuditLog } from '../types';

export const reportService = {
  getEmployees: () => api.get<EmployeeReport[]>('/reports/employees'),
  getDepartments: () => api.get('/reports/departments'),
  getSla: () => api.get<SlaReport[]>('/reports/sla'),
  getReadiness: () => api.get('/reports/readiness'),
  getAudit: () => api.get<AuditLog[]>('/reports/audit'),
};

export const auditLogService = {
  getAll: () => api.get<AuditLog[]>('/audit-logs'),
};
