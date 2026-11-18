'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/login') {
      router.replace('/login');
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">로딩 중...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
