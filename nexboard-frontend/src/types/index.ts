// ── Auth ──────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface AuthUser {
  token: string;
  tokenType: string;
  username: string;
  role: Role;
}

// ── Common ────────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  timestamp: string;
  status: number;
  error: string;
  path: string;
  details: string[] | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface UserResponse { id: number; username: string; role: Role; }
export interface UserRequest  { username: string; password: string; role: Role; }

// ── Departments ───────────────────────────────────────────────────────────────
export interface DepartmentResponse { id: number; name: string; }
export interface DepartmentRequest  { name: string; }

// ── Employees ─────────────────────────────────────────────────────────────────
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ONBOARDING' | 'TERMINATED';

export interface EmployeeResponse {
  id: number; firstName: string; lastName: string; email: string;
  departmentName: string; joiningDate: string; status: EmployeeStatus;
  managerId: number | null; managerName: string | null;
}

export interface EmployeeRequest {
  firstName: string; lastName: string; email: string;
  departmentId: number; joiningDate?: string;
  status?: EmployeeStatus; managerId?: number;
}

// ── Workflow Templates ────────────────────────────────────────────────────────
export interface WorkflowStage {
  id: number; stageName: string; description: string;
  sequenceNumber: number; dueInDays: number;
}

export interface WorkflowTemplateResponse {
  id: number; name: string; description: string;
  departmentName: string; active: boolean; stages: WorkflowStage[];
}

export interface OnboardingProgress {
  employeeId: number; employeeName: string; departmentName: string;
  totalTasks: number; completedTasks: number; inProgressTasks: number;
  pendingTasks: number; progressPercentage: number; currentStage: string;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface WorkflowTaskResponse {
  id: number; taskName: string; status: TaskStatus;
  dueDate: string; employeeName: string;
}

export interface OverdueTask {
  taskId: number; taskName: string; employeeName: string;
  dueDate: string; status: TaskStatus;
}

export interface ReadinessResponse {
  employeeId: number; readinessScore: number;
  completedTasks: number; totalTasks: number;
}

// ── Approvals ─────────────────────────────────────────────────────────────────
export type ApprovalType   = 'HR_APPROVAL' | 'MANAGER_APPROVAL' | 'IT_APPROVAL';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalHistory {
  id: number; fromStatus: ApprovalStatus; toStatus: ApprovalStatus;
  actionBy: string; remarks: string; actionAt: string;
}

export interface ApprovalRequestResponse {
  id: number; employeeId: number; employeeName: string;
  approvalType: ApprovalType; status: ApprovalStatus;
  remarks: string; createdAt: string; decidedAt: string | null;
  approvalHistory: ApprovalHistory[];
}

// ── Documents ─────────────────────────────────────────────────────────────────
export type DocumentType       = 'OFFER_LETTER' | 'AADHAR' | 'PAN' | 'PASSPORT' | 'EDUCATION_DOCUMENT';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface EmployeeDocumentResponse {
  id: number; employeeId: number; employeeName: string;
  documentType: DocumentType; fileName: string; contentType: string;
  fileSize: number; verificationStatus: VerificationStatus;
  verificationRemarks: string; uploadedAt: string; verifiedAt: string | null;
}

// ── Timeline ──────────────────────────────────────────────────────────────────
export interface TimelineEvent {
  eventName: string; eventType: string; status: string;
  description: string; occurredAt: string;
}

export interface EmployeeTimeline {
  employeeId: number; employeeName: string; departmentName: string;
  timeline: TimelineEvent[];
}

// ── Escalations ───────────────────────────────────────────────────────────────
export type EscalationType   = 'OVERDUE_ONBOARDING' | 'PENDING_APPROVAL' | 'MISSED_SLA';
export type EscalationStatus = 'OPEN' | 'RESOLVED';

export interface EscalationResponse {
  id: number; type: EscalationType; status: EscalationStatus;
  message: string; employeeName: string; taskName: string; createdAt: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType = 'NEW_TASK_ASSIGNED' | 'OVERDUE_TASK' | 'COMPLETED_ONBOARDING' | 'WELCOME_EMPLOYEE';

export interface NotificationResponse {
  id: number; type: NotificationType; title: string; message: string;
  read: boolean; employeeName: string; taskName: string; createdAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalEmployees: number; employeesOnboarding: number; employeesCompleted: number;
  pendingTasks: number; overdueTasks: number; averageReadinessScore: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface DepartmentCompletion {
  departmentId: number; departmentName: string;
  totalTasks: number; completedTasks: number; completionPercentage: number;
}

export interface OnboardingTrend {
  period: string; employeesStarted: number; employeesCompleted: number;
}

export interface HiringStats {
  totalHires: number; hiresThisWeek: number; hiresThisMonth: number; hiresThisYear: number;
}

export interface CompletionRate {
  totalEmployeesWithTasks: number; completedEmployees: number; completionRate: number;
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface EmployeeReport {
  employeeId: number; employeeName: string; email: string; departmentName: string;
  totalTasks: number; completedTasks: number; pendingTasks: number;
  readinessScore: number; onboardingStatus: string;
}

export interface SlaReport {
  taskId: number; taskName: string; employeeName: string; departmentName: string;
  dueDate: string; status: string; slaMissed: boolean; overdueDays: number;
}

export interface AuditLog { action: string; description: string; timestamp: string; }
