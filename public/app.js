import { auth, db, ADMIN_EMAIL, actionCodeSettings, firebaseHelpers } from "./firebase-init.js";

const {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
} = firebaseHelpers;

const path = window.location.pathname;

if (path.endsWith("admin.html")) {
  mountAdmin();
} else {
  mountPublicDashboard();
}

function mountAdmin() {
  const sendLinkForm = document.getElementById("sendLinkForm");
  const emailInput = document.getElementById("emailInput");
  const authStatus = document.getElementById("authStatus");
  const adminPanel = document.getElementById("adminPanel");
  const logoutBtn = document.getElementById("logoutBtn");

  if (isSignInWithEmailLink(auth, window.location.href)) {
    const email = window.localStorage.getItem("emailForSignIn") || window.prompt("Confirm your admin email");
    if (email) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          authStatus.textContent = "Logged in successfully.";
        })
        .catch((err) => {
          authStatus.textContent = `Login failed: ${err.message}`;
        });
    }
  }

  sendLinkForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      authStatus.textContent = "Only configured admin email is allowed.";
      return;
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
    authStatus.textContent = "Magic link sent. Check your email inbox.";
    sendLinkForm.reset();
  });

  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
  });

  onAuthStateChanged(auth, async (user) => {
    const allowed = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    adminPanel.classList.toggle("hidden", !allowed);
    document.getElementById("authCard").classList.toggle("hidden", !!allowed);

    if (allowed) {
      authStatus.textContent = `Logged in as ${user.email}`;
      wireAdminForms();
      await loadRecentMatches();
    }
  });
}

function wireAdminForms() {
  const tournamentForm = document.getElementById("tournamentForm");
  const teamForm = document.getElementById("teamForm");
  const playerForm = document.getElementById("playerForm");
  const groupForm = document.getElementById("groupForm");
  const matchForm = document.getElementById("matchForm");
  const scoreForm = document.getElementById("scoreForm");

  tournamentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = "main";
    await setDoc(doc(db, "tournaments", id), {
      name: getVal("tournamentName"),
      season: getVal("tournamentSeason"),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    alert("Tournament saved");
  });

  teamForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "teams"), {
      tournamentId: "main",
      name: getVal("teamName"),
      code: getVal("teamCode").toUpperCase(),
      createdAt: serverTimestamp(),
    });
    teamForm.reset();
  });

  playerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "players"), {
      tournamentId: "main",
      name: getVal("playerName"),
      teamCode: getVal("playerTeam").toUpperCase(),
      number: Number(getVal("playerNumber")),
      createdAt: serverTimestamp(),
    });
    playerForm.reset();
  });

  groupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = `${getVal("groupName").toUpperCase()}_${getVal("groupTeamCode").toUpperCase()}`;
    await setDoc(doc(db, "groups", docId), {
      tournamentId: "main",
      groupName: getVal("groupName").toUpperCase(),
      teamCode: getVal("groupTeamCode").toUpperCase(),
      played: Number(getVal("played")),
      won: Number(getVal("won")),
      draw: Number(getVal("draw")),
      lost: Number(getVal("lost")),
      gf: Number(getVal("gf")),
      ga: Number(getVal("ga")),
      pts: Number(getVal("pts")),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    groupForm.reset();
  });

  matchForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "matches"), {
      tournamentId: "main",
      homeTeam: getVal("homeTeam").toUpperCase(),
      awayTeam: getVal("awayTeam").toUpperCase(),
      groupName: getVal("matchGroup").toUpperCase(),
      kickoff: new Date(getVal("kickoff")).toISOString(),
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    matchForm.reset();
    await loadRecentMatches();
  });

  scoreForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = getVal("matchId");
    await updateDoc(doc(db, "matches", id), {
      homeScore: Number(getVal("homeScore")),
      awayScore: Number(getVal("awayScore")),
      status: getVal("matchStatus"),
      updatedAt: serverTimestamp(),
    });
    scoreForm.reset();
    await loadRecentMatches();
  });
}

async function loadRecentMatches() {
  const ul = document.getElementById("recentMatches");
  if (!ul) return;
  ul.innerHTML = "";
  const q = query(collection(db, "matches"), where("tournamentId", "==", "main"), orderBy("kickoff", "desc"), limit(10));
  const snap = await getDocs(q);
  snap.forEach((m) => {
    const li = document.createElement("li");
    const d = m.data();
    li.textContent = `${m.id} | ${d.homeTeam} ${d.homeScore}-${d.awayScore} ${d.awayTeam} | ${d.status}`;
    ul.appendChild(li);
  });
}

async function mountPublicDashboard() {
  const title = document.getElementById("title");
  const subtitle = document.getElementById("subtitle");
  const groupsWrap = document.getElementById("groupsWrap");
  const matchesWrap = document.getElementById("matchesWrap");

  const tournament = await getDoc(doc(db, "tournaments", "main"));
  if (tournament.exists()) {
    const t = tournament.data();
    title.textContent = `${t.name || "Tournament"} Dashboard`;
    subtitle.textContent = `Season ${t.season || "-"} · public link`;
  }

  const groupSnap = await getDocs(query(collection(db, "groups"), where("tournamentId", "==", "main"), orderBy("groupName"), orderBy("pts", "desc")));
  const grouped = {};
  groupSnap.forEach((g) => {
    const d = g.data();
    grouped[d.groupName] = grouped[d.groupName] || [];
    grouped[d.groupName].push(d);
  });

  groupsWrap.innerHTML = "";
  Object.keys(grouped).forEach((name) => {
    const table = document.createElement("table");
    table.innerHTML = `
      <caption><strong>Group ${name}</strong></caption>
      <thead>
        <tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>Pts</th></tr>
      </thead>
      <tbody>
      ${grouped[name]
        .map((r) => `<tr><td>${r.teamCode}</td><td>${r.played}</td><td>${r.won}</td><td>${r.draw}</td><td>${r.lost}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.pts}</td></tr>`)
        .join("")}
      </tbody>
    `;
    groupsWrap.appendChild(table);
  });

  const matchesSnap = await getDocs(query(collection(db, "matches"), where("tournamentId", "==", "main"), orderBy("kickoff", "asc")));
  matchesWrap.innerHTML = "";
  matchesSnap.forEach((m) => {
    const d = m.data();
    const div = document.createElement("div");
    div.className = "match";
    const when = new Date(d.kickoff).toLocaleString();
    div.innerHTML = `
      <div><strong>Group ${d.groupName}</strong> · ${d.status}</div>
      <div>${d.homeTeam} <strong>${d.homeScore}</strong> - <strong>${d.awayScore}</strong> ${d.awayTeam}</div>
      <div class="muted">${when}</div>
    `;
    matchesWrap.appendChild(div);
  });
}

function getVal(id) {
  return document.getElementById(id).value.trim();
}
