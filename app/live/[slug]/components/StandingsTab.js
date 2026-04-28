'use client';
import { useState } from 'react';
import { calculateStandings } from '@/lib/firestore';

const PHASES = [
  { id: 'group', label: 'Group Phase' },
  { id: 'survival', label: 'Survival Play-offs' },
  { id: 'challenger', label: 'Challenger Play-offs' },
  { id: 'final', label: 'Final Phase' },
];

export default function StandingsTab({ teams, groups, matches }) {
  const [phase, setPhase] = useState('group');
  const [openFixtures, setOpenFixtures] = useState({});

  const phaseGroups = groups.filter(g => g.phase === phase);

  function toggleFixtures(groupId) {
    setOpenFixtures(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function getTeam(id) { return teams.find(t => t.id === id); }

  function getGroupMatches(groupId) {
    return matches.filter(m => m.groupId === groupId);
  }

  if (groups.length === 0) return (
    <div className="empty-state"><div className="icon">📊</div><p>No groups set up yet.</p></div>
  );

  return (
    <div>
      <div className="phase-tabs">
        {PHASES.map(p => (
          <button
            key={p.id}
            id={`phase-tab-${p.id}`}
            className={`phase-tab${phase === p.id ? ' active' : ''}`}
            onClick={() => setPhase(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {phaseGroups.length === 0 && (
        <div className="empty-state"><div className="icon">📋</div><p>No groups in this phase yet.</p></div>
      )}

      {phaseGroups.map(group => {
        const groupTeams = teams.filter(t => t.groupId === group.id);
        const rows = phase === 'group' ? calculateStandings(groupTeams, matches, group.id) : null;
        const groupMatches = getGroupMatches(group.id);
        const fixturesOpen = openFixtures[group.id];

        return (
          <div key={group.id} className="group-section">
            <div className="group-header">
              <span>{group.name}</span>
            </div>

            {rows && (
              <div style={{ overflowX: 'auto' }}>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="col-team">Team</th>
                      <th>PLD</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th className="col-pts">PTS</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>GD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.team.id}>
                        <td>{idx + 1}</td>
                        <td className="col-team">
                          <div className="team-cell">
                            <span className="flag">{row.team.flagEmoji || '🏳'}</span>
                            <span>{row.team.name}</span>
                          </div>
                        </td>
                        <td>{row.pld}</td>
                        <td>{row.w}</td>
                        <td>{row.d}</td>
                        <td>{row.l}</td>
                        <td className="col-pts">{row.pts}</td>
                        <td>{row.gf}</td>
                        <td>{row.ga}</td>
                        <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Knockout: just list matches */}
            {!rows && groupMatches.length > 0 && (
              <div style={{ padding: '12px 0' }}>
                {groupMatches.map(m => {
                  const ht = getTeam(m.homeTeamId);
                  const at = getTeam(m.awayTeamId);
                  if (!ht || !at) return null;
                  return (
                    <div key={m.id} className="match-card">
                      <div className="match-teams">
                        <div className="match-team">
                          <span>{ht.flagEmoji || '🏳'}</span><span>{ht.name}</span>
                        </div>
                        <div className={`match-score-box${m.homeScore === null ? ' upcoming' : ''}`}>
                          {m.homeScore !== null ? <>{m.homeScore}<span className="match-score-sep">–</span>{m.awayScore}</> : m.scheduledTime || 'TBD'}
                        </div>
                        <div className="match-team away">
                          <span>{at.flagEmoji || '🏳'}</span><span>{at.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="fixtures-toggle" onClick={() => toggleFixtures(group.id)}>
              <span>Fixtures {group.name}</span>
              <span>{fixturesOpen ? '▲' : '▼'}</span>
            </button>

            {fixturesOpen && (
              <div style={{ padding: '12px 0 4px' }}>
                {groupMatches.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.88rem', padding: '8px 0' }}>No fixtures yet.</p>}
                {groupMatches.map(m => {
                  const ht = getTeam(m.homeTeamId);
                  const at = getTeam(m.awayTeamId);
                  if (!ht || !at) return null;
                  return (
                    <div key={m.id} className="match-card">
                      <div className="match-meta">
                        {m.scheduledTime && <span className="match-pill">⏰ {m.scheduledTime}</span>}
                        {m.field && <span className="match-pill field">📍 {m.field}</span>}
                      </div>
                      <div className="match-teams">
                        <div className="match-team">
                          <span>{ht.flagEmoji || '🏳'}</span><span>{ht.name}</span>
                        </div>
                        <div className={`match-score-box${m.homeScore === null ? ' upcoming' : ''}`}>
                          {m.homeScore !== null ? <>{m.homeScore}<span className="match-score-sep">–</span>{m.awayScore}</> : 'vs'}
                        </div>
                        <div className="match-team away">
                          <span>{at.flagEmoji || '🏳'}</span><span>{at.name}</span>
                        </div>
                      </div>
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
