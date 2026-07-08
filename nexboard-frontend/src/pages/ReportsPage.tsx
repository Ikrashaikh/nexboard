import { useEffect, useState } from 'react';
import { reportService } from '../services/report.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { EmployeeReport, SlaReport } from '../types';
import { useAuth } from '../context/AuthContext';

type Tab = 'employees' | 'departments' | 'sla' | 'readiness' | 'audit';

export default function ReportsPage() {
  const { auth } = useAuth();
  const canAudit = ['ROLE_ADMIN', 'ROLE_HR'].includes(auth?.role ?? '');
  const [tab, setTab] = useState<Tab>('employees');
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData([]);
    const calls: Record<Tab, () => Promise<{ data: unknown[] }>> = {
      employees:   () => reportService.getEmployees() as Promise<{ data: unknown[] }>,
      departments: () => reportService.getDepartments() as Promise<{ data: unknown[] }>,
      sla:         () => reportService.getSla() as Promise<{ data: unknown[] }>,
      readiness:   () => reportService.getReadiness() as Promise<{ data: unknown[] }>,
      audit:       () => reportService.getAudit() as Promise<{ data: unknown[] }>,
    };
    calls[tab]()
      .then(r => setData(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'employees',   label: 'Employees' },
    { key: 'departments', label: 'Departments' },
    { key: 'sla',         label: 'SLA' },
    { key: 'readiness',   label: 'Readiness' },
    ...(canAudit ? [{ key: 'audit' as Tab, label: 'Audit' }] : []),
  ];

  const renderTable = () => {
    if (loading) return <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>;
    if (data.length === 0) return <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">No data</td></tr>;

    if (tab === 'employees') {
      const rows = data as EmployeeReport[];
      return rows.map(r => (
        <tr key={r.employeeId} className="hover:bg-slate-50">
          <td className="px-4 py-3 text-slate-700 font-medium">{r.employeeName}</td>
          <td className="px-4 py-3 text-slate-500 text-xs">{r.email}</td>
          <td className="px-4 py-3 text-slate-600">{r.departmentName}</td>
          <td className="px-4 py-3 text-center">{r.totalTasks}</td>
          <td className="px-4 py-3 text-center text-green-600">{r.completedTasks}</td>
          <td className="px-4 py-3 text-center text-yellow-600">{r.pendingTasks}</td>
          <td className="px-4 py-3 text-center font-medium">{r.readinessScore.toFixed(0)}%</td>
          <td className="px-4 py-3"><Badge value={r.onboardingStatus} /></td>
        </tr>
      ));
    }

    if (tab === 'sla') {
      const rows = data as SlaReport[];
      return rows.map(r => (
        <tr key={r.taskId} className="hover:bg-slate-50">
          <td className="px-4 py-3 text-slate-700 font-medium">{r.taskName}</td>
          <td className="px-4 py-3 text-slate-600">{r.employeeName}</td>
          <td className="px-4 py-3 text-slate-600">{r.departmentName}</td>
          <td className="px-4 py-3 text-slate-500 text-xs">{r.dueDate}</td>
          <td className="px-4 py-3"><Badge value={r.status} /></td>
          <td className="px-4 py-3">
            <span className={`text-xs font-medium ${r.slaMissed ? 'text-red-600' : 'text-green-600'}`}>
              {r.slaMissed ? `Missed (+${r.overdueDays}d)` : 'On time'}
            </span>
          </td>
        </tr>
      ));
    }

    // Generic fallback: render as JSON key-value rows
    return (data as Record<string, unknown>[]).map((row, i) => (
      <tr key={i} className="hover:bg-slate-50">
        {Object.values(row).map((v, j) => (
          <td key={j} className="px-4 py-3 text-slate-700 text-sm">
            {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v ?? '—')}
          </td>
        ))}
      </tr>
    ));
  };

  const headers: Record<Tab, string[]> = {
    employees:   ['Name', 'Email', 'Department', 'Total', 'Done', 'Pending', 'Readiness', 'Status'],
    departments: ['Dept ID', 'Name', 'Employees', 'Total Tasks', 'Completed', 'Pending', 'Completion %'],
    sla:         ['Task', 'Employee', 'Department', 'Due Date', 'Status', 'SLA'],
    readiness:   ['Emp ID', 'Name', 'Department', 'Total', 'Completed', 'Readiness'],
    audit:       ['Action', 'Description', 'Timestamp'],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Reports</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {headers[tab].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {renderTable()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
