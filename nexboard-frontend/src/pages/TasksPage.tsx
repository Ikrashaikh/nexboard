import { useEffect, useState } from 'react';
import { taskService } from '../services/task.service';
import { employeeService } from '../services/employee.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { WorkflowTaskResponse, EmployeeResponse, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const { auth, employeeId } = useAuth();
  const isEmployee = auth?.role === 'EMPLOYEE';
  const canCreate = ['ADMIN','HR','MANAGER'].includes(auth?.role ?? '');

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(isEmployee ? employeeId : null);
  const [tasks, setTasks] = useState<WorkflowTaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ taskName: '', dueDate: '', employeeId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEmployee) {
      employeeService.getAll().then(r => setEmployees(r.data)).catch(handleApiError);
    }
  }, [isEmployee]);

  useEffect(() => {
    if (selectedEmp) {
      setLoading(true);
      taskService.getByEmployee(selectedEmp)
        .then(r => setTasks(r.data))
        .catch(handleApiError)
        .finally(() => setLoading(false));
    }
  }, [selectedEmp]);

  const updateStatus = async (taskId: number, status: TaskStatus) => {
    try {
      await taskService.updateStatus(taskId, status);
      setTasks(t => t.map(tk => tk.id === taskId ? { ...tk, status } : tk));
      toast.success('Status updated');
    } catch (err) { handleApiError(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await taskService.create({ ...form, employeeId: Number(form.employeeId) });
      toast.success('Task created');
      setShowForm(false);
      setForm({ taskName: '', dueDate: '', employeeId: '' });
      if (selectedEmp) {
        taskService.getByEmployee(selectedEmp).then(r => setTasks(r.data));
      }
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Onboarding Tasks</h2>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Task Name</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.taskName} onChange={e => setForm(p => ({ ...p, taskName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
            <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Employee</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="col-span-full flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {!isEmployee && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">Select Employee</label>
          <select className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedEmp ?? ''} onChange={e => setSelectedEmp(Number(e.target.value))}>
            <option value="">— pick an employee —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {['Task','Employee','Due Date','Status','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!selectedEmp ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Select an employee to view tasks</td></tr>
            ) : loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No tasks found</td></tr>
            ) : tasks.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{t.taskName}</td>
                <td className="px-4 py-3 text-slate-600">{t.employeeName}</td>
                <td className="px-4 py-3 text-slate-600">{t.dueDate}</td>
                <td className="px-4 py-3"><Badge value={t.status} /></td>
                <td className="px-4 py-3">
                  <select className="border rounded px-2 py-1 text-xs focus:outline-none"
                    value={t.status}
                    onChange={e => updateStatus(t.id, e.target.value as TaskStatus)}>
                    {['PENDING','IN_PROGRESS','COMPLETED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
