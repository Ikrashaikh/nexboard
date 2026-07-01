export default function Spinner({ fullPage = false, size = 'md' }) {
  const sz = size === 'sm' ? 'w-5 h-5 border-2' : 'w-8 h-8 border-[3px]';
  const spinner = (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sz} border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
      <p className="text-xs text-slate-400">Loading…</p>
    </div>
  );
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }
  return spinner;
}
