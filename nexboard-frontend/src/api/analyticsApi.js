import api from './axios';

export const getDepartmentCompletion = () => api.get('/analytics/department-completion');
export const getOnboardingTrendWeekly  = () => api.get('/analytics/onboarding-trend/weekly');
export const getOnboardingTrendMonthly = () => api.get('/analytics/onboarding-trend/monthly');
export const getHiringStats            = () => api.get('/analytics/hiring');
export const getCompletionRate         = () => api.get('/analytics/completion-rate');
export const getAverageDuration        = () => api.get('/analytics/average-duration');
