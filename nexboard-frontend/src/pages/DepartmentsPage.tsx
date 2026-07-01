import { useEffect, useState } from 'react';
import { departmentService } from '../services/department.service';
import { handleApiError } from '../lib/errorHandler';
import type { DepartmentResponse } from '../types';
import toast from 'react-hot-toast';
import { Plus, Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    departmentService.getAll()
      .then(r => setDepartments(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await departmentService.create({ name });
      toast.success('Department created');
      setName('');
      load();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Departments</h2>
      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-5 mb-6 flex gap-3">
        <input required placeholder="Department name"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={name} onChange={e => setName(e.target.value)} />
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60">
          <Plus size={16} /> {saving ? 'Saving…' : 'Add'}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-slate-400 text-sm">Loading…</p>
          : departments.map(d => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg"><Building2 size={20} /></div>
              <div>
                <p className="font-semibold text-slate-800">{d.name}</p>
                <p className="text-xs text-slate-400">ID: {d.id}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
