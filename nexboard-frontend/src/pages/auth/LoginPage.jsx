import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { login as loginApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Layers, Sparkles } from 'lucide-react';

const CREDENTIALS = [
  { role: 'Admin',    username: 'admin',    password: 'admin123',    color: 'border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100/50' },
  { role: 'HR',       username: 'hr',       password: 'hr123',       color: 'border-purple-200 text-purple-600 bg-purple-50/50 hover:bg-purple-100/50' },
  { role: 'Manager',  username: 'manager',  password: 'manager123',  color: 'border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100/50' },
  { role: 'Employee', username: 'employee', password: 'employee123', color: 'border-green-200 text-green-600 bg-green-50/50 hover:bg-green-100/50' },
];

export default function LoginPage() {
  const { login, auth } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  if (auth) {
    navigate(auth.role === 'EMPLOYEE' ? '/tasks' : '/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await loginApi(username, password);
      login(data);
      toast.success(`Welcome back, ${data.username}!`);
      navigate(data.role?.replace('ROLE_', '') === 'EMPLOYEE' ? '/employee-profile' : '/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('Invalid username or password. Please try again.');
      } else if (!err.response) {
        setError('Cannot connect to the server. Make sure the backend is running.');
      } else {
        setError(err.response?.data?.message ?? 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredential = (cred) => {
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel ── branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-primary-950 via-primary-900 to-primary-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400/15 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent-500 rounded-xl shadow-lg shadow-accent-500/20">
            <Layers size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">NexBoard</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20">
            <Sparkles size={12} />
            Version 2.0 Live
          </span>
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Seamless employee <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300">onboarding</span> starting here.
          </h1>
          <p className="text-primary-200/85 text-base leading-relaxed">
            NexBoard helps organizations orchestrate custom onboarding tracks, manage verification workflows, gather department sign-offs, and monitor real-time completion analytics.
          </p>
        </div>

        {/* Footer features list */}
        <div className="relative z-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
          <div>
            <div className="text-white font-bold text-lg">100%</div>
            <div className="text-primary-300 text-xs mt-0.5">Automated Workflows</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg">Role-based</div>
            <div className="text-primary-300 text-xs mt-0.5">Access Controls</div>
          </div>
          <div>
            <div className="text-white font-bold text-lg">Real-time</div>
            <div className="text-primary-300 text-xs mt-0.5">Audit Trails</div>
          </div>
        </div>
      </div>

      {/* Right panel ── form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-900 rounded-xl mb-3 mx-auto shadow-md">
              <Layers size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">NexBoard</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 md:p-10 relative overflow-hidden">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sign In</h2>
              <p className="text-slate-500 text-sm mt-1.5">Enter your organizational credentials below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text" required autoFocus
                  value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-slate-400 ${error ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                  placeholder="name@company.com"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-slate-400 pr-10 ${error ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-[panel-slide-down_200ms_ease-out]">
                  <span className="text-red-500 shrink-0 font-bold">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-primary-900 text-white py-3 rounded-xl hover:bg-primary-950 active:bg-primary-950 shadow-md shadow-primary-950/10 hover:shadow-lg transition-all font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Quick fill demo chips */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Demo Login</p>
              <div className="flex flex-wrap justify-center gap-2">
                {CREDENTIALS.map(c => (
                  <button key={c.role} onClick={() => fillCredential(c)}
                    className={`border rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${c.color}`}>
                    {c.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
