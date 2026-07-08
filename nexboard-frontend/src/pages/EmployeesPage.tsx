import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employee.service';
import { departmentService } from '../services/department.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { EmployeeResponse, DepartmentResponse, EmployeeRequest, EmployeeStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EmployeesPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const canCreate = auth?.role === 'ROLE_ADMIN' || auth?.role === 'ROLE_HR';

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Search state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [form, setForm] = useState<Partial<EmployeeRequest>>({});
  const [saving, setSaving] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const r = await employeeService.search({ name: search || undefined, page, size: 10 });
      setEmployees(r.data.content);
      setTotalPages(r.data.totalPages);
    } catch (err) { handleApiError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEmployees(); }, [page, search]);

  useEffect(() => {
    departmentService.getAll().then(r => setDepartments(r.data)).catch(handleApiError);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await employeeService.create(form as EmployeeRequest);
      toast.success('Employee created');
      setShowForm(false);
      setForm({});
      loadEmployees();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h3 className="col-span-full text-base font-semibold text-slate-700">New Employee</h3>
          {[
            { label: 'First Name', key: 'firstName' },
            { label: 'Last Name', key: 'lastName' },
            { label: 'Email', key: 'email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={(form as Record<string, string>)[f.key] ?? ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.departmentId ?? ''}
              onChange={e => setForm(p => ({ ...p, departmentId: Number(e.target.value) }))}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.status ?? 'ONBOARDING'}
              onChange={e => setForm(p => ({ ...p, status: e.target.value as EmployeeStatus }))}>
              {['ONBOARDING','ACTIVE','INACTIVE','TERMINATED'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Joining Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.joiningDate ?? ''}
              onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} />
          </div>
          <div className="col-span-full flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-3 items-center">
        <Search size={16} className="text-slate-400" />
        <input className="flex-1 text-sm outline-none" placeholder="Search by name…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {['ID','Name','Email','Department','Status','Joining Date','Manager'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No employees found</td></tr>
            ) : employees.map(e => (
              <tr key={e.id} onClick={() => navigate(`/employees/${e.id}`)}
                className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 text-slate-500">{e.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{e.firstName} {e.lastName}</td>
                <td className="px-4 py-3 text-slate-600">{e.email}</td>
                <td className="px-4 py-3 text-slate-600">{e.departmentName}</td>
                <td className="px-4 py-3"><Badge value={e.status} /></td>
                <td className="px-4 py-3 text-slate-600">{e.joiningDate}</td>
                <td className="px-4 py-3 text-slate-600">{e.managerName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-slate-600">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
