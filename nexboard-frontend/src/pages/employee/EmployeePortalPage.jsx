import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getTasksByEmployee } from '../../api/taskApi';
import { getApprovalsByEmployee } from '../../api/approvalApi';
import { getDocumentsByEmployee } from '../../api/documentApi';
import { getTimeline } from '../../api/timelineApi';
import { ClipboardList, ShieldCheck, FileText, Clock, User, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeePortalPage() {
  const { auth } = useAuth();
  const [empId, setEmpId] = useState(() => localStorage.getItem('nexboard_employee_id') || '');
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!empId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, approvalsRes, docsRes, timelineRes] = await Promise.all([
          getTasksByEmployee(empId),
          getApprovalsByEmployee(empId),
          getDocumentsByEmployee(empId),
          getTimeline(empId)
        ]);
        setTasks(tasksRes.data || []);
        setApprovals(approvalsRes.data || []);
        setDocuments(docsRes.data || []);
        setTimeline(timelineRes.data?.timeline || []);
      } catch (err) {
        toast.error('Failed to load portal data. Check if your Employee ID is correct.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [empId]);

  const handleSetId = (e) => {
    e.preventDefault();
    if (!inputVal || Number(inputVal) <= 0) {
      toast.error('Please enter a valid Employee ID');
      return;
    }
    localStorage.setItem('nexboard_employee_id', inputVal);
    setEmpId(inputVal);
    toast.success(`Employee ID set to #${inputVal}`);
  };

  const handleResetId = () => {
    localStorage.removeItem('nexboard_employee_id');
    setEmpId('');
    setInputVal('');
    setTasks([]);
    setApprovals([]);
    setDocuments([]);
    setTimeline([]);
  };

  if (!empId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-50 text-primary-900 p-3 rounded-2xl border border-primary-100">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome, {auth?.username}</h2>
              <p className="text-sm text-slate-500">Please link your employee profile</p>
            </div>
          </div>

          <form onSubmit={handleSetId} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Employee ID
              </label>
              <input
                type="number" min="1" required autoFocus
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-650"
                placeholder="e.g. 42"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-900 text-white py-3 rounded-xl hover:bg-primary-950 transition font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Access Portal</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome, {auth?.username}</h1>
          <p className="text-sm text-slate-500 mt-1">Employee Portal · linked to profile ID #{empId}</p>
        </div>
        <button
          onClick={handleResetId}
          className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-center"
        >
          <RefreshCw size={13} /> Change Employee ID
        </button>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-650 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading your profile data...</p>
          </div>
        </div>
      ) : (
        /* 2x2 Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: My Tasks */}
          <div className="card card-pad flex flex-col h-[400px]">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 shrink-0">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <ClipboardList size={18} />
              </div>
              <h3 className="font-semibold text-slate-800">My Tasks ({tasks.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {!tasks.length ? (
                <p className="text-sm text-slate-400 text-center py-8">No tasks assigned to you yet.</p>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50/55 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.taskName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Due: {t.dueDate}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      t.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: My Approvals */}
          <div className="card card-pad flex flex-col h-[400px]">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 shrink-0">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-semibold text-slate-800">My Approvals ({approvals.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {!approvals.length ? (
                <p className="text-sm text-slate-400 text-center py-8">No approval requests found.</p>
              ) : (
                approvals.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 bg-slate-50/55 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.approvalType.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Created: {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      a.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                      a.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: My Documents */}
          <div className="card card-pad flex flex-col h-[400px]">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 shrink-0">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <FileText size={18} />
              </div>
              <h3 className="font-semibold text-slate-800">My Documents ({documents.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {!documents.length ? (
                <p className="text-sm text-slate-400 text-center py-8">No documents uploaded.</p>
              ) : (
                documents.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-3 bg-slate-50/55 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.documentType.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{d.fileName} ({(d.fileSize / 1024).toFixed(1)} KB)</p>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      d.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-700' :
                      d.verificationStatus === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {d.verificationStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 4: My Timeline */}
          <div className="card card-pad flex flex-col h-[400px]">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 shrink-0">
              <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                <Clock size={18} />
              </div>
              <h3 className="font-semibold text-slate-800">My Timeline ({timeline.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 relative pl-4 border-l-2 border-slate-100 ml-4 mt-6">
              {!timeline.length ? (
                <p className="text-sm text-slate-400 text-center py-8 -ml-4">No events in your timeline yet.</p>
              ) : (
                timeline.map((e, index) => (
                  <div key={index} className="relative pl-6">
                    <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-white ring-4 ring-primary-50" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{e.eventName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(e.occurredAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
