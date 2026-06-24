type TicketBadgeProps = {
  value: string;
  variant: 'status' | 'priority';
};

function formatBadgeLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
}

function getStatusBadgeClass(status: string) {
  if (status === 'OPEN') {
    return 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300';
  }

  if (status === 'IN_PROGRESS') {
    return 'border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300';
  }

  if (status === 'DONE') {
    return 'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300';
  }

  if (status === 'REJECTED') {
    return 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300';
  }

  return 'border-black/20 bg-white text-black dark:border-white/20 dark:bg-black dark:text-white';
}

function getPriorityBadgeClass(priority: string) {
  if (priority === 'LOW') {
    return 'border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
  }

  if (priority === 'MEDIUM') {
    return 'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300';
  }

  if (priority === 'HIGH') {
    return 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300';
  }

  return 'border-black/20 bg-white text-black dark:border-white/20 dark:bg-black dark:text-white';
}

export default function TicketBadge({
  value,
  variant,
}: TicketBadgeProps) {
  const extraClass =
    variant === 'status'
      ? getStatusBadgeClass(value)
      : getPriorityBadgeClass(value);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${extraClass}`}
    >
      {formatBadgeLabel(value)}
    </span>
  );
}
