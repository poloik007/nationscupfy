'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateTournament, deleteTournament } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

export default function TournamentSettings() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '', date: '', infoContent: '', backgroundImageUrl: '', logoUrl: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'tournaments', id)).then(snap => {
      if (snap.exists()) setForm({ ...{ name: '', slug: '', date: '', infoContent: '', backgroundImageUrl: '', logoUrl: '' }, ...snap.data() });
    });
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      await updateTournament(id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    await deleteTournament(id);
    router.push('/admin');
  }

  return (
    <div>
      <h1 className="admin-page-title">⚙️ Tournament Settings</h1>
      <div className="admin-card">
        {error && <div className="alert alert-error">{error}</div>}
        {saved && <div className="alert alert-success">✅ Saved!</div>}
        <form onSubmit={handleSave}>
          <div className="form-row-2">
            <div className="form-row">
              <label className="form-label">Tournament Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label className="form-label">URL Slug</label>
              <input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
              <small style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>Public URL: /live/{form.slug}</small>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Date (display text)</label>
            <input className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} placeholder="Saturday 25 April 2026" />
          </div>
          <div className="form-row-2">
            <div className="form-row">
              <label className="form-label">Background Image URL</label>
              <input className="form-input" value={form.backgroundImageUrl} onChange={e => setForm(f => ({ ...f, backgroundImageUrl: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="form-row">
              <label className="form-label">Logo URL</label>
              <input className="form-input" value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://…" />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Info / Rules (one block per blank line, lines starting with ## are headings)</label>
            <textarea className="form-textarea" style={{ minHeight: 200 }} value={form.infoContent} onChange={e => setForm(f => ({ ...f, infoContent: e.target.value }))} placeholder="## Rules&#10;**8v8**, 20min matches&#10;All teams play Knockout stage" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="admin-save-settings-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Settings'}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>🗑 Delete Tournament</button>
          </div>
        </form>
      </div>
    </div>
  );
}
