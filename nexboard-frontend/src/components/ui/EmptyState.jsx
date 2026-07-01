import { Inbox } from 'lucide-react';

/**
 * Empty list/table placeholder with module-specific copy.
 * @param {string} title - Primary heading (alias: message)
 * @param {string} [description] - Secondary explanation; omit to hide
 * @param {React.ReactNode} [icon] - lucide-react icon element
 * @param {React.ReactNode} [action] - optional CTA button/link
 */
export default function EmptyState({
  title,
  message,
  description,
  icon,
  action,
}) {
  const heading = title ?? message ?? 'Nothing here yet';

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      role="status"
    >
      <div
        className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400"
        aria-hidden="true"
      >
        {icon ?? <Inbox size={24} />}
      </div>
      <p className="text-body font-medium text-slate-600">{heading}</p>
      {description && (
        <p className="text-caption text-slate-400 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
