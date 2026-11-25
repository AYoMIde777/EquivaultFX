import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import efxLogo from '../assets/EFX logo.jpg';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      if (data.session) {
        navigate('/dashboard');
      } else {
        setInfoMsg(
          'Account created. Check your email to confirm your address, then log in.'
        );
        setMode('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link to="/" className="brand-mark">
            {!logoError ? (
              <img
                src={efxLogo}
                alt="EquivaultFX"
                className="brand-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="brand-logo-fallback">EF</span>
            )}
            <span>
              Equivault<span className="brand-accent">FX</span>
            </span>
          </Link>

          <Link
            to="/"
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Client Log In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--accent-crimson-soft)',
              border: '1px solid var(--accent-crimson)',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div
            style={{
              background: 'var(--positive-soft)',
              border: '1px solid var(--positive)',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '14px',
            }}
          >
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Legal Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="trader@equivaultfx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-crimson"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Access Trading Terminal'
              : 'Open EquivaultFX Account'}
          </button>
        </form>
      </div>
    </div>
  );
}