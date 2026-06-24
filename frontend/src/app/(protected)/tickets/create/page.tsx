'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';
import AlertMessage from '@/components/alert-message';
import PageHeader from '@/components/page-header';

const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCOUNT', 'OTHER'];
const priorities = ['LOW', 'MEDIUM', 'HIGH'];

type CreateTicketErrors = {
  title?: string;
  description?: string;
  attachment?: string;
};

export default function CreateTicketPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HARDWARE');
  const [priority, setPriority] = useState('LOW');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<CreateTicketErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    const nextErrors: CreateTicketErrors = {};

    if (!title.trim()) {
      nextErrors.title = 'Judul ticket wajib diisi';
    } else if (title.trim().length < 3) {
      nextErrors.title = 'Judul ticket minimal 3 karakter';
    }

    if (!description.trim()) {
      nextErrors.description = 'Deskripsi wajib diisi';
    } else if (description.trim().length < 5) {
      nextErrors.description = 'Deskripsi minimal 5 karakter';
    }

    if (attachment) {
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];

      if (!allowedTypes.includes(attachment.type)) {
        nextErrors.attachment =
          'Attachment hanya boleh png, jpg, jpeg, atau pdf';
      } else if (attachment.size > 2 * 1024 * 1024) {
        nextErrors.attachment = 'Ukuran attachment maksimal 2 MB';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      removeToken();
      router.replace('/login');
      return;
    }

    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append('title', title);
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('description', description);

      if (attachment) {
        formData.append('attachment', attachment);
      }

      await apiFetch('/tickets', {
        method: 'POST',
        token,
        body: formData,
      });

      setSuccessMessage('Ticket berhasil dibuat. Mengalihkan ke daftar ticket...');

      window.setTimeout(() => {
        router.push('/tickets');
      }, 1200);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal membuat ticket');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-black dark:bg-black dark:text-white">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Buat Ticket"
          description="Isi form untuk membuat ticket baru"
          backHref="/tickets"
          backLabel="Kembali ke Daftar Ticket"
        />

        <div className="rounded-xl border border-black/15 p-6 dark:border-white/15">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Judul Ticket
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="Contoh: Laptop tidak bisa connect wifi"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none dark:bg-black ${
                  errors.title
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-black/20 dark:border-white/20'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/20 dark:bg-black"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/20 dark:bg-black"
                >
                  {priorities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Jelaskan masalah yang terjadi"
                rows={5}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none dark:bg-black ${
                  errors.description
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-black/20 dark:border-white/20'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Attachment (opsional)
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(event) => {
                  setAttachment(event.target.files?.[0] || null);
                  setErrors((prev) => ({ ...prev, attachment: '' }));
                }}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none dark:bg-black ${
                  errors.attachment
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-black/20 dark:border-white/20'
                }`}
              />
              <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                Maksimal 2 MB. Format: png, jpg, jpeg, pdf.
              </p>
              {attachment && (
                <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                  File terpilih: {attachment.name}
                </p>
              )}
              {errors.attachment && (
                <p className="mt-1 text-sm text-red-500">{errors.attachment}</p>
              )}
            </div>

            {error && (
              <AlertMessage message={error} variant="error" />
            )}

            {successMessage && (
              <AlertMessage message={successMessage} variant="success" />
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/tickets')}
                className="rounded-lg border border-black px-4 py-2 text-sm dark:border-white"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {isLoading ? 'Loading...' : 'Buat Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
