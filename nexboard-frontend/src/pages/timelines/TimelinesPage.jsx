import { useState, useEffect, useCallback } from 'react';
import { getTimeline } from '../../api/timelineApi';
import { getEmployees } from '../../api/employeeApi';
import { handleApiError } from '../../utils/errorHandler';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import EmployeeSelector from '../../components/shared/EmployeeSelector';
import { useAuth } from '../../hooks/useAuth';
import { Clock, UserSearch } from 'lucide-react';

const statusColor = (s) => {
  if (s === 'COMPLETED') return 'bg-green-100 text-green-700';
  if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-600';
};

const statusDot = (s) => {
  if (s === 'COMPLETED') return 'bg-emerald-500';
  if (s === 'IN_PROGRESS') return 'bg-blue-500';
  return 'bg-slate-400';
};

export default function TimelinesPage() {
  const { auth, selectedEmployeeId } = useAuth();
  const isEmployee = auth?.role === 'EMPLOYEE';

  const [employees, setEmployees]   = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(isEmployee ? selectedEmployeeId : null);
  const [timeline, setTimeline]     = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!isEmployee) getEmployees().then(r => setEmployees(r.data)).catch(handleApiError);
  }, [isEmployee]);

  const loadTimeline = useCallback(async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try { const r = await getTimeline(selectedEmp); setTimeline(r.data); }
    catch (err) { handleApiError(err); }
    finally { setLoading(false); }
  }, [selectedEmp]);

  useEffect(() => { loadTimeline(); }, [loadTimeline]);

  return (
    <div>
      <PageHeader title="Timelines" subtitle="Chronological onboarding event history" />

      {!isEmployee && (
        <EmployeeSelector value={selectedEmp} onChange={setSelectedEmp} employees={employees} />
      )}

      {!selectedEmp ? (
        <div className="card">
          <EmptyState
            title="Select an employee"
            description="Choose an employee to view their onboarding timeline."
            icon={<UserSearch size={24} />}
          />
        </div>
      ) : loading ? (
        <SkeletonLoader variant="detail" blocks={1} />
      ) : !timeline ? null : (
        <div className="card card-pad max-w-2xl">
          <div className="mb-5">
            <h3 className="text-section-title text-lg">{timeline.employeeName}</h3>
            <p className="text-body-muted">{timeline.departmentName}</p>
          </div>

          {!(timeline.timeline ?? []).length ? (
            <EmptyState
              title="No timeline events yet"
              description="Events will appear here as the employee progresses through onboarding."
              icon={<Clock size={24} />}
            />
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" aria-hidden="true" />
              <div className="space-y-6">
                {(timeline.timeline ?? []).map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-12">
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow" aria-hidden="true" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{event.eventName}</p>
                          <p className="text-caption mt-0.5">{event.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium transition-colors duration-150 ${statusColor(event.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(event.status)}`} aria-hidden="true" />
                            {event.status}
                          </span>
                          <p className="text-timestamp mt-1">
                            {event.occurredAt ? new Date(event.occurredAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
