import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employee.service';
import type { EmployeeResponse } from '../types';
import toast from 'react-hot-toast';

/**
 * Shown to EMPLOYEE role users who haven't yet selected their employee profile.
 * User entity and Employee entity are not linked in the backend.
 */
export default function EmployeePicker() {
  const { setEmployeeId } = useAuth();
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    employeeService.getAll()
      .then(r => setEmployees(r.data))
      .catch(() => toast.error('Could not load employee list'));
  }, []);

  const confirm = () => {
    if (!selected) return toast.error('Please select your profile');
    setEmployeeId(Number(selected));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Select Your Profile</h2>
        <p className="text-sm text-slate-500 mb-6">
          Your login account is not automatically linked to an employee record.
          Please select which employee profile you are — this is stored locally and only asked once.
        </p>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">— select your name —</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} ({e.departmentName})
            </option>
          ))}
        </select>
        <button
          onClick={confirm}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
