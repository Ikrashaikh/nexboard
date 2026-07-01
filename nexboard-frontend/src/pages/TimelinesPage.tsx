import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { employeeService } from '../services/employee.service';
import { handleApiError } from '../lib/errorHandler';
import type { EmployeeTimeline, EmployeeResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

export default function TimelinesPage() {
  const { auth, employeeId } = useAuth();
  const isEmployee = auth?.role === 'EMPLOYEE';

  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<number | null>(isEmployee ? employeeId : null);
  const [timeline, setTimeline] = useState<EmployeeTimeline | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEmployee) {
      employeeService.getAll().then(r => setEmployees(r.data)).catch(handleApiError);
    }
  }, [isEmployee]);

  useEffect(() => {
    if (selectedEmp) {
      setLoading(true);
      api.get<EmployeeTimeline>(`/employee-timelines/employee/${selectedEmp}`)
        .then(r => setTimeline(r.data))
        .catch(handleApiError)
        .finally(() => setLoading(false));
    }
  }, [selectedEmp]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Employee Timelines</h2>

      {!isEmployee && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <select
            className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={selectedEmp ?? ''}
            onChange={e => setSelectedEmp(Number(e.target.value))}>
            <option value="">— select an employee —</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedEmp ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-400">
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p>Select an employee to view their onboarding timeline</p>
        </div>
      ) : loading ? (
        <p className="text-slate-400 text-sm">Loading timeline…</p>
      ) : !timeline ? null : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-800">{timeline.employeeName}</h3>
            <p className="text-sm text-slate-500">{timeline.departmentName}</p>
          </div>

          {timeline.timeline.length === 0 ? (
            <p className="text-slate-400 text-sm">No timeline events yet</p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-6">
                {timeline.timeline.map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-12">
                    {/* Dot */}
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{event.eventName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${event.status === 'COMPLETED' ? 'bg-green-100 text-green-700'
                              : event.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'}`}>
                            {event.status}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(event.occurredAt).toLocaleDateString()}
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
