'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendMagicLink, completeMagicLinkSignIn, getAdminEmail, onAuthChange, isAdminUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setEmail(getAdminEmail());

    // Handle magic link return
    if (window.location.href.includes('oobCode')) {
      setCompleting(true);
      completeMagicLinkSignIn()
        .then(user => {
          if (user && isAdminUser(user)) {
            router.replace('/admin');
          } else {
            setError('This email is not authorized as admin.');
            setCompleting(false);
          }
        })
        .catch(err => {
          setError(err.message);
          setCompleting(false);
        });
    }

    // If already logged in, redirect
    const unsub = onAuthChange(user => {
      if (isAdminUser(user)) router.replace('/admin');
    });
    return () => unsub();
  }, [router]);

  async function handleSend() {
    setError('');
    setLoading(true);
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (completing) return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔐</div>
        <p>Signing you in…</p>
        <div style={{ marginTop: 20 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏆</div>
        <h1 className="login-title">Admin Access</h1>
        <p className="login-subtitle">We&apos;ll send a magic link to your email.</p>

        {error && <div className="alert alert-error">{error}</div>}

        {sent ? (
          <div className="login-success">
            ✅ Magic link sent to <strong>{email}</strong>.<br />
            Check your inbox and click the link to sign in.
          </div>
        ) : (
          <>
            <div className="form-row" style={{ textAlign: 'left' }}>
              <label className="form-label" htmlFor="admin-email-input">Email</label>
              <input
                id="admin-email-input"
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <button
              id="admin-send-magic-link-btn"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={handleSend}
              disabled={loading || !email}
            >
              {loading ? 'Sending…' : '✉️ Send Magic Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
