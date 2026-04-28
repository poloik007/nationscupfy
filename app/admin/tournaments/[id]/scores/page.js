'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMatches, getTeams, updateScore } from '@/lib/firestore';

export default function ScoresAdmin() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [scorers, setScorers] = useState({});
  const [saved, setSaved] = useState({});
  const [filter, setFilter] = useState('all');

  async function load() {
    const [m, t] = await Promise.all([getMatches(id), getTeams(id)]);
    setMatches(m); setTeams(t);
    const s = {}; const sc = {};
    m.forEach(match => {
      s[match.id] = { home: match.homeScore ?? '', away: match.awayScore ?? '' };
      sc[match.id] = match.scorers || [];
    });
    setScores(s); setScorers(sc);
  }
  useEffect(() => { load(); }, [id]);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  async function handleSave(match) {
    const s = scores[match.id] || {};
    if (s.home === '' || s.away === '') return;
    await updateScore(id, match.id, s.home, s.away, scorers[match.id] || []);
    setSaved(sv => ({ ...sv, [match.id]: true }));
    setTimeout(() => setSaved(sv => ({ ...sv, [match.id]: false })), 2000);
  }

  function addScorer(matchId, teamId) {
    setScorers(sc => ({
      ...sc,
      [matchId]: [...(sc[matchId] || []), { teamId, playerName: '', goals: 1 }],
    }));
  }

  function removeScorer(matchId, idx) {
    setScorers(sc => ({ ...sc, [matchId]: sc[matchId].filter((_, i) => i !== idx) }));
  }

  function updateScorer(matchId, idx, field, val) {
    setScorers(sc => {
      const arr = [...sc[matchId]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...sc, [matchId]: arr };
    });
  }

  const filtered = filter === 'finished'
    ? matches.filter(m => m.homeScore !== null)
    : filter === 'upcoming'
    ? matches.filter(m => m.homeScore === null)
    : matches;

  return (
    <div>
      <h1 className="admin-page-title">⚽ Enter Scores</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'upcoming', 'finished'].map(f => (
          <button key={f} className={`phase-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state"><div className="icon">⚽</div><p>No matches.</p></div>}

      {filtered.map(match => {
        const ht = teamMap[match.homeTeamId];
        const at = teamMap[match.awayTeamId];
        if (!ht || !at) return null;
        const s = scores[match.id] || { home: '', away: '' };
        const matchScorers = scorers[match.id] || [];

        return (
          <div key={match.id} className="score-match-card">
            <div className="score-teams">
              <div className="score-team-name">{ht.flagEmoji} {ht.name}</div>
              <div className="score-inputs">
                <input
                  className="score-input"
                  type="number" min="0"
                  value={s.home}
                  onChange={e => setScores(sc => ({ ...sc, [match.id]: { ...sc[match.id], home: e.target.value } }))}
                />
                <span className="score-sep">–</span>
                <input
                  className="score-input"
                  type="number" min="0"
                  value={s.away}
                  onChange={e => setScores(sc => ({ ...sc, [match.id]: { ...sc[match.id], away: e.target.value } }))}
                />
              </div>
              <div className="score-team-name away">{at.flagEmoji} {at.name}</div>
            </div>

            {match.scheduledTime && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 10 }}>⏰ {match.scheduledTime} {match.field && `· ${match.field}`}</p>}

            {/* Goal scorers */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>⚽ Goal Scorers</div>
              {matchScorers.map((sc, i) => {
                const st = teamMap[sc.teamId];
                const teamPlayers = teams.find(t => t.id === sc.teamId)?.players || [];
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                    <select className="form-select" style={{ flex: 1 }} value={sc.teamId} onChange={e => updateScorer(match.id, i, 'teamId', e.target.value)}>
                      <option value={ht.id}>{ht.flagEmoji} {ht.name}</option>
                      <option value={at.id}>{at.flagEmoji} {at.name}</option>
                    </select>
                    <input className="form-input" style={{ flex: 2 }} list={`players-${match.id}-${i}`}
                      value={sc.playerName} onChange={e => updateScorer(match.id, i, 'playerName', e.target.value)} placeholder="Player name" />
                    <datalist id={`players-${match.id}-${i}`}>
                      {teamPlayers.map((p, pi) => <option key={pi} value={p} />)}
                    </datalist>
                    <input className="score-input" type="number" min="1" max="20" value={sc.goals}
                      onChange={e => updateScorer(match.id, i, 'goals', Number(e.target.value))} />
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeScorer(match.id, i)}>✕</button>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => addScorer(match.id, ht.id)}>+ {ht.name}</button>
                <button className="btn btn-secondary btn-sm" onClick={() => addScorer(match.id, at.id)}>+ {at.name}</button>
              </div>
            </div>

            <button
              className={`btn ${saved[match.id] ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={() => handleSave(match)}
            >
              {saved[match.id] ? '✅ Saved!' : '💾 Save Score'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
