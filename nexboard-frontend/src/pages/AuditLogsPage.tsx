import { useEffect, useState } from 'react';
import { auditLogService } from '../services/report.service';
import { handleApiError } from '../lib/errorHandler';
import type { AuditLog } from '../types';
import { ClipboardList } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogService.getAll()
      .then(r => setLogs(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Audit Logs</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {['Action', 'Description', 'Timestamp'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                  No audit logs found
                </td>
              </tr>
            ) : logs.map((log, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{log.action}</td>
                <td className="px-4 py-3 text-slate-600">{log.description}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
