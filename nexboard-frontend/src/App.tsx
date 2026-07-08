import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import EmployeePicker from './components/EmployeePicker';
import Layout from './components/Layout';

import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import EmployeesPage      from './pages/EmployeesPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import DepartmentsPage    from './pages/DepartmentsPage';
import UsersPage          from './pages/UsersPage';
import TemplatesPage      from './pages/TemplatesPage';
import TasksPage          from './pages/TasksPage';
import ApprovalsPage      from './pages/ApprovalsPage';
import DocumentsPage      from './pages/DocumentsPage';
import TimelinesPage      from './pages/TimelinesPage';
import NotificationsPage  from './pages/NotificationsPage';
import EscalationsPage    from './pages/EscalationsPage';
import AnalyticsPage      from './pages/AnalyticsPage';
import ReportsPage        from './pages/ReportsPage';
import AuditLogsPage      from './pages/AuditLogsPage';

// Redirect unauthenticated users to login
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// EMPLOYEE role must pick their employee profile before accessing the app
function RequireEmployeeProfile({ children }: { children: React.ReactNode }) {
  const { auth, employeeId } = useAuth();
  if (auth?.role === 'ROLE_EMPLOYEE' && !employeeId) return <EmployeePicker />;
  return <>{children}</>;
}

function AppRoutes() {
  const { auth } = useAuth();
  const role = auth?.role;

  // Default landing page by role
  const home = role === 'ROLE_EMPLOYEE' ? '/tasks' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <RequireAuth>
          <RequireEmployeeProfile>
            <Layout />
          </RequireEmployeeProfile>
        </RequireAuth>
      }>
        <Route index element={<Navigate to={home} replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="employees"     element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="departments"   element={<DepartmentsPage />} />
        <Route path="users"         element={<UsersPage />} />
        <Route path="templates"     element={<TemplatesPage />} />
        <Route path="tasks"         element={<TasksPage />} />
        <Route path="approvals"     element={<ApprovalsPage />} />
        <Route path="documents"     element={<DocumentsPage />} />
        <Route path="timelines"     element={<TimelinesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="escalations"   element={<EscalationsPage />} />
        <Route path="analytics"     element={<AnalyticsPage />} />
        <Route path="reports"       element={<ReportsPage />} />
        <Route path="audit-logs"    element={<AuditLogsPage />} />
        <Route path="*"             element={<Navigate to={home} replace />} />
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
