import api from '../lib/axios';
import type { ApprovalRequestResponse } from '../types';

export const approvalService = {
  initialize: (employeeId: number) =>
    api.post<ApprovalRequestResponse[]>(`/approval-workflows/employee/${employeeId}/initialize`),
  getByEmployee: (employeeId: number) =>
    api.get<ApprovalRequestResponse[]>(`/approval-workflows/employee/${employeeId}`),
  decide: (approvalRequestId: number, data: { status: string; actionBy: string; remarks: string }) =>
    api.put(`/approval-workflows/${approvalRequestId}/decision`, data),
  getHistory: (approvalRequestId: number) =>
    api.get(`/approval-workflows/${approvalRequestId}/history`),
};
