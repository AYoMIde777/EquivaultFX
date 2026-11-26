import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, Lock } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { supabase } from '../lib/supabase';

export default function AuthPage({ session }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  // modes: 'login' | 'signup' | 'forgot' | 'recovery'
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery')) {
      setMode('recovery');
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session && mode !== 'recovery') {
      navigate('/dashboard', { replace: true });
    }
  }, [session, mode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', text: '' });
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const redirectTo = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });
        if (error) throw error;
        setAlert({
          type: 'success',
          text: 'Password reset link sent to your email. Open the link to set a new password.',
        });
      } else if (mode === 'recovery') {
        if (password.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword('');
        setConfirmPassword('');
        setAlert({
          type: 'success',
          text: 'Password updated successfully. Redirecting to your dashboard...',
        });
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      } else if (mode === 'signup') {
        const cleanUsername =
          username.trim() || (email.includes('@') ? email.split('@')[0] : '');
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              username: cleanUsername,
            },
          },
        });
        if (error) throw error;

        if (data?.user?.id) {
          await supabase
            .from('profiles')
            .upsert(
              {
                id: data.user.id,
                email: email.trim(),
                full_name: fullName.trim(),
                username: cleanUsername || null,
              },
              { onConflict: 'id' }
            );
        }

        setAlert({
          type: 'success',
          text: 'Account created! Check your inbox if email confirmation is required, or log in.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Authentication failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ marginBottom: '18px' }}>
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </div>

        <BrandLogo />

        {mode === 'login' && (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-sub">
              Sign in to access your EquivaultFX trading terminal and wallets.
            </p>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h2 className="auth-title">Create Trading Account</h2>
            <p className="auth-sub">
              Open your EquivaultFX account for live markets and liquidity tiers.
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2 className="auth-title">Reset Your Password</h2>
            <p className="auth-sub">
              Enter your account email and we will send you a password recovery link.
            </p>
          </>
        )}

        {mode === 'recovery' && (
          <>
            <h2 className="auth-title">Set New Password</h2>
            <p className="auth-sub">
              Choose a new password for your EquivaultFX account.
            </p>
          </>
        )}

        {alert.text && (
          <div className={`auth-alert ${alert.type === 'error' ? 'error' : 'success'}`}>
            {alert.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div className="form-group">
              <label className="form-label">
                <Mail size={13} style={{ marginRight: '5px', verticalAlign: '-2px' }} />
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'recovery') && (
            <div className="form-group">
              <label className="form-label">
                <Lock size={13} style={{ marginRight: '5px', verticalAlign: '-2px' }} />
                {mode === 'recovery' ? 'New Password' : 'Password'}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {mode === 'recovery' && (
            <div className="form-group">
              <label className="form-label">
                <KeyRound size={13} style={{ marginRight: '5px', verticalAlign: '-2px' }} />
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => {
                  setMode('forgot');
                  setAlert({ type: '', text: '' });
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-crimson"
            style={{ width: '100%' }}
          >
            {loading
              ? 'Please wait...'
              : mode === 'forgot'
                ? 'Send Reset Link'
                : mode === 'recovery'
                  ? 'Update Password'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Log In'}
          </button>
        </form>

        <div className="auth-switch-row">
          {mode === 'login' && (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => {
                  setMode('signup');
                  setAlert({ type: '', text: '' });
                }}
              >
                Open Account
              </button>
            </span>
          )}

          {mode === 'signup' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => {
                  setMode('login');
                  setAlert({ type: '', text: '' });
                }}
              >
                Log In
              </button>
            </span>
          )}

          {(mode === 'forgot' || mode === 'recovery') && (
            <span>
              Remembered your password?{' '}
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => {
                  setMode('login');
                  setAlert({ type: '', text: '' });
                }}
              >
                Back to Log In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}