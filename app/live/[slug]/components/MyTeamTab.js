'use client';
import { useState } from 'react';

export default function MyTeamTab({ teams, groups, matches }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));

  function getTeamMatches(teamId) {
    return matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
  }

  function getTeamName(id) {
    const t = teams.find(t => t.id === id);
    return t ? `${t.flagEmoji || ''} ${t.name}` : '?';
  }

  const filteredTeams = query.trim() === '' 
    ? teams 
    : teams.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        (t.players || []).some(p => p.toLowerCase().includes(query.toLowerCase()))
      );

  const selectedTeam = teams.find(t => t.id === selectedId);

  return (
    <div>
      <div className="search-box">
        <input
          id="myteam-search-input"
          className="search-input"
          placeholder="Search your name or team…"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedId(null); }}
        />
        <button id="myteam-search-btn" className="search-btn">SEARCH</button>
      </div>

      {filteredTeams.length === 0 && query.trim() !== '' && (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>No team or player found for &ldquo;{query}&rdquo;.</p>
        </div>
      )}

      {/* Team Grid */}
      {!selectedTeam && (
        <div className="team-grid">
          {filteredTeams.map(team => {
            const group = team.groupId ? groupMap[team.groupId] : null;
            return (
              <button 
                key={team.id} 
                className="team-compact-card"
                onClick={() => setSelectedId(team.id)}
              >
                <div className="team-compact-flag">{team.flagEmoji || '🏳'}</div>
                <div className="team-compact-info">
                  <div className="team-compact-name">{team.name}</div>
                  <div className="team-compact-category">
                    {group ? group.name : 'Nations Cup'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Team Details */}
      {selectedTeam && (
        <>
          <button className="back-btn" onClick={() => setSelectedId(null)}>
            ← Back to all teams
          </button>
          
          <div className="team-card">
            <div className="team-card-header">
              <span className="team-flag">{selectedTeam.flagEmoji || '🏳'}</span>
              <div>
                <div className="team-name">{selectedTeam.name}</div>
                {selectedTeam.groupId && (
                  <div className="team-group">
                    {groupMap[selectedTeam.groupId]?.name} · {groupMap[selectedTeam.groupId]?.phase}
                  </div>
                )}
              </div>
            </div>

            {(selectedTeam.players || []).length > 0 && (
              <div className="team-players">
                <h4>Players</h4>
                <div className="player-list">
                  {selectedTeam.players.map((p, i) => (
                    <span key={i} className="player-pill">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {getTeamMatches(selectedTeam.id).length > 0 && (
              <div className="team-players">
                <h4>Matches</h4>
                {getTeamMatches(selectedTeam.id).map(m => {
                  const isHome = m.homeTeamId === selectedTeam.id;
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
        </>
      )}
    </div>
  );
}
