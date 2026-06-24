import Link from 'next/link';
import { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6 w-full">
      {(backHref || action) && (
        <div className="mb-4 grid w-full grid-cols-[1fr_auto] items-center">
          <div className="justify-self-start">
            {backHref && backLabel ? (
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm text-black/70 hover:underline dark:text-white/70"
              >
                <span>←</span>
                <span>{backLabel}</span>
              </Link>
            ) : null}
          </div>

          <div className="justify-self-end">{action}</div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>

        {description && (
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
