import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getRoleBasedRedirect } from '../../utils/roleRedirect';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const role = auth?.role || '';

  const formatRole = (r) => {
    if (!r) return '';
    const clean = r.replace('ROLE_', '').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const handleGoHome = () => {
    navigate(getRoleBasedRedirect(role));
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Your role (<span className="font-semibold text-slate-700">{formatRole(role)}</span>) does not have permission to access this resource.
        </p>
        <button
          onClick={handleGoHome}
          className="w-full bg-primary-900 text-white py-3 rounded-xl hover:bg-primary-950 transition font-semibold text-sm cursor-pointer"
        >
          Go to my home
        </button>
      </div>
    </div>
  );
}
