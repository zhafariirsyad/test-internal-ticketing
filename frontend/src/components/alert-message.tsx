type AlertMessageProps = {
  message: string;
  variant?: 'success' | 'error';
};

export default function AlertMessage({
  message,
  variant = 'error',
}: AlertMessageProps) {
  const className =
    variant === 'success'
      ? 'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
      : 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300';

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${className}`}>
      {message}
    </div>
  );
}
