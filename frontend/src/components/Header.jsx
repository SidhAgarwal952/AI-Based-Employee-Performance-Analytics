import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, User, LayoutDashboard, BrainCircuit } from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  const [adminName, setAdminName] = useState('HR Admin');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.name) {
          setAdminName(user.name);
        }
      } catch (e) {
        console.error('Error parsing admin details:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '#/login';
    window.location.reload(); // Hard reload to clear client state
  };

  return (
    <header style={styles.header}>
      <div style={styles.branding} onClick={() => setActiveTab('dashboard')}>
        <div style={styles.logoCircle}>
          <Sparkles size={20} color="var(--secondary)" />
        </div>
        <h1 style={styles.title}>
          Aura<span style={{ color: 'var(--secondary)' }}>HR</span>
        </h1>
      </div>

      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            ...styles.navBtn,
            ...(activeTab === 'dashboard' ? styles.navBtnActive : {})
          }}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            ...styles.navBtn,
            ...(activeTab === 'ai' ? styles.navBtnActive : {})
          }}
        >
          <BrainCircuit size={16} />
          <span>AI Analytics</span>
        </button>
      </nav>

      <div style={styles.profileArea}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            <User size={14} color="#fff" />
          </div>
          <span style={styles.userName}>{adminName}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Log Out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

// Inline styling supporting custom theme values
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.75rem',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(var(--blur-glass))',
    borderBottom: '1px solid var(--border-glass)',
    borderRadius: '16px',
    marginBottom: '2rem',
    boxShadow: 'var(--shadow-premium)'
  },
  branding: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer'
  },
  logoCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.25)'
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  nav: {
    display: 'flex',
    gap: '0.75rem'
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid transparent',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)'
  },
  navBtnActive: {
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-glow)'
  },
  profileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-glass)'
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'var(--primary)'
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    background: 'rgba(239, 68, 68, 0.08)',
    color: 'var(--danger)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)'
  }
};

export default Header;
