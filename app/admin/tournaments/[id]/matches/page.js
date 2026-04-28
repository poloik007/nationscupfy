'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMatches, getTeams, getGroups, getReferees, createMatch, updateMatch, deleteMatch } from '@/lib/firestore';

const EMPTY = { homeTeamId: '', awayTeamId: '', groupId: '', scheduledTime: '', field: '', refereeId: '', phase: 'group' };

export default function MatchesAdmin() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [referees, setReferees] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const [m, t, g, r] = await Promise.all([getMatches(id), getTeams(id), getGroups(id), getReferees(id)]);
    setMatches(m); setTeams(t); setGroups(g); setReferees(r);
  }
  useEffect(() => { load(); }, [id]);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));
  const refMap = Object.fromEntries(referees.map(r => [r.id, r]));

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    const data = { ...form, phase: groups.find(g => g.id === form.groupId)?.phase || form.phase };
    try {
      if (editId) { await updateMatch(id, editId, data); setEditId(null); }
      else await createMatch(id, data);
      setForm(EMPTY); load();
    } catch (err) { setError(err.message); }
  }

  async function handleDelete(mid) {
    if (!confirm('Delete this match?')) return;
    await deleteMatch(id, mid); load();
  }

  return (
    <div>
      <h1 className="admin-page-title">📅 Matches</h1>
      <div className="admin-card">
        <div className="admin-card-title">{editId ? 'Edit Match' : 'Schedule Match'}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-row">
              <label className="form-label">Home Team</label>
              <select className="form-select" value={form.homeTeamId} onChange={e => setForm(f => ({ ...f, homeTeamId: e.target.value }))} required>
                <option value="">— Select —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Away Team</label>
              <select className="form-select" value={form.awayTeamId} onChange={e => setForm(f => ({ ...f, awayTeamId: e.target.value }))} required>
                <option value="">— Select —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-row">
              <label className="form-label">Group</label>
              <select className="form-select" value={form.groupId} onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}>
                <option value="">— None —</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Time</label>
              <input className="form-input" value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} placeholder="12:30" />
            </div>
            <div className="form-row">
              <label className="form-label">Field</label>
              <input className="form-input" value={form.field} onChange={e => setForm(f => ({ ...f, field: e.target.value }))} placeholder="Field 1A" />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Referee</label>
            <select className="form-select" value={form.refereeId} onChange={e => setForm(f => ({ ...f, refereeId: e.target.value }))}>
              <option value="">— None —</option>
              {referees.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editId ? '💾 Save' : '+ Add Match'}</button>
            {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">All Matches ({matches.length})</div>
        {matches.length === 0 ? <p style={{ color: 'var(--muted)' }}>No matches yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Time</th><th>Match</th><th>Group</th><th>Field</th><th>Score</th><th>Actions</th></tr></thead>
            <tbody>
              {matches.map(m => {
                const ht = teamMap[m.homeTeamId];
                const at = teamMap[m.awayTeamId];
                const g = groupMap[m.groupId];
                return (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{m.scheduledTime || '—'}</td>
                    <td><strong>{ht?.flagEmoji} {ht?.name} vs {at?.flagEmoji} {at?.name}</strong></td>
                    <td>{g?.name || '—'}</td>
                    <td>{m.field || '—'}</td>
                    <td>{m.homeScore !== null ? `${m.homeScore}–${m.awayScore}` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(m.id); setForm({ homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, groupId: m.groupId || '', scheduledTime: m.scheduledTime || '', field: m.field || '', refereeId: m.refereeId || '', phase: m.phase || 'group' }); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑</button>
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
