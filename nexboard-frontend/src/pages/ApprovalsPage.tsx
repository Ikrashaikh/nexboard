import { useEffect, useState } from 'react';
import { approvalService } from '../services/approval.service';
import { employeeService } from '../services/employee.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { ApprovalRequestResponse, EmployeeResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const { auth, employeeId } = useAuth();
  const isEmployee = auth?.role === 'EMPLOYEE';
  const canDecide = ['ADMIN','HR','MANAGER'].includes(auth?.role ?? '');
  const canInit = ['ADMIN','HR'].includes(auth?.role ?? '');

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(isEmployee ? employeeId : null);
  const [approvals, setApprovals] = useState<ApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEmployee) {
      employeeService.getAll().then(r => setEmployees(r.data)).catch(handleApiError);
    }
  }, [isEmployee]);

  const loadApprovals = (empId: number) => {
    setLoading(true);
    approvalService.getByEmployee(empId)
      .then(r => setApprovals(r.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (selectedEmp) loadApprovals(selectedEmp); }, [selectedEmp]);

  const initialize = async () => {
    if (!selectedEmp) return;
    try {
      await approvalService.initialize(selectedEmp);
      toast.success('Approvals initialized');
      loadApprovals(selectedEmp);
    } catch (err) { handleApiError(err); }
  };

  const decide = async (approvalId: number, status: string) => {
    const remarks = window.prompt('Remarks (optional):') ?? '';
    try {
      await approvalService.decide(approvalId, { status, actionBy: auth?.username ?? '', remarks });
      toast.success('Decision recorded');
      if (selectedEmp) loadApprovals(selectedEmp);
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Approvals</h2>
        {canInit && selectedEmp && (
          <button onClick={initialize}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Initialize Approvals
          </button>
        )}
      </div>

      {!isEmployee && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <select className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedEmp ?? ''} onChange={e => setSelectedEmp(Number(e.target.value))}>
            <option value="">— pick an employee —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              {['Type','Status','Remarks','Created','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!selectedEmp ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Select an employee</td></tr>
            ) : loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : approvals.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No approvals found</td></tr>
            ) : approvals.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{a.approvalType.replace(/_/g,' ')}</td>
                <td className="px-4 py-3"><Badge value={a.status} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{a.remarks || '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {canDecide && a.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => decide(a.id, 'APPROVED')}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                      <button onClick={() => decide(a.id, 'REJECTED')}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                    </div>
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
