import { CalendarClock } from 'lucide-react';

type Props = {
  title: string;
  body?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
};

export function EmptyState({ title, body, icon, children }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <span className="text-divider dark:text-divider-dark">
        {icon ?? <CalendarClock size={28} strokeWidth={1.5} />}
      </span>
      <p className="text-sm font-medium text-black dark:text-white">{title}</p>
      {body ? <p className="text-muted max-w-xs text-sm leading-6">{body}</p> : null}
      {children}
    </div>
  );
}
