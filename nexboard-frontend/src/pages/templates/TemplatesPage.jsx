import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getTemplates, createTemplate, assignTemplate } from '../../api/templateApi';
import { getDepartments } from '../../api/departmentApi';
import { getEmployees } from '../../api/employeeApi';
import { handleApiError } from '../../utils/errorHandler';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, ChevronDown, ChevronRight, GitBranch } from 'lucide-react';

export default function TemplatesPage() {
  const { auth } = useAuth();
  const canEdit = ['ROLE_ADMIN','ROLE_HR'].includes(auth?.role);

  const { data: templates, loading, refetch } = useFetch(getTemplates);
  const [departments, setDepartments]         = useState([]);
  const [employees, setEmployees]             = useState([]);
  const [expanded, setExpanded]               = useState(null);
  const [showForm, setShowForm]               = useState(false);
  const [form, setForm]                       = useState({ name:'', description:'', departmentId:'', active:true });
  const [saving, setSaving]                   = useState(false);

  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data)).catch(handleApiError);
    getEmployees().then(r => setEmployees(r.data)).catch(handleApiError);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTemplate({ ...form, departmentId: Number(form.departmentId) });
      toast.success('Template created');
      setShowForm(false);
      setForm({ name:'', description:'', departmentId:'', active:true });
      refetch();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  const handleAssign = async (employeeId) => {
    if (!employeeId) return;
    try {
      await assignTemplate(employeeId);
      toast.success('Workflow assigned');
    } catch (err) { handleApiError(err); }
  };

  if (loading) return (
    <div>
      <PageHeader title="Workflow Templates" subtitle="Define onboarding stages by department" />
      <SkeletonLoader variant="stat-cards" count={4} />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Workflow Templates"
        subtitle="Define onboarding stages by department"
        action={canEdit && (
          <button type="button" onClick={() => setShowForm(v => !v)} className="btn-primary">
            <Plus size={16} aria-hidden="true" /> New Template
          </button>
        )}
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pad mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 panel-enter">
          <h3 className="col-span-full text-section-title text-base">New Template</h3>
          <div>
            <label className="block text-caption font-medium mb-1.5">Name</label>
            <input required className="input-field"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-caption font-medium mb-1.5">Department</label>
            <select required className="input-field"
              value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
              <option value="">Select</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="col-span-full">
            <label className="block text-caption font-medium mb-1.5">Description</label>
            <textarea rows={2} className="input-field"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
            <label htmlFor="active" className="text-body-muted">Active</label>
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

      {!(templates ?? []).length ? (
        <div className="card">
          <EmptyState
            title="No templates yet"
            description="Create a workflow template to define onboarding stages for a department."
            icon={<GitBranch size={24} />}
            action={canEdit && (
              <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={16} aria-hidden="true" /> New Template
              </button>
            )}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {(templates ?? []).map(t => (
            <div key={t.id} className="card overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between card-pad hover:bg-slate-50/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-inset"
                aria-expanded={expanded === t.id}
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-3">
                  {expanded === t.id ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                  <div className="text-left">
                    <p className="text-section-title text-base">{t.name}</p>
                    <p className="text-caption">{t.departmentName} · {(t.stages ?? []).length} stages</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold transition-colors duration-150 ${t.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${t.active ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
                  {t.active ? 'Active' : 'Inactive'}
                </span>
              </button>

              {expanded === t.id && (
                <div className="px-6 pb-5 border-t border-slate-100 panel-enter">
                  {t.description && <p className="text-body-muted mt-3 mb-3">{t.description}</p>}
                  <h4 className="text-table-header mb-2 mt-3">Stages</h4>
                  {!(t.stages ?? []).length ? (
                    <p className="text-body-muted">No stages defined for this template.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {[...(t.stages ?? [])].sort((a,b) => a.sequenceNumber - b.sequenceNumber).map(s => (
                        <div key={s.id} className="flex items-center gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-750 text-xs flex items-center justify-center font-medium shrink-0">{s.sequenceNumber}</span>
                          <span className="font-medium text-slate-700">{s.stageName}</span>
                          <span className="text-timestamp">· {s.dueInDays}d</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {['ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'].includes(auth?.role) && (
                    <div className="flex items-center gap-3 mt-2">
                      <label className="text-caption font-medium">Assign to:</label>
                      <select
                        className="input-field py-1.5 text-xs w-auto"
                        defaultValue=""
                        aria-label="Assign template to employee"
                        onChange={e => handleAssign(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">— select employee —</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
