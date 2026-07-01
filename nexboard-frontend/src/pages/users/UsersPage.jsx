import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getUsers, createUser } from '../../api/userApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { ROLES } from '../../utils/enumLabels';
import toast from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';

export default function UsersPage() {
  const { data: users, loading, refetch } = useFetch(getUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ username: '', password: '', role: 'ADMIN' });
  const [saving, setSaving]     = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser(form);
      toast.success('User created');
      setForm({ username: '', password: '', role: 'ADMIN' });
      setShowForm(false);
      refetch();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage system login accounts"
        action={
          <button type="button" onClick={() => setShowForm(v => !v)} className="btn-primary">
            <Plus size={16} aria-hidden="true" /> Add User
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card card-pad mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 panel-enter">
          {[
            { label: 'Username', key: 'username', type: 'text' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-caption font-medium mb-1.5">{f.label}</label>
              <input required type={f.type} className="input-field"
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-caption font-medium mb-1.5">Role</label>
            <select required className="input-field"
              value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
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

      {loading ? (
        <SkeletonLoader variant="table" rows={5} cols={3} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>{['ID','Username','Role'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!users?.length ? (
                <tr><td colSpan={3}>
                  <EmptyState
                    title="No users found"
                    description="Create a user account to grant access to NexBoard."
                    icon={<Users size={24} />}
                  />
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="transition-colors duration-150 hover:bg-primary-50/50">
                  <td className="px-4 py-3.5 text-timestamp">{u.id}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{u.username}</td>
                  <td className="px-4 py-3.5"><Badge value={u.role} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
