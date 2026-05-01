'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NAV = [
  { href: '', label: '⚙️ Settings' },
  { href: '/groups', label: '🗂 Groups' },
  { href: '/teams', label: '👕 Teams' },
  { href: '/referees', label: '🎽 Referees' },
  { href: '/matches', label: '📅 Matches' },
  { href: '/scores', label: '⚽ Enter Scores' },
];

export default function TournamentAdminLayout({ children, params }) {
  const pathname = usePathname();
  const router = useRouter();
  const [slug, setSlug] = useState('');

  // Extract ID from pathname: /admin/tournaments/[id]/...
  const id = pathname.split('/')[3];
  const base = `/admin/tournaments/${id}`;

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'tournaments', id), (snap) => {
      if (snap.exists()) {
        setSlug(snap.data().slug || '');
      }
    });
    return () => unsub();
  }, [id]);

  async function handleSignOut() {
    await signOutUser();
    router.push('/admin/login');
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="admin-topbar-title">
          <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>🏆 <span>NationsCupfy</span></Link>
          <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 6px' }}>/</span>
          Admin
        </div>
        <button className="admin-signout" onClick={handleSignOut}>Sign out</button>
      </div>
      <div className="admin-body">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section">
            <div className="admin-sidebar-label">
              <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>← All Tournaments</Link>
            </div>
          </div>
          <div className="admin-sidebar-section">
            <div className="admin-sidebar-label">Tournament</div>
            {NAV.map(item => {
              const href = `${base}${item.href}`;
              const isActive = item.href === ''
                ? pathname === base
                : pathname.startsWith(href);
              return (
                <Link key={item.href} href={href} className={`admin-nav-link${isActive ? ' active' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div style={{ padding: '0 20px', marginTop: 8 }}>
            <Link
              href={`/live/${slug || id}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
            >
              👁 View Public Page
            </Link>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
