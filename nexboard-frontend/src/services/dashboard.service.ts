import api from '../lib/axios';
import type { DashboardStats, DepartmentCompletion, OnboardingTrend, HiringStats, CompletionRate } from '../types';

export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};

export const analyticsService = {
  getDepartmentCompletion: () => api.get<DepartmentCompletion[]>('/analytics/department-completion'),
  getTrendWeekly: () => api.get<OnboardingTrend[]>('/analytics/onboarding-trend/weekly'),
  getTrendMonthly: () => api.get<OnboardingTrend[]>('/analytics/onboarding-trend/monthly'),
  getHiring: () => api.get<HiringStats>('/analytics/hiring'),
  getCompletionRate: () => api.get<CompletionRate>('/analytics/completion-rate'),
};
