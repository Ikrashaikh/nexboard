import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { employeeService } from '../services/employee.service';
import { handleApiError } from '../lib/errorHandler';
import type { WorkflowTemplateResponse, EmployeeResponse, DepartmentResponse } from '../types';
import { departmentService } from '../services/department.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

export default function TemplatesPage() {
  const { auth } = useAuth();
  const canEdit = ['ROLE_ADMIN', 'ROLE_HR'].includes(auth?.role ?? '');

  const [templates, setTemplates] = useState<WorkflowTemplateResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', departmentId: '', active: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get<WorkflowTemplateResponse[]>('/workflow-templates')
      .then(r => setTemplates(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    departmentService.getAll().then(r => setDepartments(r.data)).catch(handleApiError);
    employeeService.getAll().then(r => setEmployees(r.data)).catch(handleApiError);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/workflow-templates', { ...form, departmentId: Number(form.departmentId) });
      toast.success('Template created');
      setShowForm(false);
      setForm({ name: '', description: '', departmentId: '', active: true });
      load();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  const assign = async (_templateId: number, employeeId: number) => {
    try {
      await api.post(`/workflow-templates/assign/${employeeId}`);
      toast.success('Workflow assigned to employee');
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Workflow Templates</h2>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            <Plus size={16} /> New Template
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h3 className="col-span-full text-base font-semibold text-slate-700">New Workflow Template</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={2} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.active}
              onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
            <label htmlFor="active" className="text-sm text-slate-600">Active</label>
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

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : templates.length === 0 ? (
        <p className="text-slate-400 text-sm">No templates found</p>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex items-center gap-3">
                  {expanded === t.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.departmentName} · {t.stages.length} stages</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {t.active ? 'Active' : 'Inactive'}
                </span>
              </button>

              {expanded === t.id && (
                <div className="px-6 pb-5 border-t border-slate-100">
                  {t.description && <p className="text-sm text-slate-600 mt-3 mb-3">{t.description}</p>}

                  {/* Stages */}
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Stages</h4>
                  {t.stages.length === 0 ? (
                    <p className="text-sm text-slate-400">No stages defined</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {t.stages.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map(s => (
                        <div key={s.id} className="flex items-center gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-medium shrink-0">
                            {s.sequenceNumber}
                          </span>
                          <div>
                            <span className="font-medium text-slate-700">{s.stageName}</span>
                            <span className="text-slate-400 ml-2 text-xs">· {s.dueInDays} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign to employee */}
                  {['ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'].includes(auth?.role ?? '') && (
                    <div className="flex items-center gap-3 mt-3">
                      <label className="text-xs font-medium text-slate-600">Assign to employee:</label>
                      <select
                        className="border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        defaultValue=""
                        onChange={e => { if (e.target.value) assign(t.id, Number(e.target.value)); }}>
                        <option value="">— select —</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
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
