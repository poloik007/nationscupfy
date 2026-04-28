'use client';
import { useState } from 'react';

export default function MyTeamTab({ teams, groups, matches }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));

  function search() {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found = teams.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.players || []).some(p => p.toLowerCase().includes(q))
    );
    setResults(found);
  }

  function handleKey(e) {
    if (e.key === 'Enter') search();
  }

  function getTeamMatches(teamId) {
    return matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
  }

  function getTeamName(id) {
    const t = teams.find(t => t.id === id);
    return t ? `${t.flagEmoji || ''} ${t.name}` : '?';
  }

  return (
    <div>
      <div className="search-box">
        <input
          id="myteam-search-input"
          className="search-input"
          placeholder="Search your name or team…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <button id="myteam-search-btn" className="search-btn" onClick={search}>SEARCH</button>
      </div>

      {results === null && (
        <div className="empty-state">
          <div className="icon">👕</div>
          <p>Enter your name or team to find your schedule.</p>
        </div>
      )}

      {results !== null && results.length === 0 && (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>No team or player found for &ldquo;{query}&rdquo;.</p>
        </div>
      )}

      {results && results.map(team => {
        const group = team.groupId ? groupMap[team.groupId] : null;
        const teamMatches = getTeamMatches(team.id);
        return (
          <div key={team.id} className="team-card">
            <div className="team-card-header">
              <span className="team-flag">{team.flagEmoji || '🏳'}</span>
              <div>
                <div className="team-name">{team.name}</div>
                {group && <div className="team-group">{group.name} · {group.phase}</div>}
              </div>
            </div>

            {(team.players || []).length > 0 && (
              <div className="team-players">
                <h4>Players</h4>
                <div className="player-list">
                  {team.players.map((p, i) => (
                    <span key={i} className="player-pill">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {teamMatches.length > 0 && (
              <div className="team-players">
                <h4>Matches</h4>
                {teamMatches.map(m => {
                  const isHome = m.homeTeamId === team.id;
                  const opp = isHome ? getTeamName(m.awayTeamId) : getTeamName(m.homeTeamId);
                  const score = m.homeScore !== null
                    ? `${m.homeScore} – ${m.awayScore}`
                    : m.scheduledTime || 'TBD';
                  return (
                    <div key={m.id} className="info-row" style={{ fontSize: '0.88rem' }}>
                      <span className="info-row-icon">⚽</span>
                      <span>{isHome ? 'vs' : '@'} {opp} &nbsp;·&nbsp; <strong>{score}</strong> &nbsp;{m.field && `· ${m.field}`}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
