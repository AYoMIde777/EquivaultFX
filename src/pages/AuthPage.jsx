import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot' | 'recovery'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        setError('');
        setMessage('Enter your new password below to complete recovery.');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
          setError('Enter the email address linked to your account.');
          setLoading(false);
          return;
        }

        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: `${window.location.origin}/auth?reset=1`,
          }
        );

        if (resetErr) {
          setError(resetErr.message);
        } else {
          setMessage(
            'Password reset instructions sent. Check your inbox and spam folder.'
          );
        }
        setLoading(false);
        return;
      }

      if (mode === 'recovery') {
        if (password.length < 6) {
          setError('New password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        const { error: updErr } = await supabase.auth.updateUser({ password });
        if (updErr) {
          setError(updErr.message);
        } else {
          setMessage('Password updated successfully. Redirecting to terminal...');
          setTimeout(() => navigate('/dashboard'), 1000);
        }
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });
        if (signUpErr) {
          setError(signUpErr.message);
        } else {
          setMessage(
            'Account created. Check your email if confirmation is enabled, or log in.'
          );
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) {
          setError(signInErr.message);
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ marginBottom: '18px' }}>
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={15} /> Back to EquivaultFX
          </Link>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <BrandLogo />
          <h2 style={{ marginTop: '14px', fontSize: '22px' }}>
            {mode === 'signup' && 'Create Trading Account'}
            {mode === 'login' && 'Sign In to Terminal'}
            {mode === 'forgot' && 'Forgot Password'}
            {mode === 'recovery' && 'Set New Password'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {mode === 'signup' && 'Access live Forex, Crypto & Indices execution.'}
            {mode === 'login' && 'Enter your credentials to access your wallet & trades.'}
            {mode === 'forgot' && 'We will send a password recovery link to your email.'}
            {mode === 'recovery' && 'Choose a strong new password for your account.'}
          </p>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'recovery') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  {mode === 'recovery' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-inline-btn"
                    onClick={() => {
                      setError('');
                      setMessage('');
                      setMode('forgot');
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'recovery' && (
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-crimson"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Account'
              : mode === 'login'
              ? 'Log In'
              : mode === 'forgot'
              ? 'Send Reset Link'
              : 'Update Password'}
          </button>
        </form>

        <div className="auth-switch-row">
          {mode === 'login' && (
            <span>
              New to EquivaultFX?{' '}
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => {
                  setError('');
                  setMessage('');
                  setMode('signup');
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
                  setError('');
                  setMessage('');
                  setMode('login');
                }}
              >
                Log In
              </button>
            </span>
          )}
          {(mode === 'forgot' || mode === 'recovery') && (
            <button
              type="button"
              className="auth-inline-btn"
              onClick={() => {
                setError('');
                setMessage('');
                setMode('login');
              }}
            >
              Back to Log In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}