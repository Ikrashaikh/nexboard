import { useState, useEffect, useCallback } from 'react';
import { getAllNotifications, getNotificationsByEmployee, markNotificationRead } from '../../api/notificationApi';
import { getEmployees } from '../../api/employeeApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { auth, selectedEmployeeId } = useAuth();
  const isEmployee = auth?.role === 'ROLE_EMPLOYEE';

  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees]         = useState([]);
  const [filterEmp, setFilterEmp]         = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!isEmployee) getEmployees().then(r => setEmployees(r.data)).catch(handleApiError);
  }, [isEmployee]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let r;
      if (isEmployee && selectedEmployeeId) {
        r = await getNotificationsByEmployee(selectedEmployeeId);
      } else if (filterEmp) {
        r = await getNotificationsByEmployee(filterEmp);
      } else {
        r = await getAllNotifications();
      }
      setNotifications(r.data);
    } catch (err) { handleApiError(err); }
    finally { setLoading(false); }
  }, [isEmployee, selectedEmployeeId, filterEmp]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
      toast.success('Marked as read');
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Alerts for tasks, deadlines, and onboarding milestones" />

      {!isEmployee && (
        <div className="card card-pad mb-4 flex items-center gap-4">
          <label htmlFor="notif-filter" className="text-body-muted font-medium shrink-0">Filter by employee:</label>
          <select
            id="notif-filter"
            className="input-field w-auto sm:w-64"
            value={filterEmp ?? ''}
            onChange={e => setFilterEmp(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <SkeletonLoader variant="stat-cards" count={3} />
      ) : !notifications.length ? (
        <div className="card">
          <EmptyState
            title="No notifications"
            description="You're all caught up — new alerts will appear here when tasks are assigned or deadlines approach."
            icon={<Bell size={24} />}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card card-pad flex items-start justify-between gap-4 transition-opacity duration-200 ${n.read ? 'opacity-60' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge value={n.type} />
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-accent-600 shrink-0" aria-label="Unread" />
                  )}
                </div>
                <p className="font-medium text-slate-800 text-sm">{n.title}</p>
                <p className="text-caption mt-0.5 truncate">{n.message}</p>
                <p className="text-timestamp mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-accent-600 hover:text-accent-700 font-semibold hover:underline shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-650 rounded px-1 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
