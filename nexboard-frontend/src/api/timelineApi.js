import api from './axios';

export const getTimeline = (employeeId) =>
  api.get(`/employee-timelines/employee/${employeeId}`);
