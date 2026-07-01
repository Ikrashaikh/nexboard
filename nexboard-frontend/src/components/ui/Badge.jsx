import { STATUS_COLORS } from '../../utils/enumLabels';

const DOT_COLORS = {
  ACTIVE: 'bg-emerald-500', ONBOARDING: 'bg-blue-500', INACTIVE: 'bg-slate-400',
  TERMINATED: 'bg-red-500', PENDING: 'bg-amber-500', IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500', APPROVED: 'bg-emerald-500', REJECTED: 'bg-red-500',
  VERIFIED: 'bg-emerald-500', OPEN: 'bg-orange-500', RESOLVED: 'bg-slate-400',
};

export default function Badge({ value, showDot = true }) {
  const cls = STATUS_COLORS[value] ?? 'bg-slate-100 text-slate-600';
  const dot = DOT_COLORS[value];
  const label = String(value).replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-150 ${cls}`}
      aria-label={`Status: ${label}`}
    >
      {showDot && dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}
