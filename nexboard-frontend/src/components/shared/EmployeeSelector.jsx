import { UserCheck } from 'lucide-react';

export default function EmployeeSelector({ value, onChange, employees, label = 'Select Employee' }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</label>
      <div className="relative">
        <UserCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select
          className="w-full sm:w-96 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none appearance-none cursor-pointer"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">— choose an employee —</option>
          {(employees ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} {e.departmentName ? `· ${e.departmentName}` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
