export default function StatCard({ label, value, icon, colorClass = 'bg-primary-700', subtitle }) {
  return (
    <div className="card card-pad card-hover group">
      <div className="flex items-start justify-between">
        <div
          className={`${colorClass} text-white rounded-xl p-2.5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-stat-value">{value}</p>
        <p className="text-body-muted mt-1 font-medium">{label}</p>
        {subtitle && <p className="text-timestamp mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
