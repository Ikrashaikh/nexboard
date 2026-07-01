import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employee.service';
import { taskService } from '../services/task.service';
import { approvalService } from '../services/approval.service';
import { documentService } from '../services/document.service';
import { handleApiError } from '../lib/errorHandler';
import Badge from '../components/Badge';
import type { EmployeeResponse, WorkflowTaskResponse, ApprovalRequestResponse, EmployeeDocumentResponse, OnboardingProgress } from '../types';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/axios';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const empId = Number(id);

  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [tasks, setTasks] = useState<WorkflowTaskResponse[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequestResponse[]>([]);
  const [docs, setDocs] = useState<EmployeeDocumentResponse[]>([]);

  useEffect(() => {
    Promise.all([
      employeeService.getById(empId),
      api.get<OnboardingProgress>(`/workflow-templates/progress/${empId}`),
      taskService.getByEmployee(empId),
      approvalService.getByEmployee(empId),
      documentService.getByEmployee(empId),
    ]).then(([e, p, t, a, d]) => {
      setEmployee(e.data);
      setProgress(p.data);
      setTasks(t.data);
      setApprovals(a.data);
      setDocs(d.data);
    }).catch(handleApiError);
  }, [empId]);

  if (!employee) return <div className="text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{employee.firstName} {employee.lastName}</h2>
          <p className="text-slate-500 text-sm mt-1">{employee.email} · {employee.departmentName}</p>
          <div className="flex gap-2 mt-2">
            <Badge value={employee.status} />
            {employee.managerName && <span className="text-xs text-slate-400">Manager: {employee.managerName}</span>}
          </div>
        </div>
        <span className="text-slate-400 text-sm">#{employee.id}</span>
      </div>

      {/* Progress */}
      {progress && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-3">Onboarding Progress</h3>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
            <div className="bg-indigo-600 h-3 rounded-full transition-all"
              style={{ width: `${progress.progressPercentage}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{progress.completedTasks}/{progress.totalTasks} tasks completed</span>
            <span>{progress.progressPercentage.toFixed(0)}%</span>
          </div>
          {progress.currentStage && <p className="text-xs text-slate-500 mt-1">Current stage: {progress.currentStage}</p>}
        </div>
      )}

      {/* Tasks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-3">Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? <p className="text-sm text-slate-400">No tasks assigned</p> : (
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50">
                <span className="text-slate-700">{t.taskName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs">{t.dueDate}</span>
                  <Badge value={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approvals */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-3">Approvals</h3>
        {approvals.length === 0 ? <p className="text-sm text-slate-400">No approvals initialized</p> : (
          <div className="space-y-2">
            {approvals.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50">
                <span className="text-slate-700">{a.approvalType.replace(/_/g, ' ')}</span>
                <Badge value={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-3">Documents ({docs.length})</h3>
        {docs.length === 0 ? <p className="text-sm text-slate-400">No documents uploaded</p> : (
          <div className="space-y-2">
            {docs.map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50">
                <div>
                  <span className="font-medium text-slate-700">{d.documentType.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 ml-2 text-xs">{d.fileName}</span>
                </div>
                <Badge value={d.verificationStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
