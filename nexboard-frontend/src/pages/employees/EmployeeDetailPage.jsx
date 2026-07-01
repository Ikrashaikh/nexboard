import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { getEmployeeById } from '../../api/employeeApi';
import { getProgress } from '../../api/templateApi';
import { getTasksByEmployee } from '../../api/taskApi';
import { getApprovalsByEmployee } from '../../api/approvalApi';
import { getDocumentsByEmployee } from '../../api/documentApi';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { ArrowLeft, CheckSquare, ShieldCheck, FileText } from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const empId = Number(id);

  const { data: employee, loading: l1 } = useFetch(() => getEmployeeById(empId), [empId]);
  const { data: progress }               = useFetch(() => getProgress(empId), [empId]);
  const { data: tasks }                  = useFetch(() => getTasksByEmployee(empId), [empId]);
  const { data: approvals }              = useFetch(() => getApprovalsByEmployee(empId), [empId]);
  const { data: docs }                   = useFetch(() => getDocumentsByEmployee(empId), [empId]);

  if (l1) return <SkeletonLoader variant="detail" blocks={3} />;
  if (!employee) {
    return (
      <div className="card">
        <EmptyState title="Employee not found" description="This employee record may have been removed or the ID is invalid." />
      </div>
    );
  }

  return (
    <div className="page-stack max-w-4xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 hover:underline transition-colors duration-150 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded px-1 cursor-pointer"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back
      </button>

      <div className="card card-pad">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-page-title text-2xl">{employee.firstName} {employee.lastName}</h2>
            <p className="text-page-subtitle">{employee.email} · {employee.departmentName}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge value={employee.status} />
              {employee.managerName && (
                <span className="text-caption self-center">Manager: {employee.managerName}</span>
              )}
            </div>
          </div>
          <span className="text-timestamp">#{employee.id}</span>
        </div>
      </div>

      {progress && (
        <div className="card card-pad">
          <h3 className="text-section-title mb-3">Onboarding Progress</h3>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
            <div
              className="bg-accent-650 h-3 rounded-full transition-all duration-200"
              style={{ width: `${progress.progressPercentage ?? 0}%` }}
              role="progressbar"
              aria-valuenow={progress.progressPercentage ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="flex justify-between text-caption">
            <span>{progress.completedTasks}/{progress.totalTasks} tasks</span>
            <span>{(progress.progressPercentage ?? 0).toFixed(0)}%</span>
          </div>
          {progress.currentStage && (
            <p className="text-caption mt-1">Stage: {progress.currentStage}</p>
          )}
        </div>
      )}

      <Section title={`Tasks (${(tasks ?? []).length})`}>
        {!(tasks ?? []).length ? (
          <EmptyState
            title="No tasks assigned"
            description="Onboarding tasks will appear here once a workflow is assigned."
            icon={<CheckSquare size={20} />}
          />
        ) : (tasks ?? []).map(t => (
          <Row key={t.id} left={t.taskName} right={<><span className="text-timestamp mr-3">{t.dueDate}</span><Badge value={t.status} /></>} />
        ))}
      </Section>

      <Section title="Approvals">
        {!(approvals ?? []).length ? (
          <EmptyState
            title="No approvals"
            description="Approval steps will appear once the workflow is initialized."
            icon={<ShieldCheck size={20} />}
          />
        ) : (approvals ?? []).map(a => (
          <Row key={a.id} left={a.approvalType.replace(/_/g,' ')} right={<Badge value={a.status} />} />
        ))}
      </Section>

      <Section title={`Documents (${(docs ?? []).length})`}>
        {!(docs ?? []).length ? (
          <EmptyState
            title="No documents"
            description="Uploaded documents will be listed here for verification."
            icon={<FileText size={20} />}
          />
        ) : (docs ?? []).map(d => (
          <Row key={d.id}
            left={<><span className="font-medium">{d.documentType.replace(/_/g,' ')}</span><span className="text-timestamp ml-2">{d.fileName}</span></>}
            right={<Badge value={d.verificationStatus} />}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card card-pad">
      <h3 className="text-section-title mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-primary-50/50 text-sm transition-colors duration-150">
      <span className="text-body">{left}</span>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
