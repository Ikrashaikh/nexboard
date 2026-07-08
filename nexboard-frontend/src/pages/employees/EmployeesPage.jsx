import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchEmployees, createEmployee } from '../../api/employeeApi';
import { getDepartments } from '../../api/departmentApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { EMPLOYEE_STATUSES } from '../../utils/enumLabels';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, Search, X, UserCheck } from 'lucide-react';

export default function EmployeesPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const canCreate = ['ROLE_ADMIN','ROLE_HR'].includes(auth?.role);

  const [employees, setEmployees]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ firstName:'', lastName:'', email:'', departmentId:'', status:'ONBOARDING', joiningDate:'' });
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await searchEmployees({ name: search || undefined, page, size: 10 });
      setEmployees(r.data.content);
      setTotalPages(r.data.totalPages);
      setTotalElements(r.data.totalElements);
    } catch (err) { handleApiError(err); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data)).catch(handleApiError);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createEmployee({ ...form, departmentId: Number(form.departmentId) });
      toast.success('Employee created successfully');
      setShowForm(false);
      setForm({ firstName:'', lastName:'', email:'', departmentId:'', status:'ONBOARDING', joiningDate:'' });
      load();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  const openEmployee = (id) => navigate(`/employees/${id}`);

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${totalElements} total records`}
        action={canCreate && (
          <button type="button" onClick={() => setShowForm(v => !v)} className="btn-primary shadow-sm shadow-accent-200 cursor-pointer">
            <Plus size={16} aria-hidden="true" /> Add Employee
          </button>
        )}
      />

      {showForm && (
        <div className="card card-pad mb-5 panel-enter shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-section-title text-base">New Employee</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form"
              className="text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 cursor-pointer">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName' },
              { label: 'Last Name',  key: 'lastName' },
              { label: 'Email',      key: 'email', type: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-caption font-medium mb-1.5">{f.label}</label>
                <input required type={f.type ?? 'text'} className="input-field"
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-caption font-medium mb-1.5">Department</label>
              <select required className="input-field"
                value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-caption font-medium mb-1.5">Status</label>
              <select className="input-field"
                value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {EMPLOYEE_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-caption font-medium mb-1.5">Joining Date</label>
              <input type="date" className="input-field"
                value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} />
            </div>
            <div className="col-span-full flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
                {saving ? 'Creating…' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card px-4 py-3 mb-4 flex items-center gap-3">
        <Search size={16} className="text-slate-400 shrink-0" aria-hidden="true" />
        <input
          className="flex-1 text-body outline-none bg-transparent placeholder:text-slate-400"
          placeholder="Search employees by name…"
          aria-label="Search employees by name"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
        {search && (
          <button type="button" onClick={() => { setSearch(''); setPage(0); }} aria-label="Clear search"
            className="text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 cursor-pointer">
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonLoader variant="table" rows={10} cols={7} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['#','Name','Email','Department','Status','Joined','Manager'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!employees.length ? (
                  <tr><td colSpan={7}>
                    <EmptyState
                      title="No employees found"
                      description={search ? 'Try adjusting your search terms.' : 'Add your first employee to get started.'}
                      icon={<UserCheck size={24} />}
                    />
                  </td></tr>
                ) : employees.map(e => (
                  <tr
                    key={e.id}
                    tabIndex={0}
                    role="link"
                    aria-label={`View ${e.firstName} ${e.lastName}`}
                    onClick={() => openEmployee(e.id)}
                    onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEmployee(e.id); } }}
                    className="row-interactive group"
                  >
                    <td className="px-4 py-3.5 text-timestamp font-mono">{e.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
                          {e.firstName?.[0]}{e.lastName?.[0]}
                        </div>
                        <span className="font-medium text-slate-800 group-hover:text-accent-600 transition-colors duration-150">
                          {e.firstName} {e.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-caption">{e.email}</td>
                    <td className="px-4 py-3.5 text-body-muted">{e.departmentName ?? '—'}</td>
                    <td className="px-4 py-3.5"><Badge value={e.status} /></td>
                    <td className="px-4 py-3.5 text-caption">{e.joiningDate ?? '—'}</td>
                    <td className="px-4 py-3.5 text-caption">{e.managerName ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
