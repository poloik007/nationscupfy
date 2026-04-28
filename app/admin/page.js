'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllTournaments, createTournament } from '@/lib/firestore';
import { signOutUser } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    getAllTournaments().then(t => { setTournaments(t); setLoading(false); });
  }, []);

  function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.slug) { setError('Name and slug are required.'); return; }
    try {
      const ref = await createTournament({ ...form, infoContent: '' });
      router.push(`/admin/tournaments/${ref.id}`);
    } catch (err) { setError(err.message); }
  }

  async function handleSignOut() {
    await signOutUser();
    router.push('/admin/login');
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div className="admin-topbar-title">🏆 <span>NationsCupfy</span> Admin</div>
        <button id="admin-signout-btn" className="admin-signout" onClick={handleSignOut}>Sign out</button>
      </div>
      <div className="admin-main" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Tournaments</h1>
          <button id="admin-new-tournament-btn" className="btn btn-primary" onClick={() => setCreating(c => !c)}>
            {creating ? '✕ Cancel' : '+ New Tournament'}
          </button>
        </div>

        {creating && (
          <div className="admin-card">
            <div className="admin-card-title">Create Tournament</div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row-2">
                <div className="form-row">
                  <label className="form-label">Tournament Name</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    placeholder="Nations Cup XVI" required />
                </div>
                <div className="form-row">
                  <label className="form-label">URL Slug</label>
                  <input className="form-input" value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="nationscup16" required />
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Date</label>
                <input className="form-input" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  placeholder="Saturday 25 April 2026" />
              </div>
              <button id="admin-create-tournament-btn" type="submit" className="btn btn-primary">Create Tournament</button>
            </form>
          </div>
        )}

        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          tournaments.length === 0 ? (
            <div className="empty-state"><div className="icon">🏆</div><p>No tournaments yet. Create one above.</p></div>
          ) : (
            <div className="tournament-cards">
              {tournaments.map(t => (
                <Link key={t.id} href={`/admin/tournaments/${t.id}`} className="tournament-card">
                  <div className="tournament-card-name">{t.name}</div>
                  {t.date && <div className="tournament-card-meta">📅 {t.date}</div>}
                  <div className="tournament-card-slug">🔗 /live/{t.slug}</div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
