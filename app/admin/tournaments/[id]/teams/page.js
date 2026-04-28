'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTeams, createTeam, updateTeam, deleteTeam, getGroups } from '@/lib/firestore';

const EMPTY = { name: '', flagEmoji: '', groupId: '', players: '' };

export default function TeamsAdmin() {
  const { id } = useParams();
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const [t, g] = await Promise.all([getTeams(id), getGroups(id)]);
    setTeams(t); setGroups(g);
  }

  useEffect(() => { load(); }, [id]);

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    const players = form.players.split('\n').map(p => p.trim()).filter(Boolean);
    const data = { name: form.name, flagEmoji: form.flagEmoji, groupId: form.groupId || null, players };
    try {
      if (editId) { await updateTeam(id, editId, data); setEditId(null); }
      else await createTeam(id, data);
      setForm(EMPTY); load();
    } catch (err) { setError(err.message); }
  }

  function startEdit(team) {
    setEditId(team.id);
    setForm({ name: team.name, flagEmoji: team.flagEmoji || '', groupId: team.groupId || '', players: (team.players || []).join('\n') });
  }

  async function handleDelete(teamId) {
    if (!confirm('Delete this team?')) return;
    await deleteTeam(id, teamId); load();
  }

  return (
    <div>
      <h1 className="admin-page-title">👕 Teams</h1>
      <div className="admin-card">
        <div className="admin-card-title">{editId ? 'Edit Team' : 'Add Team'}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row-3">
            <div className="form-row">
              <label className="form-label">Team Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hungary" required />
            </div>
            <div className="form-row">
              <label className="form-label">Flag Emoji</label>
              <input className="form-input" value={form.flagEmoji} onChange={e => setForm(f => ({ ...f, flagEmoji: e.target.value }))} placeholder="🇭🇺" />
            </div>
            <div className="form-row">
              <label className="form-label">Group</label>
              <select className="form-select" value={form.groupId} onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}>
                <option value="">— None —</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.phase})</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Players (one per line)</label>
            <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.players} onChange={e => setForm(f => ({ ...f, players: e.target.value }))} placeholder="John Smith&#10;Jane Doe" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editId ? '💾 Save' : '+ Add Team'}</button>
            {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">All Teams ({teams.length})</div>
        {teams.length === 0 ? <p style={{ color: 'var(--muted)' }}>No teams yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Flag</th><th>Name</th><th>Group</th><th>Players</th><th>Actions</th></tr></thead>
            <tbody>
              {teams.map(t => {
                const g = groups.find(gr => gr.id === t.groupId);
                return (
                  <tr key={t.id}>
                    <td style={{ fontSize: '1.4rem' }}>{t.flagEmoji}</td>
                    <td><strong>{t.name}</strong></td>
                    <td>{g ? g.name : '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{(t.players || []).length} players</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(t)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
