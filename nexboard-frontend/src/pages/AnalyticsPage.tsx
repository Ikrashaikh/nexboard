import { useEffect, useState } from 'react';
import { analyticsService } from '../services/dashboard.service';
import { handleApiError } from '../lib/errorHandler';
import type { DepartmentCompletion, OnboardingTrend, HiringStats, CompletionRate } from '../types';
import StatCard from '../components/StatCard';
import { Users, TrendingUp, BarChart2, CheckCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [deptCompletion, setDeptCompletion] = useState<DepartmentCompletion[]>([]);
  const [trend, setTrend] = useState<OnboardingTrend[]>([]);
  const [hiring, setHiring] = useState<HiringStats | null>(null);
  const [completion, setCompletion] = useState<CompletionRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendMode, setTrendMode] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    Promise.all([
      analyticsService.getDepartmentCompletion(),
      analyticsService.getHiring(),
      analyticsService.getCompletionRate(),
    ]).then(([d, h, c]) => {
      setDeptCompletion(d.data);
      setHiring(h.data);
      setCompletion(c.data);
    }).catch(handleApiError).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const call = trendMode === 'weekly'
      ? analyticsService.getTrendWeekly()
      : analyticsService.getTrendMonthly();
    call.then(r => setTrend(r.data)).catch(handleApiError);
  }, [trendMode]);

  if (loading) return <div className="text-slate-500 text-sm">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Workforce Analytics</h2>

      {/* Hiring Stats */}
      {hiring && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Hires" value={hiring.totalHires} icon={<Users size={18} />} color="bg-indigo-500" />
          <StatCard label="This Week" value={hiring.hiresThisWeek} icon={<TrendingUp size={18} />} color="bg-blue-500" />
          <StatCard label="This Month" value={hiring.hiresThisMonth} icon={<BarChart2 size={18} />} color="bg-purple-500" />
          <StatCard label="This Year" value={hiring.hiresThisYear} icon={<CheckCircle size={18} />} color="bg-green-500" />
        </div>
      )}

      {/* Completion Rate */}
      {completion && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Overall Completion Rate</h3>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-indigo-600">{completion.completionRate.toFixed(1)}%</div>
            <div className="text-sm text-slate-500">
              <p>{completion.completedEmployees} of {completion.totalEmployeesWithTasks} employees completed onboarding</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
            <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${completion.completionRate}%` }} />
          </div>
        </div>
      )}

      {/* Department Completion */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Completion by Department</h3>
        {deptCompletion.length === 0 ? (
          <p className="text-slate-400 text-sm">No data available</p>
        ) : (
          <div className="space-y-4">
            {deptCompletion.map(d => (
              <div key={d.departmentId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{d.departmentName}</span>
                  <span className="text-slate-500">{d.completedTasks}/{d.totalTasks} tasks · {d.completionPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${d.completionPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Onboarding Trend</h3>
          <div className="flex gap-2">
            {(['weekly', 'monthly'] as const).map(m => (
              <button key={m} onClick={() => setTrendMode(m)}
                className={`px-3 py-1 rounded-lg text-xs transition ${trendMode === m ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {trend.length === 0 ? (
          <p className="text-slate-400 text-sm">No trend data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase">
                <tr>
                  <th className="text-left py-2 pr-4">Period</th>
                  <th className="text-left py-2 pr-4">Started</th>
                  <th className="text-left py-2">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trend.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 pr-4 text-slate-700 font-medium">{t.period}</td>
                    <td className="py-2 pr-4 text-blue-600">{t.employeesStarted}</td>
                    <td className="py-2 text-green-600">{t.employeesCompleted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
