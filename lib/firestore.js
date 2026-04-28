import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Tournaments ──────────────────────────────────────────────
export async function getAllTournaments() {
  const snap = await getDocs(query(collection(db, 'tournaments'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTournamentBySlug(slug) {
  const snap = await getDocs(query(collection(db, 'tournaments'), where('slug', '==', slug)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function createTournament(data) {
  return addDoc(collection(db, 'tournaments'), { ...data, createdAt: serverTimestamp() });
}

export async function updateTournament(id, data) {
  return updateDoc(doc(db, 'tournaments', id), data);
}

export async function deleteTournament(id) {
  return deleteDoc(doc(db, 'tournaments', id));
}

// ── Teams ─────────────────────────────────────────────────────
export async function getTeams(tournamentId) {
  const snap = await getDocs(query(collection(db, 'tournaments', tournamentId, 'teams'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createTeam(tournamentId, data) {
  return addDoc(collection(db, 'tournaments', tournamentId, 'teams'), data);
}

export async function updateTeam(tournamentId, teamId, data) {
  return updateDoc(doc(db, 'tournaments', tournamentId, 'teams', teamId), data);
}

export async function deleteTeam(tournamentId, teamId) {
  return deleteDoc(doc(db, 'tournaments', tournamentId, 'teams', teamId));
}

// ── Groups ────────────────────────────────────────────────────
export async function getGroups(tournamentId) {
  const snap = await getDocs(query(collection(db, 'tournaments', tournamentId, 'groups'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createGroup(tournamentId, data) {
  return addDoc(collection(db, 'tournaments', tournamentId, 'groups'), data);
}

export async function updateGroup(tournamentId, groupId, data) {
  return updateDoc(doc(db, 'tournaments', tournamentId, 'groups', groupId), data);
}

export async function deleteGroup(tournamentId, groupId) {
  return deleteDoc(doc(db, 'tournaments', tournamentId, 'groups', groupId));
}

// ── Matches ───────────────────────────────────────────────────
export async function getMatches(tournamentId) {
  const snap = await getDocs(query(collection(db, 'tournaments', tournamentId, 'matches'), orderBy('scheduledTime')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createMatch(tournamentId, data) {
  return addDoc(collection(db, 'tournaments', tournamentId, 'matches'), { ...data, status: 'upcoming', homeScore: null, awayScore: null, scorers: [] });
}

export async function updateMatch(tournamentId, matchId, data) {
  return updateDoc(doc(db, 'tournaments', tournamentId, 'matches', matchId), data);
}

export async function deleteMatch(tournamentId, matchId) {
  return deleteDoc(doc(db, 'tournaments', tournamentId, 'matches', matchId));
}

export async function updateScore(tournamentId, matchId, homeScore, awayScore, scorers = []) {
  return updateDoc(doc(db, 'tournaments', tournamentId, 'matches', matchId), {
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    scorers,
    status: 'finished',
  });
}

// ── Referees ──────────────────────────────────────────────────
export async function getReferees(tournamentId) {
  const snap = await getDocs(query(collection(db, 'tournaments', tournamentId, 'referees'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createReferee(tournamentId, data) {
  return addDoc(collection(db, 'tournaments', tournamentId, 'referees'), data);
}

export async function updateReferee(tournamentId, refereeId, data) {
  return updateDoc(doc(db, 'tournaments', tournamentId, 'referees', refereeId), data);
}

export async function deleteReferee(tournamentId, refereeId) {
  return deleteDoc(doc(db, 'tournaments', tournamentId, 'referees', refereeId));
}

// ── Real-time subscriptions ───────────────────────────────────
export function subscribeTournamentBySlug(slug, callback) {
  const q = query(collection(db, 'tournaments'), where('slug', '==', slug));
  return onSnapshot(q, snap => {
    if (snap.empty) { callback(null); return; }
    const d = snap.docs[0];
    callback({ id: d.id, ...d.data() });
  });
}

export function subscribeTeams(tournamentId, callback) {
  const q = query(collection(db, 'tournaments', tournamentId, 'teams'), orderBy('name'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeGroups(tournamentId, callback) {
  const q = query(collection(db, 'tournaments', tournamentId, 'groups'), orderBy('name'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeMatches(tournamentId, callback) {
  const q = query(collection(db, 'tournaments', tournamentId, 'matches'), orderBy('scheduledTime'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function subscribeReferees(tournamentId, callback) {
  const q = query(collection(db, 'tournaments', tournamentId, 'referees'), orderBy('name'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// ── Standings calculation ──────────────────────────────────────
export function calculateStandings(teams, matches, groupId) {
  const stats = {};
  teams.forEach(team => {
    stats[team.id] = { team, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  });
  matches
    .filter(m => m.groupId === groupId && m.homeScore !== null && m.awayScore !== null)
    .forEach(m => {
      const h = stats[m.homeTeamId];
      const a = stats[m.awayTeamId];
      if (!h || !a) return;
      h.pld++; a.pld++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { h.w++; a.l++; }
      else if (m.homeScore < m.awayScore) { a.w++; h.l++; }
      else { h.d++; a.d++; }
    });
  return Object.values(stats)
    .map(s => ({ ...s, pts: s.w * 3 + s.d, gd: s.gf - s.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
}
