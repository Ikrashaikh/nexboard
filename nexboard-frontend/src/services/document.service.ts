import api from '../lib/axios';
import type { EmployeeDocumentResponse } from '../types';

export const documentService = {
  upload: (employeeId: number, documentType: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<EmployeeDocumentResponse>(
      `/employee-documents/employee/${employeeId}/upload?documentType=${documentType}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
  getByEmployee: (employeeId: number) =>
    api.get<EmployeeDocumentResponse[]>(`/employee-documents/employee/${employeeId}`),
  verify: (documentId: number, data: { verificationStatus: string; remarks: string }) =>
    api.put(`/employee-documents/${documentId}/verification`, data),
};
