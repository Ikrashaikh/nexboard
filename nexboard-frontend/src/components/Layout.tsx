import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, UserCheck, GitBranch,
  CheckSquare, ShieldCheck, FileText, Bell, AlertTriangle,
  BarChart2, ClipboardList, LogOut, Menu, X, Clock,
} from 'lucide-react';
import type { Role } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: '/dashboard',       label: 'Dashboard',       icon: <LayoutDashboard size={18} />, roles: ['ADMIN','HR','MANAGER'] },
  { to: '/employees',       label: 'Employees',       icon: <UserCheck size={18} />,       roles: ['ADMIN','HR','MANAGER'] },
  { to: '/departments',     label: 'Departments',     icon: <Building2 size={18} />,       roles: ['ADMIN','HR'] },
  { to: '/users',           label: 'Users',           icon: <Users size={18} />,           roles: ['ADMIN'] },
  { to: '/templates',       label: 'Templates',       icon: <GitBranch size={18} />,       roles: ['ADMIN','HR','MANAGER'] },
  { to: '/tasks',           label: 'Tasks',           icon: <CheckSquare size={18} />,     roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/approvals',       label: 'Approvals',       icon: <ShieldCheck size={18} />,     roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/documents',       label: 'Documents',       icon: <FileText size={18} />,        roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/timelines',       label: 'Timelines',       icon: <Clock size={18} />,           roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/notifications',   label: 'Notifications',   icon: <Bell size={18} />,            roles: ['ADMIN','HR','MANAGER','EMPLOYEE'] },
  { to: '/escalations',     label: 'Escalations',     icon: <AlertTriangle size={18} />,   roles: ['ADMIN','HR','MANAGER'] },
  { to: '/analytics',       label: 'Analytics',       icon: <BarChart2 size={18} />,       roles: ['ADMIN','HR','MANAGER'] },
  { to: '/reports',         label: 'Reports',         icon: <ClipboardList size={18} />,   roles: ['ADMIN','HR','MANAGER'] },
  { to: '/audit-logs',      label: 'Audit Logs',      icon: <ClipboardList size={18} />,   roles: ['ADMIN','HR'] },
];

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = auth?.role as Role;

  const visible = NAV.filter(n => n.roles.includes(role));

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white font-medium'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  const sidebar = (
    <aside className="flex flex-col h-full bg-slate-900 text-white w-64 shrink-0">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white tracking-tight">NexBoard</h1>
        <p className="text-xs text-slate-400 mt-0.5">{auth?.username} · {auth?.role}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visible.map(n => (
          <NavLink key={n.to} to={n.to} className={linkClass} onClick={() => setOpen(false)}>
            {n.icon} {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">{sidebar}</div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-50">{sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
          <span className="font-bold text-slate-800">NexBoard</span>
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
