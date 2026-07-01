import api from './axios';

export const initializeApprovals = (employeeId)       =>
  api.post(`/approval-workflows/employee/${employeeId}/initialize`);
export const getApprovalsByEmployee = (employeeId)    =>
  api.get(`/approval-workflows/employee/${employeeId}`);
export const makeDecision = (approvalId, data)        =>
  api.put(`/approval-workflows/${approvalId}/decision`, data);
export const getApprovalHistory = (approvalId)        =>
  api.get(`/approval-workflows/${approvalId}/history`);
