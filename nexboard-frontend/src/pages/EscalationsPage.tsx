import { useEffect, useState } from 'react';
import { escalationService } from '../services/escalation.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { EscalationResponse } from '../types';
import toast from 'react-hot-toast';
import { AlertTriangle, Play } from 'lucide-react';

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OPEN'>('ALL');

  const load = (openOnly = false) => {
    setLoading(true);
    const call = openOnly ? escalationService.getOpen() : escalationService.getAll();
    call.then(r => setEscalations(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter === 'OPEN'); }, [filter]);

  const runScan = async () => {
    setRunning(true);
    try {
      const r = await escalationService.run();
      toast.success(`Scan complete — ${r.data.length} escalations generated`);
      load(filter === 'OPEN');
    } catch (err) { handleApiError(err); }
    finally { setRunning(false); }
  };

  const resolve = async (id: number) => {
    try {
      await escalationService.resolve(id);
      toast.success('Escalation resolved');
      load(filter === 'OPEN');
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Escalations</h2>
        <button onClick={runScan} disabled={running}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-60">
          <Play size={16} /> {running ? 'Scanning…' : 'Run Scan'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['ALL','OPEN'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {['Type','Status','Employee','Message','Created','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : escalations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  <AlertTriangle size={28} className="mx-auto mb-2 opacity-30" />
                  No escalations found
                </td>
              </tr>
            ) : escalations.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><Badge value={e.type} /></td>
                <td className="px-4 py-3"><Badge value={e.status} /></td>
                <td className="px-4 py-3 text-slate-700">{e.employeeName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{e.message}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {e.status === 'OPEN' && (
                    <button onClick={() => resolve(e.id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
