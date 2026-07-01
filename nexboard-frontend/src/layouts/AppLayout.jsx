import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, Building2, UserCheck, GitBranch,
  CheckSquare, ShieldCheck, FileText, Bell, AlertTriangle,
  BarChart2, ClipboardList, LogOut, Menu, X, Clock,
  Layers, ChevronRight, RefreshCw,
} from 'lucide-react';

const ALL_NAV = [
  { section: 'Overview' },
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard, roles: ['ADMIN','HR','MANAGER'] },
  { section: 'People' },
  { to: '/employees',    label: 'Employees',     icon: UserCheck,       roles: ['ADMIN','HR','MANAGER'] },
  { to: '/departments',  label: 'Departments',   icon: Building2,       roles: ['ADMIN','HR'] },
  { to: '/users',        label: 'Users',         icon: Users,           roles: ['ADMIN'] },
  { section: 'Onboarding' },
  { to: '/templates',    label: 'Templates',     icon: GitBranch,       roles: ['ADMIN','HR','MANAGER'] },
  { to: '/tasks',        label: 'Tasks',         icon: CheckSquare,     roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/approvals',    label: 'Approvals',     icon: ShieldCheck,     roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/documents',    label: 'Documents',     icon: FileText,        roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/timelines',    label: 'Timelines',     icon: Clock,           roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { section: 'Insights' },
  { to: '/notifications',label: 'Notifications', icon: Bell,            roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/escalations',  label: 'Escalations',   icon: AlertTriangle,   roles: ['ADMIN','HR','MANAGER'] },
  { to: '/analytics',    label: 'Analytics',     icon: BarChart2,       roles: ['ADMIN','HR','MANAGER'] },
  { to: '/reports',      label: 'Reports',       icon: ClipboardList,   roles: ['ADMIN','HR','MANAGER'] },
  { to: '/audit-logs',   label: 'Audit Logs',    icon: ClipboardList,   roles: ['ADMIN','HR'] },
];

const ROLE_CONFIG = {
  ADMIN:    { color: 'bg-red-500/20 text-red-300',      dot: 'bg-red-400' },
  HR:       { color: 'bg-purple-500/20 text-purple-300',dot: 'bg-purple-400' },
  MANAGER:  { color: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-400' },
  EMPLOYEE: { color: 'bg-green-500/20 text-green-300',  dot: 'bg-green-400' },
};

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/employees':    'Employees',
  '/departments':  'Departments',
  '/users':        'Users',
  '/templates':    'Workflow Templates',
  '/tasks':        'Onboarding Tasks',
  '/approvals':    'Approvals',
  '/documents':    'Documents',
  '/timelines':    'Timelines',
  '/notifications':'Notifications',
  '/escalations':  'Escalations',
  '/analytics':    'Analytics',
  '/reports':      'Reports',
  '/audit-logs':   'Audit Logs',
};

function Sidebar({ onClose }) {
  const { auth, logout, clearSelectedEmployee } = useAuth();
  const navigate = useNavigate();
  const role = auth?.role ?? '';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.EMPLOYEE;

  const navItems = ALL_NAV.filter(n =>
    n.section !== undefined || n.roles?.includes(role)
  );

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="flex flex-col h-full w-64 shrink-0"
      style={{ background: 'linear-gradient(180deg, var(--color-primary-950) 0%, var(--color-primary-900) 100%)' }}>

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center shrink-0">
          <Layers size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-none">NexBoard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Onboarding Platform</p>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 my-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {auth?.username?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{auth?.username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${roleConfig.dot}`} />
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${roleConfig.color}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
        {navItems.map((n, i) => {
          if (n.section) {
            return (
              <p key={i} className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-4 pb-1.5">
                {n.section}
              </p>
            );
          }
          const Icon = n.icon;
          return (
            <NavLink key={n.to} to={n.to}
              onClick={onClose}
              aria-current={undefined}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  isActive
                    ? 'bg-accent-600 text-white shadow-md shadow-accent-700/25 font-semibold'
                    : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                  <span className="flex-1">{n.label}</span>
                  {isActive && <ChevronRight size={12} className="opacity-60" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        {role === 'EMPLOYEE' && (
          <button
            onClick={() => { clearSelectedEmployee(); navigate('/employee-profile'); onClose?.(); }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-white/8 hover:text-white transition-all cursor-pointer">
            <RefreshCw size={14} /> Change Profile
          </button>
        )}
        <button type="button" onClick={handleLogout} aria-label="Sign out"
          className="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer">
          <LogOut size={16} aria-hidden="true" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function TopHeader({ onMenuClick }) {
  const location = useLocation();
  const pathKey = '/' + location.pathname.split('/')[1];
  const title = PAGE_TITLES[pathKey] ?? 'NexBoard';

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} aria-label="Open navigation menu"
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
          <Menu size={20} aria-hidden="true" />
        </button>
        <h2 className="text-section-title text-base">{title}</h2>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="hidden sm:inline">NexBoard</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu"
              className="absolute top-4 -right-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white transition-colors duration-150 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
