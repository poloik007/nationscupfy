'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, isAdminUser } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (!isAdminUser(user)) {
        router.replace('/admin/login');
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) return (
    <div className="loading-spinner"><div className="spinner" /></div>
  );

  return <>{children}</>;
}
