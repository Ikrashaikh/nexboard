interface Props {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, icon, color = 'bg-indigo-500' }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`${color} text-white rounded-lg p-3`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
