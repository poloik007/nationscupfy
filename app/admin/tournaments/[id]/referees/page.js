'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getReferees, createReferee, updateReferee, deleteReferee } from '@/lib/firestore';

const EMPTY = { name: '', assignedField: '', role: 'referee' };

export default function RefereesAdmin() {
  const { id } = useParams();
  const [referees, setReferees] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  async function load() { setReferees(await getReferees(id)); }
  useEffect(() => { load(); }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (editId) { await updateReferee(id, editId, form); setEditId(null); }
    else await createReferee(id, form);
    setForm(EMPTY); load();
  }

  async function handleDelete(rid) {
    if (!confirm('Delete this referee?')) return;
    await deleteReferee(id, rid); load();
  }

  return (
    <div>
      <h1 className="admin-page-title">🎽 Referees</h1>
      <div className="admin-card">
        <div className="admin-card-title">{editId ? 'Edit Referee' : 'Add Referee'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row-3">
            <div className="form-row">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" required />
            </div>
            <div className="form-row">
              <label className="form-label">Assigned Field</label>
              <input className="form-input" value={form.assignedField} onChange={e => setForm(f => ({ ...f, assignedField: e.target.value }))} placeholder="1A" />
            </div>
            <div className="form-row">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="referee">Referee</option>
                <option value="stats">Stats Keeper</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editId ? '💾 Save' : '+ Add Referee'}</button>
            {editId && <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">All Referees ({referees.length})</div>
        {referees.length === 0 ? <p style={{ color: 'var(--muted)' }}>No referees yet.</p> : (
          <div className="referee-grid">
            {referees.map(r => (
              <div key={r.id} className="referee-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                {r.assignedField && <div className="ref-field">📍 {r.assignedField}</div>}
                {r.role === 'stats' && <div className="ref-role-stats">Stats keeper</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(r.id); setForm({ name: r.name, assignedField: r.assignedField || '', role: r.role || 'referee' }); }}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
