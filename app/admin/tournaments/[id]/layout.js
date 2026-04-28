'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '', label: '⚙️ Settings' },
  { href: '/teams', label: '👕 Teams' },
  { href: '/groups', label: '🗂 Groups' },
  { href: '/matches', label: '📅 Matches' },
  { href: '/scores', label: '⚽ Enter Scores' },
  { href: '/referees', label: '🎽 Referees' },
];

export default function TournamentAdminLayout({ children, params }) {
  const pathname = usePathname();
  const router = useRouter();

  // params is a Promise in this Next.js version — but layout receives it resolved via children
  // We extract id from the pathname instead
  const id = pathname.split('/')[3];
  const base = `/admin/tournaments/${id}`;

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
              href={`/live/${id}`}
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
