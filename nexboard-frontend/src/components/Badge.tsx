const COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ONBOARDING: 'bg-blue-100 text-blue-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
  TERMINATED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  VERIFIED: 'bg-green-100 text-green-700',
  OPEN: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-slate-100 text-slate-600',
};

export default function Badge({ value }: { value: string }) {
  const cls = COLORS[value] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}
