import { useFetch } from '../../hooks/useFetch';
import { getAuditLogs } from '../../api/reportApi';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { ClipboardList } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormat';

export default function AuditLogsPage() {
  const { data: logs, loading } = useFetch(getAuditLogs);

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System activity and change history" />

      {loading ? (
        <SkeletonLoader variant="table" rows={8} cols={3} />
      ) : !(logs ?? []).length ? (
        <div className="card">
          <EmptyState
            title="No audit logs"
            description="System events will be recorded here as users perform actions across NexBoard."
            icon={<ClipboardList size={24} />}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>{['Action','Description','Timestamp'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(logs ?? []).map((log, i) => (
                <tr key={i} className="transition-colors duration-150 hover:bg-primary-50/50">
                  <td className="px-4 py-3.5 font-medium text-slate-800">{log.action}</td>
                  <td className="px-4 py-3.5 text-body-muted">{log.description}</td>
                  <td className="px-4 py-3.5 text-caption">{formatDateTime(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
