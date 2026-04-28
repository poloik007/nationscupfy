export default function ScheduleTab({ teams, groups, matches, referees }) {
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));
  const refereeMap = Object.fromEntries(referees.map(r => [r.id, r]));

  // Group matches by scheduledTime (or "TBD")
  const grouped = {};
  matches.forEach(m => {
    const key = m.scheduledTime || 'TBD';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  const timeKeys = Object.keys(grouped).sort();

  if (matches.length === 0) return (
    <div className="empty-state"><div className="icon">📅</div><p>No matches scheduled yet.</p></div>
  );

  return (
    <div>
      {timeKeys.map(time => (
        <div key={time} className="schedule-group">
          <div className="schedule-group-title">🕐 {time}</div>
          {grouped[time].map(m => {
            const ht = teamMap[m.homeTeamId];
            const at = teamMap[m.awayTeamId];
            const group = m.groupId ? groupMap[m.groupId] : null;
            const ref = m.refereeId ? refereeMap[m.refereeId] : null;
            if (!ht || !at) return null;

            return (
              <div key={m.id} className="match-card">
                <div className="match-meta">
                  {group && <span className="match-pill">{group.name}</span>}
                  {m.field && <span className="match-pill field">📍 {m.field}</span>}
                  {ref && <span className="match-pill">🎽 {ref.name}</span>}
                  <span className="match-pill" style={{
                    background: m.status === 'finished' ? '#e8f5e9' : m.status === 'live' ? '#fff3e0' : undefined,
                    color: m.status === 'finished' ? '#2e7d32' : m.status === 'live' ? '#e65100' : undefined,
                  }}>
                    {m.status === 'finished' ? '✅ Final' : m.status === 'live' ? '🔴 Live' : '🕐 Upcoming'}
                  </span>
                </div>

                <div className="match-teams">
                  <div className="match-team">
                    <span>{ht.flagEmoji || '🏳'}</span>
                    <span>{ht.name}</span>
                  </div>
                  <div className={`match-score-box${m.homeScore === null ? ' upcoming' : ''}`}>
                    {m.homeScore !== null
                      ? <>{m.homeScore}<span className="match-score-sep">–</span>{m.awayScore}</>
                      : 'vs'
                    }
                  </div>
                  <div className="match-team away">
                    <span>{at.flagEmoji || '🏳'}</span>
                    <span>{at.name}</span>
                  </div>
                </div>

                {(m.scorers || []).length > 0 && (
                  <div className="scorers-row">
                    ⚽ {m.scorers.map((s, i) => {
                      const st = teamMap[s.teamId];
                      return <span key={i}>{st?.flagEmoji} {s.playerName} ({s.goals}){i < m.scorers.length - 1 ? ', ' : ''}</span>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
