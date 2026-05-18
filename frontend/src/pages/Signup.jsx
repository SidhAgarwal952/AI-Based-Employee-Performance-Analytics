import React, { useState } from 'react';
import { Sparkles, KeyRound, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

const Signup = ({ onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Client Validation Checks
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all provisioning fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Provisioning failed. Email may already be registered.');
      }

      // Success Cache
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));

      if (onSignupSuccess) {
        onSignupSuccess(data.token, data);
      }

      window.location.href = '#/dashboard';
    } catch (err) {
      console.error('Signup Submission Failure:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="glass-card auth-card ai-loading-pulse" style={{ animationDuration: '6s' }}>
        <div style={styles.branding}>
          <div style={styles.logoCircle}>
            <Sparkles size={24} color="var(--secondary)" />
          </div>
          <h2 style={styles.title}>
            Aura<span style={{ color: 'var(--secondary)' }}>HR</span>
          </h2>
          <p style={styles.subtitle}>Provision Administrative Console Account</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">
              Full Name
            </label>
            <div style={styles.inputWrapper}>
              <User size={16} style={styles.inputIcon} />
              <input
                id="name-input"
                type="text"
                className="form-input"
                style={styles.paddedInput}
                placeholder="Aman Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Console Email
            </label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                id="email-input"
                type="email"
                className="form-input"
                style={styles.paddedInput}
                placeholder="aman@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Secret Passkey
            </label>
            <div style={styles.inputWrapper}>
              <KeyRound size={16} style={styles.inputIcon} />
              <input
                id="password-input"
                type="password"
                className="form-input"
                style={styles.paddedInput}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="confirm-password-input">
              Confirm Passkey
            </label>
            <div style={styles.inputWrapper}>
              <KeyRound size={16} style={styles.inputIcon} />
              <input
                id="confirm-password-input"
                type="password"
                className="form-input"
                style={styles.paddedInput}
                placeholder="Re-enter passkey"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Creating administrative credentials...' : 'Register Console'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={styles.footerLink}>
          <span>Already authorized? </span>
          <a href="#/login" style={styles.link}>
            Login to Console
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  branding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '1.75rem'
  },
  logoCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    marginBottom: '1rem'
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '0.35rem'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
    textAlign: 'left'
  },
  form: {
    width: '100%'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)'
  },
  paddedInput: {
    paddingLeft: '38px'
  },
  footerLink: {
    textAlign: 'center',
    fontSize: '0.85rem',
    marginTop: '1.5rem',
    color: 'var(--text-secondary)'
  },
  link: {
    color: 'var(--secondary)',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'var(--transition-fast)'
  }
};

export default Signup;
