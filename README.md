# NationsCupfy (Tournify-style lightweight clone)

This project is a **single-admin tournament manager** powered by **Firebase Authentication (email magic link)** and **Cloud Firestore**.

It is intentionally simple (not full SaaS):
- One admin email can sign in with magic link.
- Admin can create one tournament, add teams and players, create group standings rows, create/update matches and scores.
- Public dashboard is read-only and displays tournament overview, group phase table, and match list.

## 1) Firebase setup

1. Create a Firebase project.
2. Enable **Authentication > Sign-in method > Email link (passwordless sign-in)**.
3. Add your hosting URL in **Authentication > Settings > Authorized domains**.
4. Create a Firestore database (production mode).
5. In Firebase console, get your web config object.

## 2) Configure the app

Open `public/firebase-init.js` and replace:
- `firebaseConfig` values
- `ADMIN_EMAIL` with the single admin email you want to allow

Also update `actionCodeSettings.url` to your admin page URL (e.g. `https://your-domain.com/admin.html`).

## 3) Firestore security rules

Use `firebase.rules` as your Firestore rules.

> Important: replace `admin@yourdomain.com` inside `firebase.rules` with the same admin email set in `public/firebase-init.js`.

These rules provide:
- Public read access (dashboard is public)
- Write access only to authenticated admin email

## 4) Run locally

Because this uses ES modules from CDN, any static server works.

Example with Python:

```bash
python3 -m http.server 5500
```

Then open:
- Public dashboard: `http://localhost:5500/public/index.html`
- Admin panel: `http://localhost:5500/public/admin.html`

## 5) Deploy

You can deploy with Firebase Hosting, Netlify, Vercel static output, or any static host.

## Data model

Top-level collections:
- `tournaments` (single document used by this UI)
- `teams`
- `players`
- `groups`
- `matches`

Each document contains `tournamentId` so data stays scoped to one tournament.

## Notes

- This is a starter implementation; you can later add knockout brackets, live updates UX, media uploads, and richer analytics.
- Keep the admin email private and do not expose write credentials beyond Firebase Auth.
