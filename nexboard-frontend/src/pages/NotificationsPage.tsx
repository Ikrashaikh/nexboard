import { useEffect, useState } from 'react';
import { notificationService } from '../services/notification.service';
import { employeeService } from '../services/employee.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { NotificationResponse, EmployeeResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { auth, employeeId } = useAuth();
  const isEmployee = auth?.role === 'ROLE_EMPLOYEE';

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(isEmployee ? employeeId : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isEmployee) {
      employeeService.getAll().then(r => setEmployees(r.data)).catch(handleApiError);
      notificationService.getAll()
        .then(r => setNotifications(r.data))
        .catch(handleApiError)
        .finally(() => setLoading(false));
    } else if (isEmployee && employeeId) {
      notificationService.getByEmployee(employeeId)
        .then(r => setNotifications(r.data))
        .catch(handleApiError)
        .finally(() => setLoading(false));
    }
  }, [isEmployee, employeeId]);

  useEffect(() => {
    if (!isEmployee && selectedEmp) {
      setLoading(true);
      notificationService.getByEmployee(selectedEmp)
        .then(r => setNotifications(r.data))
        .catch(handleApiError)
        .finally(() => setLoading(false));
    }
  }, [selectedEmp, isEmployee]);

  const markRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
      toast.success('Marked as read');
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Notifications</h2>

      {!isEmployee && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-4">
          <label className="text-sm font-medium text-slate-600">Filter by employee:</label>
          <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedEmp ?? ''}
            onChange={e => {
              const v = e.target.value;
              if (!v) {
                setSelectedEmp(null);
                setLoading(true);
                notificationService.getAll().then(r => setNotifications(r.data)).catch(handleApiError).finally(() => setLoading(false));
              } else {
                setSelectedEmp(Number(v));
              }
            }}>
            <option value="">All</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p>No notifications</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id}
            className={`bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4 ${n.read ? 'opacity-60' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge value={n.type} />
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />}
              </div>
              <p className="font-medium text-slate-800 text-sm">{n.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{n.message}</p>
              <p className="text-slate-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            {!n.read && (
              <button onClick={() => markRead(n.id)}
                className="text-xs text-indigo-600 hover:underline shrink-0">
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
