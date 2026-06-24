'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        await apiFetch('/auth/me', {
          method: 'GET',
          token,
        });

        setIsChecking(false);
      } catch {
        removeToken();
        router.replace('/login');
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black dark:bg-black dark:text-white">
        Memeriksa sesi login...
      </div>
    );
  }

  return <>{children}</>;
}
