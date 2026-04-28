'use client';
import { useState, useEffect } from 'react';
import {
  subscribeTournamentBySlug, subscribeTeams, subscribeGroups,
  subscribeMatches, subscribeReferees,
} from '@/lib/firestore';
import Header from './Header';
import NavBar from './NavBar';
import InfoTab from './InfoTab';
import MyTeamTab from './MyTeamTab';
import StandingsTab from './StandingsTab';
import ScheduleTab from './ScheduleTab';
import RefereesTab from './RefereesTab';

export default function TournamentViewer({ slug }) {
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [referees, setReferees] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubs = [];
    const unsub1 = subscribeTournamentBySlug(slug, (t) => {
      setTournament(t);
      setLoading(false);
      if (t) {
        const u2 = subscribeTeams(t.id, setTeams);
        const u3 = subscribeGroups(t.id, setGroups);
        const u4 = subscribeMatches(t.id, setMatches);
        const u5 = subscribeReferees(t.id, setReferees);
        unsubs = [u2, u3, u4, u5];
      }
    });
    return () => { unsub1(); unsubs.forEach(u => u()); };
  }, [slug]);

  if (loading) return (
    <div className="loading-spinner"><div className="spinner" /></div>
  );

  if (!tournament) return (
    <div className="not-found">
      <h1>404</h1>
      <p>Tournament not found.</p>
    </div>
  );

  return (
    <div>
      <Header tournament={tournament} />
      <div className="nav-wrap">
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="content-wrap">
        <div className="content-card">
          {activeTab === 'info' && <InfoTab tournament={tournament} />}
          {activeTab === 'myteam' && <MyTeamTab teams={teams} groups={groups} matches={matches} />}
          {activeTab === 'standings' && <StandingsTab teams={teams} groups={groups} matches={matches} />}
          {activeTab === 'schedule' && <ScheduleTab teams={teams} groups={groups} matches={matches} referees={referees} />}
          {activeTab === 'referees' && <RefereesTab referees={referees} />}
        </div>
      </div>
    </div>
  );
}
