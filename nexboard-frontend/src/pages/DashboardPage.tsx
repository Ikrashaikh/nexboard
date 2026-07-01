import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { handleApiError } from '../lib/errorHandler';
import StatCard from '../components/StatCard';
import type { DashboardStats } from '../types';
import { Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(r => setStats(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500 text-sm">Loading dashboard…</div>;
  if (!stats) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={stats.totalEmployees} icon={<Users size={20} />} color="bg-indigo-500" />
        <StatCard label="Onboarding" value={stats.employeesOnboarding} icon={<Clock size={20} />} color="bg-blue-500" />
        <StatCard label="Completed" value={stats.employeesCompleted} icon={<CheckCircle size={20} />} color="bg-green-500" />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} icon={<Activity size={20} />} color="bg-yellow-500" />
        <StatCard label="Overdue Tasks" value={stats.overdueTasks} icon={<AlertTriangle size={20} />} color="bg-red-500" />
        <StatCard label="Avg Readiness" value={`${stats.averageReadinessScore.toFixed(1)}%`} icon={<TrendingUp size={20} />} color="bg-purple-500" />
      </div>
    </div>
  );
}
