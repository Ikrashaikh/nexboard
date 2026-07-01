import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats } from '../../api/dashboardApi';
import StatCard from '../../components/ui/StatCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { Users, Clock, CheckCircle, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'totalEmployees',        label: 'Total Employees',  icon: <Users size={20} />,         colorClass: 'bg-primary-700',  subtitle: 'All active records' },
  { key: 'employeesOnboarding',   label: 'Onboarding',       icon: <Clock size={20} />,         colorClass: 'bg-blue-500',    subtitle: 'Currently in progress' },
  { key: 'employeesCompleted',    label: 'Completed',        icon: <CheckCircle size={20} />,   colorClass: 'bg-emerald-500', subtitle: 'Fully onboarded' },
  { key: 'pendingTasks',          label: 'Pending Tasks',    icon: <Activity size={20} />,      colorClass: 'bg-amber-500',   subtitle: 'Awaiting action' },
  { key: 'overdueTasks',          label: 'Overdue Tasks',    icon: <AlertTriangle size={20} />, colorClass: 'bg-rose-500',    subtitle: 'Past due date' },
];

export default function DashboardPage() {
  const { data: stats, loading } = useFetch(getDashboardStats);

  if (loading) return <SkeletonLoader variant="stat-cards" count={5} />;
  if (!stats) return null;

  const readiness = stats.averageReadinessScore ?? 0;

  return (
    <div className="page-stack">
      {/* Greeting banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-950) 100%)' }}>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="w-48 h-48 rounded-full bg-white absolute -top-10 -right-10" />
          <div className="w-32 h-32 rounded-full bg-white absolute bottom-0 right-20" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-200 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-2xl font-bold">Welcome to NexBoard 👋</h2>
          <p className="text-primary-200 text-sm mt-1">Here's what's happening with your onboarding today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS_CONFIG.map(s => (
          <StatCard key={s.key} label={s.label} value={stats[s.key] ?? 0}
            icon={s.icon} colorClass={s.colorClass} subtitle={s.subtitle} />
        ))}
      </div>

      {/* Readiness score + quick summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Readiness */}
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section-title">Avg Readiness Score</h3>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-4xl font-bold text-slate-800">{readiness.toFixed(1)}<span className="text-xl text-slate-400">%</span></p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${readiness}%`,
                background: readiness >= 70 ? '#10b981' : readiness >= 40 ? '#f59e0b' : '#ef4444'
              }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {readiness >= 70 ? '🟢 Good' : readiness >= 40 ? '🟡 Moderate' : '🔴 Needs attention'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="lg:col-span-2 card card-pad">
          <h3 className="text-section-title mb-4">Onboarding Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Onboarding in progress', value: stats.employeesOnboarding, total: stats.totalEmployees, color: 'bg-blue-500' },
              { label: 'Successfully completed',  value: stats.employeesCompleted,  total: stats.totalEmployees, color: 'bg-emerald-500' },
              { label: 'Tasks completed',         value: (stats.totalEmployees * 10) - stats.pendingTasks, total: stats.totalEmployees * 10, color: 'bg-accent-650' },
            ].map((item, i) => {
              const pct = item.total > 0 ? Math.min(100, Math.round((item.value / item.total) * 100)) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value} / {item.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`${item.color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
