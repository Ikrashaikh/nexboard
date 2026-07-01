export const STATUS_COLORS = {
  // Employee status
  ACTIVE:      'bg-green-100 text-green-700',
  ONBOARDING:  'bg-blue-100 text-blue-700',
  INACTIVE:    'bg-slate-100 text-slate-600',
  TERMINATED:  'bg-red-100 text-red-700',
  // Task status
  PENDING:     'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED:   'bg-green-100 text-green-700',
  // Approval / doc
  APPROVED:    'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
  VERIFIED:    'bg-green-100 text-green-700',
  // Escalation
  OPEN:        'bg-orange-100 text-orange-700',
  RESOLVED:    'bg-slate-100 text-slate-500',
  // Notification
  NEW_TASK_ASSIGNED:    'bg-primary-100 text-primary-700',
  OVERDUE_TASK:         'bg-red-100 text-red-700',
  COMPLETED_ONBOARDING: 'bg-green-100 text-green-700',
  WELCOME_EMPLOYEE:     'bg-purple-100 text-purple-700',
};

export const EMPLOYEE_STATUSES = ['ONBOARDING', 'ACTIVE', 'INACTIVE', 'TERMINATED'];
export const TASK_STATUSES     = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const ROLES             = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
export const DOC_TYPES         = ['OFFER_LETTER', 'AADHAR', 'PAN', 'PASSPORT', 'EDUCATION_DOCUMENT'];
export const APPROVAL_TYPES    = ['HR_APPROVAL', 'MANAGER_APPROVAL', 'IT_APPROVAL'];
