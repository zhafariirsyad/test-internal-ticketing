'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getAttachmentUrl } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';
import AlertMessage from '@/components/alert-message';
import PageHeader from '@/components/page-header';
import TicketBadge from '@/components/ticket-badge';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
};

type AdminOption = {
  id: number;
  name: string;
  email: string;
};

type Comment = {
  id: number;
  comment: string;
  createdAt: string;
  user: User;
};

type Activity = {
  id: number;
  activity: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  createdAt: string;
  user: User;
};

type TicketDetail = {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  attachmentUrl?: string | null;
  createdAt: string;
  createdBy: User;
  assignedTo?: User | null;
  comments: Comment[];
  activities: Activity[];
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [assignedToId, setAssignedToId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [adminsError, setAdminsError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  const fetchDetail = useCallback(async () => {
    const token = getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError('');
    setCommentError('');
    setStatusError('');
    setAdminsError('');

    try {
      const userData = await apiFetch('/auth/me', {
        method: 'GET',
        token,
      });

      setCurrentUser(userData);

      if (userData.role === 'ADMIN') {
        try {
          const adminData = await apiFetch('/users/admins', {
            method: 'GET',
            token,
          });

          setAdmins(adminData);
        } catch (err) {
          if (err instanceof Error) {
            setAdminsError(err.message);
          } else {
            setAdminsError('Gagal mengambil daftar admin');
          }
        }
      } else {
        setAdmins([]);
      }
    } catch {
      removeToken();
      router.replace('/login');
      return;
    }

    try {
      const ticketData = await apiFetch(`/tickets/${ticketId}`, {
        method: 'GET',
        token,
      });

      setTicket(ticketData);
      setStatus(ticketData.status);
      setAssignedToId(ticketData.assignedTo?.id ? String(ticketData.assignedTo.id) : '');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal mengambil detail ticket');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, ticketId]);

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchDetail();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [ticketId, fetchDetail]);

  async function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!comment.trim()) {
      setCommentError('Komentar tidak boleh kosong');
      return;
    }

    const token = getToken();

    if (!token) {
      removeToken();
      router.replace('/login');
      return;
    }

    setCommentError('');
    setCommentSuccess('');
    setIsSubmittingComment(true);

    try {
      await apiFetch(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          comment,
        }),
      });

      setComment('');
      setCommentSuccess('Komentar berhasil ditambahkan');
      await fetchDetail();
    } catch (err) {
      if (err instanceof Error) {
        setCommentError(err.message);
      } else {
        setCommentError('Gagal menambahkan komentar');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleUpdateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      removeToken();
      router.replace('/login');
      return;
    }

    setStatusError('');
    setStatusSuccess('');
    setIsSubmittingStatus(true);

    try {
      await apiFetch(`/tickets/${ticketId}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          status,
          assignedToId: assignedToId ? Number(assignedToId) : null,
        }),
      });

      setStatusSuccess('Status ticket berhasil diperbarui');
      await fetchDetail();
    } catch (err) {
      if (err instanceof Error) {
        setStatusError(err.message);
      } else {
        setStatusError('Gagal mengubah status');
      }
    } finally {
      setIsSubmittingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        Memuat detail ticket...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        {error || 'Ticket tidak ditemukan'}
      </div>
    );
  }

  const isStatusUnchanged = status === ticket.status;
  const isAssigneeUnchanged =
    assignedToId === (ticket.assignedTo?.id ? String(ticket.assignedTo.id) : '');
  const isUpdateDisabled =
    isSubmittingStatus || (isStatusUnchanged && isAssigneeUnchanged);

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Detail Ticket"
          description="Lihat informasi ticket, komentar, dan riwayat aktivitas"
          backHref="/tickets"
          backLabel="Kembali ke Daftar Ticket"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-black/15 p-6 dark:border-white/15">
              <h2 className="mb-4 text-lg font-semibold">Informasi Ticket</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="Judul" value={ticket.title} />
                <InfoItem
                  label="Status"
                  value={<TicketBadge value={ticket.status} variant="status" />}
                />
                <InfoItem label="Kategori" value={ticket.category} />
                <InfoItem
                  label="Prioritas"
                  value={
                    <TicketBadge value={ticket.priority} variant="priority" />
                  }
                />
                <InfoItem label="Pembuat" value={ticket.createdBy.name} />
                <InfoItem
                  label="Tanggal Dibuat"
                  value={formatDate(ticket.createdAt)}
                />
                <InfoItem
                  label="Assigned To"
                  value={ticket.assignedTo?.name || '-'}
                />
              </div>

              <div className="mt-4">
                <p className="mb-1 text-sm text-black/60 dark:text-white/60">
                  Deskripsi
                </p>
                <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                  {ticket.description}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-1 text-sm text-black/60 dark:text-white/60">
                  Attachment
                </p>

                {ticket.attachmentUrl ? (
                  <a
                    href={getAttachmentUrl(ticket.attachmentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Lihat attachment
                  </a>
                ) : (
                  <p>-</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-black/15 p-6 dark:border-white/15">
              <h2 className="mb-4 text-lg font-semibold">Komentar</h2>

              <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
                <textarea
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
                    setCommentError('');
                    setCommentSuccess('');
                  }}
                  rows={4}
                  placeholder="Tulis komentar..."
                  className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/20 dark:bg-black"
                />

                {commentError && (
                  <AlertMessage message={commentError} variant="error" />
                )}

                {commentSuccess && (
                  <AlertMessage message={commentSuccess} variant="success" />
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !comment.trim()}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
                  >
                    {isSubmittingComment ? 'Menyimpan...' : 'Tambah Komentar'}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {ticket.comments.length === 0 ? (
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Belum ada komentar
                  </p>
                ) : (
                  ticket.comments.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-black/10 p-4 dark:border-white/10"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.user.name}</p>
                          <p className="text-xs text-black/60 dark:text-white/60">
                            {item.user.role}
                          </p>
                        </div>

                        <p className="text-xs text-black/60 dark:text-white/60">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <p className="text-sm">{item.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {currentUser?.role === 'ADMIN' && (
              <section className="rounded-xl border border-black/15 p-6 dark:border-white/15">
                <h2 className="mb-4 text-lg font-semibold">Update Status</h2>

                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setStatusError('');
                      setStatusSuccess('');
                    }}
                    className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/20 dark:bg-black"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>

                  <div>
                    <p className="mb-2 text-sm text-black/60 dark:text-white/60">
                      Assign Admin (opsional)
                    </p>

                    <select
                      value={assignedToId}
                      onChange={(event) => {
                        setAssignedToId(event.target.value);
                        setStatusError('');
                        setStatusSuccess('');
                      }}
                      className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/20 dark:bg-black"
                    >
                      <option value="">Belum di-assign</option>

                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>

                    {adminsError && (
                      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                        {adminsError}
                      </p>
                    )}
                  </div>

                  {statusError && (
                    <AlertMessage message={statusError} variant="error" />
                  )}

                  {statusSuccess && (
                    <AlertMessage message={statusSuccess} variant="success" />
                  )}

                  <button
                    type="submit"
                    disabled={isUpdateDisabled}
                    className="w-full rounded-lg border border-black px-4 py-2 text-sm font-medium text-black disabled:opacity-60 dark:border-white dark:text-white"
                  >
                    {isSubmittingStatus ? 'Menyimpan...' : 'Update Status'}
                  </button>
                </form>
              </section>
            )}

            <section className="rounded-xl border border-black/15 p-6 dark:border-white/15">
              <h2 className="mb-4 text-lg font-semibold">Activity Log</h2>

              <div className="space-y-4">
                {ticket.activities.length === 0 ? (
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Belum ada aktivitas
                  </p>
                ) : (
                  ticket.activities.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-black/10 p-4 dark:border-white/10"
                    >
                      <p className="font-medium">{item.activity}</p>

                      {item.oldStatus || item.newStatus ? (
                        <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                          {item.oldStatus || '-'} → {item.newStatus || '-'}
                        </p>
                      ) : null}

                      <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                        Oleh: {item.user.name}
                      </p>
                      <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-black/60 dark:text-white/60">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('id-ID');
}
