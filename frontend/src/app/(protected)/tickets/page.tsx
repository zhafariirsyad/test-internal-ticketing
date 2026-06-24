'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';
import PageHeader from '@/components/page-header';
import TicketBadge from '@/components/ticket-badge';

type Ticket = {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

type TicketListResponse = {
  data: Ticket[];
  meta: {
    total: number;
    pages: number;
    limit: number;
    totalPages: number;
  };
};

export default function TicketsPage() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [statuses, setStatuses] = useState(searchParams.get('statuses') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<TicketListResponse['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    const token = getToken();

    if (!token) {
      removeToken();
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      params.set('page', String(page));
      params.set('limit', '10');

      if (search) {
        params.set('search', search);
      }

      if (statuses) {
        params.set('statuses', statuses);
      } else if (status) {
        params.set('status', status);
      }

      if (category) {
        params.set('category', category);
      }

      const result = await apiFetch(`/tickets?${params.toString()}`, {
        method: 'GET',
        token,
      });

      setTickets(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, statuses, category]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTickets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchTickets]);

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <PageHeader
            title="Daftar Ticket"
            description="Lihat semua ticket yang tersedia"
            backHref="/dashboard"
            backLabel="Kembali ke Dashboard"
            action={
              <Link
                href="/tickets/create"
                className="rounded-lg border border-black px-4 py-2 text-sm font-medium text-black dark:border-white dark:text-white"
              >
                Buat Ticket
              </Link>
            }
          />
        </div>

        <form
          onSubmit={handleFilterSubmit}
          className="mb-6 grid gap-4 rounded-xl border border-black/15 p-4 dark:border-white/15 md:grid-cols-3"
        >
          <div className="flex gap-4 flex-col md:justify-between md:flex-row">
            <input
              type="text"
              placeholder="Cari judul ticket"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none dark:border-white/20 dark:bg-black dark:text-white"
            />

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setStatuses('');
              }}
              className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none dark:border-white/20 dark:bg-black dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none dark:border-white/20 dark:bg-black dark:text-white"
            >
              <option value="">Semua Kategori</option>
              <option value="HARDWARE">HARDWARE</option>
              <option value="SOFTWARE">SOFTWARE</option>
              <option value="NETWORK">NETWORK</option>
              <option value="ACCOUNT">ACCOUNT</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-black/15 dark:border-white/15">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/15 dark:border-white/15">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Judul</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Prioritas</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Pembuat</th>
                <th className="px-4 py-3 text-left">Ditugaskan kepada</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center">
                    Belum ada ticket
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-black/10 dark:border-white/10"
                  >
                    <td className="px-4 py-3">{ticket.id}</td>
                    <td className="px-4 py-3">{ticket.title}</td>
                    <td className="px-4 py-3">{ticket.category}</td>
                    <td className="px-4 py-3">
                      <TicketBadge value={ticket.priority} variant="priority" />
                    </td>
                    <td className="px-4 py-3">
                      <TicketBadge value={ticket.status} variant="status" />
                    </td>
                    <td className="px-4 py-3">{ticket.createdBy.name}</td>
                    <td className="px-4 py-3">
                      {ticket.assignedTo?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p>
              Total: {meta.total} | Halaman: {meta.pages} / {meta.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded border border-black px-3 py-1 disabled:opacity-50 dark:border-white"
              >
                Prev
              </button>

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded border border-black px-3 py-1 disabled:opacity-50 dark:border-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
