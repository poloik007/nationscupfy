'use client';
import { useState } from 'react';

export default function RefereesTab({ referees }) {
  const [query, setQuery] = useState('');

  const filtered = referees.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="referee-search">
        <input
          id="referee-search-input"
          className="search-input"
          placeholder="Find a referee…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button id="referee-search-btn" className="search-btn">SEARCH</button>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><div className="icon">🎽</div><p>No referees found.</p></div>
      )}

      <div className="referee-grid">
        {filtered.map(r => (
          <div key={r.id} className="referee-card">
            <div>{r.name}</div>
            {r.assignedField && <div className="ref-field">📍 {r.assignedField}</div>}
            {r.role === 'stats' && <div className="ref-role-stats">Stats keeper</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
