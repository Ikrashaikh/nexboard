import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import AuthLayout              from './layouts/AuthLayout';
import AppLayout               from './layouts/AppLayout';
import ProtectedRoute          from './routes/ProtectedRoute';
import RoleRoute               from './routes/RoleRoute';

import LoginPage               from './pages/auth/LoginPage';
import EmployeeProfilePage     from './pages/auth/EmployeeProfilePage';
import DashboardPage           from './pages/dashboard/DashboardPage';
import UsersPage               from './pages/users/UsersPage';
import DepartmentsPage         from './pages/departments/DepartmentsPage';
import EmployeesPage           from './pages/employees/EmployeesPage';
import EmployeeDetailPage      from './pages/employees/EmployeeDetailPage';
import TemplatesPage           from './pages/templates/TemplatesPage';
import TasksPage               from './pages/tasks/TasksPage';
import ApprovalsPage           from './pages/approvals/ApprovalsPage';
import DocumentsPage           from './pages/documents/DocumentsPage';
import TimelinesPage           from './pages/timelines/TimelinesPage';
import NotificationsPage       from './pages/notifications/NotificationsPage';
import EscalationsPage         from './pages/escalations/EscalationsPage';
import AnalyticsPage           from './pages/analytics/AnalyticsPage';
import ReportsPage             from './pages/reports/ReportsPage';
import AuditLogsPage           from './pages/audit/AuditLogsPage';

function HomeRedirect() {
  const { auth } = useAuth();
  return <Navigate to={auth?.role === 'EMPLOYEE' ? '/tasks' : '/dashboard'} replace />;
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-300 mb-4">403</p>
        <p className="text-slate-500">You don&apos;t have permission to view this page.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* EMPLOYEE profile selection — protected but outside AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/employee-profile" element={<EmployeeProfilePage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />

          <Route path="/dashboard" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><DashboardPage /></RoleRoute>
          } />
          <Route path="/users" element={
            <RoleRoute allowedRoles={['ADMIN']}><UsersPage /></RoleRoute>
          } />
          <Route path="/departments" element={
            <RoleRoute allowedRoles={['ADMIN','HR']}><DepartmentsPage /></RoleRoute>
          } />
          <Route path="/employees" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><EmployeesPage /></RoleRoute>
          } />
          <Route path="/employees/:id" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><EmployeeDetailPage /></RoleRoute>
          } />
          <Route path="/templates" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><TemplatesPage /></RoleRoute>
          } />
          <Route path="/tasks" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER','EMPLOYEE']}><TasksPage /></RoleRoute>
          } />
          <Route path="/approvals" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER','EMPLOYEE']}><ApprovalsPage /></RoleRoute>
          } />
          <Route path="/documents" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER','EMPLOYEE']}><DocumentsPage /></RoleRoute>
          } />
          <Route path="/timelines" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER','EMPLOYEE']}><TimelinesPage /></RoleRoute>
          } />
          <Route path="/notifications" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER','EMPLOYEE']}><NotificationsPage /></RoleRoute>
          } />
          <Route path="/escalations" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><EscalationsPage /></RoleRoute>
          } />
          <Route path="/analytics" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><AnalyticsPage /></RoleRoute>
          } />
          <Route path="/reports" element={
            <RoleRoute allowedRoles={['ADMIN','HR','MANAGER']}><ReportsPage /></RoleRoute>
          } />
          <Route path="/audit-logs" element={
            <RoleRoute allowedRoles={['ADMIN','HR']}><AuditLogsPage /></RoleRoute>
          } />
          <Route path="/403" element={<AccessDenied />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
