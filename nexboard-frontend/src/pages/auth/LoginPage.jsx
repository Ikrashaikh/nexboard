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
    navigate(auth.role === 'ROLE_EMPLOYEE' ? '/my' : '/dashboard');
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
      const userRole = data.role?.startsWith('ROLE_') ? data.role : 'ROLE_' + data.role;
      navigate(userRole === 'ROLE_EMPLOYEE' ? '/employee-profile' : '/dashboard');
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

            {/* OAuth2 Login options */}
            <div className="mt-5">
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">or continue with</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => window.location.href = "http://localhost:8080/oauth2/authorize/google"}
                  className="flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm cursor-pointer text-slate-700 bg-white"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.href = "http://localhost:8080/oauth2/authorize/github"}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-slate-900 bg-slate-950 transition-all font-semibold text-sm cursor-pointer text-white shadow-md"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>GitHub</span>
                </button>
              </div>
            </div>

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
