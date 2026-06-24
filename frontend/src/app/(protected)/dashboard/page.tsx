'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';
import Link from 'next/link';
import PageHeader from '@/components/page-header';

type AdminSummary = {
  role: 'ADMIN';
  total: number;
  open: number;
  inProgress: number;
  done: number;
  rejected: number;
};

type UserSummary = {
  role: 'USER';
  total: number;
  ongoing: number;
  done: number;
};

type DashboardSummary = AdminSummary | UserSummary;

export default function Dashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      const token = getToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const data = await apiFetch('/dashboard/summary', {
          method: 'GET',
          token,
        });

        setSummary(data);
      } catch {
        removeToken();
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [router]);

  function handleLogout() {
    removeToken();
    router.replace('/login');
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        Memuat dashboard...
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <PageHeader
            title="Dashboard"
            description="Ringkasan ticket"
            action={
              <button
                onClick={handleLogout}
                className="rounded-lg border border-black px-4 py-2 text-sm text-black dark:border-white dark:text-white"
              >
                Logout
              </button>
            }
          />
        </div>

        {summary.role === 'ADMIN' ? (
          <div className="grid gap-4 md:grid-cols-5">
            <Card title="Total Ticket" value={summary.total} href="/tickets" />
            <Card
              title="Open"
              value={summary.open}
              href="/tickets?status=OPEN"
            />
            <Card
              title="In Progress"
              value={summary.inProgress}
              href="/tickets?status=IN_PROGRESS"
            />
            <Card
              title="Done"
              value={summary.done}
              href="/tickets?status=DONE"
            />
            <Card
              title="Rejected"
              value={summary.rejected}
              href="/tickets?status=REJECTED"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              title="Total Ticket Saya"
              value={summary.total}
              href="/tickets"
            />
            <Card
              title="Masih Berjalan"
              value={summary.ongoing}
              href="/tickets?statuses=OPEN,IN_PROGRESS"
            />
            <Card
              title="Selesai"
              value={summary.done}
              href="/tickets?status=DONE"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-black/15 bg-white p-5 transition hover:opacity-90 dark:border-white/15 dark:bg-black">
      <p className="text-sm text-black/60 dark:text-white/60">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
