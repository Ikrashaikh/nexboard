import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRoleBasedRedirect } from '../../utils/roleRedirect';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export default function OAuth2CallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const role = searchParams.get('role');

    if (!token || !username || !role) {
      setError('Required authentication parameters are missing. Please try signing in again.');
      return;
    }

    try {
      login({ token, tokenType: 'Bearer', username, role });
      toast.success(`Welcome back, ${username}!`);
      navigate(getRoleBasedRedirect(role), { replace: true });
    } catch (err) {
      setError('Failed to process login callback. Please try again.');
    }
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Authentication Failed</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary-900 text-white py-3 rounded-xl hover:bg-primary-950 transition font-semibold text-sm cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-650 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Completing sign-in, please wait...</p>
      </div>
    </div>
  );
}
