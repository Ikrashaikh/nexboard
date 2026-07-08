import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import {
  getEmployeeReport, getDepartmentReport, getSlaReport, getReadinessReport, getAuditReport,
} from '../../api/reportApi';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { ClipboardList } from 'lucide-react';

const TABS = {
  employees:   { label: 'Employees',   fn: getEmployeeReport },
  departments: { label: 'Departments', fn: getDepartmentReport },
  sla:         { label: 'SLA',         fn: getSlaReport },
  readiness:   { label: 'Readiness',   fn: getReadinessReport },
};
const ADMIN_HR_TABS = {
  ...TABS,
  audit: { label: 'Audit', fn: getAuditReport },
};

const HEADERS = {
  employees:   ['Name','Email','Department','Total','Done','Pending','Readiness','Status'],
  departments: ['Dept','Name','Employees','Total Tasks','Completed','Pending','Completion %'],
  sla:         ['Task','Employee','Department','Due Date','Status','SLA'],
  readiness:   ['Emp ID','Name','Department','Total','Completed','Readiness'],
  audit:       ['Action','Description','Timestamp'],
};

const EMPTY_COPY = {
  employees:   { title: 'No employee reports', description: 'Employee onboarding reports will appear here once data is available.' },
  departments: { title: 'No department reports', description: 'Department-level summaries will appear here once tasks are assigned.' },
  sla:         { title: 'No SLA records', description: 'SLA tracking data will show up when tasks have due dates.' },
  readiness:   { title: 'No readiness data', description: 'Readiness scores are calculated once employees have assigned tasks.' },
  audit:       { title: 'No audit entries', description: 'System audit events will be logged here as actions occur.' },
};

function Row({ tab, row }) {
  if (tab === 'employees') return (
    <tr className="transition-colors duration-150 hover:bg-primary-50/50">
      <td className="px-4 py-3.5 font-medium text-slate-800">{row.employeeName}</td>
      <td className="px-4 py-3.5 text-caption">{row.email}</td>
      <td className="px-4 py-3.5 text-body-muted">{row.departmentName}</td>
      <td className="px-4 py-3.5 text-center">{row.totalTasks}</td>
      <td className="px-4 py-3.5 text-center text-green-600">{row.completedTasks}</td>
      <td className="px-4 py-3.5 text-center text-yellow-600">{row.pendingTasks}</td>
      <td className="px-4 py-3.5 text-center font-medium">{(row.readinessScore ?? 0).toFixed(0)}%</td>
      <td className="px-4 py-3.5"><Badge value={row.onboardingStatus} /></td>
    </tr>
  );
  if (tab === 'sla') return (
    <tr className="transition-colors duration-150 hover:bg-primary-50/50">
      <td className="px-4 py-3.5 font-medium text-slate-800">{row.taskName}</td>
      <td className="px-4 py-3.5 text-body-muted">{row.employeeName}</td>
      <td className="px-4 py-3.5 text-body-muted">{row.departmentName}</td>
      <td className="px-4 py-3.5 text-caption">{row.dueDate}</td>
      <td className="px-4 py-3.5"><Badge value={row.status} /></td>
      <td className="px-4 py-3.5">
        <span className={`text-xs font-medium ${row.slaMissed ? 'text-red-600' : 'text-green-600'}`}>
          {row.slaMissed ? `Missed (+${row.overdueDays}d)` : 'On time'}
        </span>
      </td>
    </tr>
  );
  return (
    <tr className="transition-colors duration-150 hover:bg-primary-50/50">
      {Object.values(row).map((v, i) => (
        <td key={i} className="px-4 py-3.5 text-body">
          {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v ?? '—')}
        </td>
      ))}
    </tr>
  );
}

export default function ReportsPage() {
  const { auth } = useAuth();
  const canAudit = ['ROLE_ADMIN','ROLE_HR'].includes(auth?.role);
  const tabs = canAudit ? ADMIN_HR_TABS : TABS;

  const [tab, setTab] = useState('employees');
  const { data, loading } = useFetch(tabs[tab].fn, [tab]);
  const empty = EMPTY_COPY[tab] ?? EMPTY_COPY.employees;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Export-ready onboarding summaries" />

      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(tabs).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
              tab === key ? 'bg-accent-600 text-white font-semibold shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoader variant="table" rows={8} cols={(HEADERS[tab] ?? []).length || 5} />
      ) : !(data ?? []).length ? (
        <div className="card">
          <EmptyState
            title={empty.title}
            description={empty.description}
            icon={<ClipboardList size={24} />}
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>{(HEADERS[tab] ?? []).map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(data ?? []).map((row, i) => <Row key={i} tab={tab} row={row} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
