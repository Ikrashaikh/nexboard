import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { UserCheck } from 'lucide-react';

/**
 * EMPLOYEE-only: shown once after login to pick their employee record.
 * GET /employees is NOT accessible to EMPLOYEE role, so we use a manual ID input.
 */
export default function EmployeeProfilePage() {
  const { setSelectedEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = Number(empId);
    if (!id || id <= 0) {
      toast.error('Please enter a valid Employee ID');
      return;
    }
    setLoading(true);
    // Optimistically set — if the ID is wrong tasks page will fail gracefully
    setSelectedEmployeeId(id);
    toast.success(`Profile set to Employee #${id}`);
    navigate('/tasks');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 to-primary-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-accent-100 text-accent-700 p-3 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Select Your Profile</h2>
            <p className="text-sm text-slate-500">One-time setup · saved for this session</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
          <p className="font-medium mb-1">Why is this needed?</p>
          <p>
            Your login account and your employee record are separate in NexBoard.
            The employee list is only accessible to HR/Admin, so please enter your
            Employee ID manually. You can find it by asking your HR team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Employee ID
            </label>
            <input
              type="number" min="1" required autoFocus
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-650"
              placeholder="e.g. 42"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent-600 text-white py-2.5 rounded-lg hover:bg-accent-700 transition font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            Confirm Profile
          </button>
        </form>
      </div>
    </div>
  );
}
