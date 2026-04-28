'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getGroups, createGroup, updateGroup, deleteGroup } from '@/lib/firestore';

const PHASES = ['group', 'survival', 'challenger', 'final'];
const EMPTY = { name: '', phase: 'group' };

export default function GroupsAdmin() {
  const { id } = useParams();
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  async function load() { setGroups(await getGroups(id)); }
  useEffect(() => { load(); }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (editId) { await updateGroup(id, editId, form); setEditId(null); }
    else await createGroup(id, form);
    setForm(EMPTY); load();
  }

  async function handleDelete(gid) {
    if (!confirm('Delete this group? Matches in it will become ungrouped.')) return;
    await deleteGroup(id, gid); load();
  }

  return (
    <div>
      <h1 className="admin-page-title">🗂 Groups</h1>
      <div className="admin-card">
        <div className="admin-card-title">{editId ? 'Edit Group' : 'Add Group'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-row">
              <label className="form-label">Group Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Group A" required />
            </div>
            <div className="form-row">
              <label className="form-label">Phase</label>
              <select className="form-select" value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}>
                {PHASES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editId ? '💾 Save' : '+ Add Group'}</button>
            {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">All Groups ({groups.length})</div>
        {groups.length === 0 ? <p style={{ color: 'var(--muted)' }}>No groups yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Phase</th><th>Actions</th></tr></thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id}>
                  <td><strong>{g.name}</strong></td>
                  <td><span className="match-pill">{g.phase}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(g.id); setForm({ name: g.name, phase: g.phase }); }}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
