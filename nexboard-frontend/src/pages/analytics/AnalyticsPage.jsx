import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import {
  getDepartmentCompletion, getHiringStats, getCompletionRate,
  getOnboardingTrendWeekly, getOnboardingTrendMonthly,
} from '../../api/analyticsApi';
import StatCard from '../../components/ui/StatCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { Users, TrendingUp, BarChart2, CheckCircle, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const [trendMode, setTrendMode] = useState('weekly');

  const { data: deptCompletion, loading: l1 } = useFetch(getDepartmentCompletion);
  const { data: hiring }                       = useFetch(getHiringStats);
  const { data: completion }                   = useFetch(getCompletionRate);
  const { data: trend, loading: trendLoading } = useFetch(
    trendMode === 'weekly' ? getOnboardingTrendWeekly : getOnboardingTrendMonthly,
    [trendMode]
  );

  if (l1) return (
    <div>
      <PageHeader title="Analytics" subtitle="Onboarding metrics and trends" />
      <SkeletonLoader variant="analytics" />
    </div>
  );

  return (
    <div className="page-stack">
      <PageHeader title="Analytics" subtitle="Onboarding metrics and trends" />

      {hiring && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Hires"    value={hiring.totalHires}       icon={<Users size={18} />}       colorClass="bg-primary-700" />
          <StatCard label="This Week"      value={hiring.hiresThisWeek}    icon={<TrendingUp size={18} />}  colorClass="bg-blue-500" />
          <StatCard label="This Month"     value={hiring.hiresThisMonth}   icon={<BarChart2 size={18} />}   colorClass="bg-purple-500" />
          <StatCard label="This Year"      value={hiring.hiresThisYear}    icon={<CheckCircle size={18} />} colorClass="bg-green-500" />
        </div>
      )}

      {completion && (
        <div className="card card-pad">
          <h3 className="text-section-title mb-4">Overall Completion Rate</h3>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary-750">{(completion.completionRate ?? 0).toFixed(1)}%</div>
            <p className="text-body-muted">{completion.completedEmployees} of {completion.totalEmployeesWithTasks} employees completed</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
            <div className="bg-accent-650 h-3 rounded-full transition-all duration-200" style={{ width: `${completion.completionRate ?? 0}%` }} />
          </div>
        </div>
      )}

      <div className="card card-pad">
        <h3 className="text-section-title mb-4">Completion by Department</h3>
        {!(deptCompletion ?? []).length ? (
          <EmptyState
            title="No department data"
            description="Completion metrics will appear once departments have assigned tasks."
            icon={<BarChart3 size={24} />}
          />
        ) : (
          <div className="space-y-4">
            {(deptCompletion ?? []).map(d => (
              <div key={d.departmentId}>
                <div className="flex justify-between text-body mb-1">
                  <span className="font-medium text-slate-700">{d.departmentName}</span>
                  <span className="text-caption">{d.completedTasks}/{d.totalTasks} · {(d.completionPercentage ?? 0).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full transition-all duration-200" style={{ width: `${d.completionPercentage ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card card-pad">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-section-title">Onboarding Trend</h3>
          <div className="flex gap-2">
            {['weekly','monthly'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setTrendMode(m)}
                className={`px-3 py-1 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                  trendMode === m ? 'bg-accent-600 text-white font-semibold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {trendLoading ? (
          <Spinner size="sm" />
        ) : !(trend ?? []).length ? (
          <EmptyState
            title="No trend data"
            description={`No onboarding activity recorded for this ${trendMode} period.`}
            icon={<TrendingUp size={24} />}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-table-header">Period</th>
                <th className="text-left py-2 pr-4 text-table-header">Started</th>
                <th className="text-left py-2 text-table-header">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(trend ?? []).map((t, i) => (
                <tr key={i} className="transition-colors duration-150 hover:bg-primary-50/50">
                  <td className="py-2 pr-4 text-body font-medium">{t.period}</td>
                  <td className="py-2 pr-4 text-blue-600">{t.employeesStarted}</td>
                  <td className="py-2 text-green-600">{t.employeesCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
