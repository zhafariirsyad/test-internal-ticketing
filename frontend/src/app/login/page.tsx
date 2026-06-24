'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveToken } from '@/lib/auth';

type LoginErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Format email tidak valid';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      nextErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      saveToken(result.accessToken);

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login Gagal');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-black dark:bg-black dark:text-white">
      <div className="w-full max-w-md rounded-xl border border-black/15 bg-white p-6 shadow-md dark:border-white/15 dark:bg-black">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-white">
          Login Internal Ticketing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Email
            </label>
            <input
              type="email"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-black outline-none dark:bg-black dark:text-white ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500'
                  : 'border-black/20 focus:border-black dark:border-white/20 dark:focus:border-white'
              }`}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="Masukkan email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Password
            </label>
            <input
              type="password"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-black outline-none dark:bg-black dark:text-white ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500'
                  : 'border-black/20 focus:border-black dark:border-white/20 dark:focus:border-white'
              }`}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Masukkan password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-600 px-3 py-2 text-sm text-white">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-black/10 bg-white p-3 text-sm text-black/70 dark:border-white/10 dark:bg-black dark:text-white/70">
          <p>Admin: admin@example.com / password</p>
          <p>User: user@example.com / password</p>
        </div>
      </div>
    </div>
  );
}
