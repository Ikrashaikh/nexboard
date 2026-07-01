import api from './axios';

export const getAllDocuments = () =>
  api.get('/employee-documents');

export const getDocumentsByEmployee = (employeeId) =>
  api.get(`/employee-documents/employee/${employeeId}`);

export const uploadDocument = (employeeId, documentType, file) => {
  const form = new FormData();
  form.append('file', file);
  // Do NOT set Content-Type manually — Axios sets it with the correct multipart boundary
  return api.post(
    `/employee-documents/employee/${employeeId}/upload?documentType=${documentType}`,
    form
  );
};

export const getDocumentFile = (documentId) =>
  api.get(`/employee-documents/${documentId}/file`, { responseType: 'blob' });

export const verifyDocument = (documentId, data) =>
  api.put(`/employee-documents/${documentId}/verification`, data);
