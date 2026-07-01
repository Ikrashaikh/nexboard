import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { runEscalationScan, getAllEscalations, getOpenEscalations, resolveEscalation } from '../../api/escalationApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import toast from 'react-hot-toast';
import { Play, AlertTriangle } from 'lucide-react';

export default function EscalationsPage() {
  const [filter, setFilter] = useState('ALL');
  const [running, setRunning] = useState(false);

  const { data: escalations, loading, refetch } = useFetch(
    filter === 'OPEN' ? getOpenEscalations : getAllEscalations,
    [filter]
  );

  const handleScan = async () => {
    setRunning(true);
    try {
      const r = await runEscalationScan();
      toast.success(`Scan complete — ${r.data.length} escalations generated`);
      refetch();
    } catch (err) { handleApiError(err); }
    finally { setRunning(false); }
  };

  const handleResolve = async (id) => {
    try {
      await resolveEscalation(id);
      toast.success('Escalation resolved');
      refetch();
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <PageHeader
        title="Escalations"
        subtitle="Overdue tasks and SLA breaches requiring attention"
        action={
          <button
            type="button"
            onClick={handleScan}
            disabled={running}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-60 transition-colors duration-150"
          >
            {running ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {running ? 'Scanning…' : 'Run Scan'}
          </button>
        }
      />

      <div className="flex gap-2 mb-4">
        {['ALL','OPEN'].map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
              filter === f ? 'bg-accent-600 text-white font-semibold shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All' : 'Open'}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoader variant="table" rows={6} cols={6} />
      ) : !(escalations ?? []).length ? (
        <div className="card">
          <EmptyState
            title={filter === 'OPEN' ? 'No open escalations' : 'No escalations found'}
            description="Run a scan to detect overdue tasks and SLA breaches across all employees."
            icon={<AlertTriangle size={24} />}
            action={
              <button type="button" onClick={handleScan} disabled={running} className="btn-primary bg-orange-600 hover:bg-orange-700 cursor-pointer">
                <Play size={16} aria-hidden="true" /> Run Scan
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>{['Type','Status','Employee','Message','Created','Action'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(escalations ?? []).map(e => (
                <tr key={e.id} className="transition-colors duration-150 hover:bg-primary-50/50">
                  <td className="px-4 py-3.5"><Badge value={e.type} /></td>
                  <td className="px-4 py-3.5"><Badge value={e.status} /></td>
                  <td className="px-4 py-3.5 text-body">{e.employeeName}</td>
                  <td className="px-4 py-3.5 text-caption max-w-xs truncate">{e.message}</td>
                  <td className="px-4 py-3.5 text-caption">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3.5">
                    {e.status === 'OPEN' && (
                      <button type="button" onClick={() => handleResolve(e.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150">
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
