import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDepartments, createDepartment } from '../../api/departmentApi';
import { handleApiError } from '../../utils/errorHandler';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import toast from 'react-hot-toast';
import { Plus, Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  const { data: departments, loading, refetch } = useFetch(getDepartments);
  const [name, setName]     = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDepartment({ name });
      toast.success('Department created');
      setName('');
      refetch();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Departments" subtitle="Organize employees by department" />

      <form onSubmit={handleCreate} className="card card-pad mb-6 flex gap-3 panel-enter">
        <input
          required
          placeholder="Department name"
          aria-label="Department name"
          className="input-field flex-1"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" disabled={saving} className="btn-primary shrink-0">
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>

      {loading ? (
        <SkeletonLoader variant="stat-cards" count={6} />
      ) : !(departments ?? []).length ? (
        <div className="card">
          <EmptyState
            title="No departments yet"
            description="Create your first department to organize employees."
            icon={<Building2 size={24} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(departments ?? []).map(d => (
            <div key={d.id} className="card card-pad card-hover flex items-center gap-4">
              <div className="bg-primary-100 text-primary-750 p-3 rounded-xl" aria-hidden="true">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-section-title text-base">{d.name}</p>
                <p className="text-timestamp">ID: {d.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
