import { useState, useEffect, useCallback } from 'react';
import { getTasksByEmployee, updateTaskStatus, createTask } from '../../api/taskApi';
import { getEmployees } from '../../api/employeeApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import EmployeeSelector from '../../components/shared/EmployeeSelector';
import { TASK_STATUSES } from '../../utils/enumLabels';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, CheckSquare, UserSearch } from 'lucide-react';

export default function TasksPage() {
  const { auth, selectedEmployeeId } = useAuth();
  const isEmployee = auth?.role === 'ROLE_EMPLOYEE';
  const canCreate  = ['ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'].includes(auth?.role);

  const [employees, setEmployees]   = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(isEmployee ? selectedEmployeeId : null);
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ taskName:'', dueDate:'', employeeId:'' });
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (!isEmployee) getEmployees().then(r => setEmployees(r.data)).catch(handleApiError);
  }, [isEmployee]);

  const loadTasks = useCallback(async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      const r = await getTasksByEmployee(selectedEmp);
      setTasks(r.data);
    } catch (err) { handleApiError(err); }
    finally { setLoading(false); }
  }, [selectedEmp]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status } : t));
      toast.success('Status updated');
    } catch (err) { handleApiError(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTask({ ...form, employeeId: Number(form.employeeId) });
      toast.success('Task created');
      setShowForm(false);
      setForm({ taskName:'', dueDate:'', employeeId:'' });
      loadTasks();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="Onboarding Tasks"
        subtitle="Track and update employee onboarding tasks"
        action={canCreate && (
          <button type="button" onClick={() => setShowForm(v => !v)} className="btn-primary">
            <Plus size={16} aria-hidden="true" /> Add Task
          </button>
        )}
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pad mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 panel-enter">
          <div>
            <label className="block text-caption font-medium mb-1.5">Task Name</label>
            <input required className="input-field"
              value={form.taskName} onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-caption font-medium mb-1.5">Due Date</label>
            <input required type="date" className="input-field"
              value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-caption font-medium mb-1.5">Employee</label>
            <select required className="input-field"
              value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
              <option value="">Select</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="col-span-full flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {!isEmployee && (
        <EmployeeSelector value={selectedEmp} onChange={setSelectedEmp} employees={employees} />
      )}

      {!selectedEmp ? (
        <div className="card">
          <EmptyState
            title="Select an employee"
            description="Choose an employee above to view and manage their onboarding tasks."
            icon={<UserSearch size={24} />}
          />
        </div>
      ) : loading ? (
        <SkeletonLoader variant="table" rows={6} cols={5} />
      ) : !tasks.length ? (
        <div className="card">
          <EmptyState
            title="No tasks yet"
            description="This employee has no onboarding tasks assigned. Create one to get started."
            icon={<CheckSquare size={24} />}
            action={canCreate && (
              <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={16} aria-hidden="true" /> Add Task
              </button>
            )}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>{['Task','Employee','Due Date','Status','Update'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map(t => (
                <tr key={t.id} className="transition-colors duration-150 hover:bg-primary-50/50">
                  <td className="px-4 py-3.5 font-medium text-slate-800">{t.taskName}</td>
                  <td className="px-4 py-3.5 text-body-muted">{t.employeeName}</td>
                  <td className="px-4 py-3.5 text-caption">{t.dueDate}</td>
                  <td className="px-4 py-3.5"><Badge value={t.status} /></td>
                  <td className="px-4 py-3.5">
                    <select
                      value={t.status}
                      onChange={e => handleStatusChange(t.id, e.target.value)}
                      aria-label={`Update status for ${t.taskName}`}
                      className="input-field py-1.5 px-2 text-xs w-auto"
                    >
                      {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
