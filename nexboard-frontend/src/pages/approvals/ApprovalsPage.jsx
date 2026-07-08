import { useState, useEffect, useCallback } from 'react';
import { getApprovalsByEmployee, initializeApprovals, makeDecision } from '../../api/approvalApi';
import { getEmployees } from '../../api/employeeApi';
import { handleApiError } from '../../utils/errorHandler';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import EmployeeSelector from '../../components/shared/EmployeeSelector';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { ShieldCheck, UserSearch } from 'lucide-react';

export default function ApprovalsPage() {
  const { auth, selectedEmployeeId } = useAuth();
  const isEmployee = auth?.role === 'ROLE_EMPLOYEE';
  const canDecide  = ['ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'].includes(auth?.role);
  const canInit    = ['ROLE_ADMIN','ROLE_HR'].includes(auth?.role);

  const [employees, setEmployees]   = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(isEmployee ? selectedEmployeeId : null);
  const [approvals, setApprovals]   = useState([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!isEmployee) getEmployees().then(r => setEmployees(r.data)).catch(handleApiError);
  }, [isEmployee]);

  const loadApprovals = useCallback(async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      const r = await getApprovalsByEmployee(selectedEmp);
      setApprovals(r.data);
    } catch (err) { handleApiError(err); }
    finally { setLoading(false); }
  }, [selectedEmp]);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const handleInit = async () => {
    try {
      await initializeApprovals(selectedEmp);
      toast.success('Approvals initialized');
      loadApprovals();
    } catch (err) { handleApiError(err); }
  };

  const handleDecide = async (approvalId, status) => {
    const remarks = window.prompt(`Remarks for ${status.toLowerCase()}:`) ?? '';
    try {
      await makeDecision(approvalId, { status, actionBy: auth?.username ?? '', remarks });
      toast.success('Decision recorded');
      loadApprovals();
    } catch (err) { handleApiError(err); }
  };

  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Review and action onboarding approval requests"
        action={canInit && selectedEmp && (
          <button type="button" onClick={handleInit} className="btn-primary">
            Initialize Approvals
          </button>
        )}
      />

      {!isEmployee && (
        <EmployeeSelector value={selectedEmp} onChange={setSelectedEmp} employees={employees} />
      )}

      {!selectedEmp ? (
        <div className="card">
          <EmptyState
            title="Select an employee"
            description="Choose an employee to view and manage their approval workflow."
            icon={<UserSearch size={24} />}
          />
        </div>
      ) : loading ? (
        <SkeletonLoader variant="table" rows={5} cols={5} />
      ) : !approvals.length ? (
        <div className="card">
          <EmptyState
            title="No approvals yet"
            description={canInit ? 'Initialize the approval workflow to create HR, Manager, and IT approval steps.' : 'Approval steps will appear here once initialized by HR.'}
            icon={<ShieldCheck size={24} />}
            action={canInit && (
              <button type="button" onClick={handleInit} className="btn-primary">
                Initialize Approvals
              </button>
            )}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>{['Type','Status','Remarks','Created','Actions'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-table-header">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {approvals.map(a => (
                <tr key={a.id} className="transition-colors duration-150 hover:bg-primary-50/50">
                  <td className="px-4 py-3.5 font-medium text-slate-800">{a.approvalType.replace(/_/g,' ')}</td>
                  <td className="px-4 py-3.5"><Badge value={a.status} /></td>
                  <td className="px-4 py-3.5 text-caption">{a.remarks || '—'}</td>
                  <td className="px-4 py-3.5 text-caption">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3.5">
                    {canDecide && a.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleDecide(a.id, 'APPROVED')}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150">
                          Approve
                        </button>
                        <button type="button" onClick={() => handleDecide(a.id, 'REJECTED')}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150">
                          Reject
                        </button>
                      </div>
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
