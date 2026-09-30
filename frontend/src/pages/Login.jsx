import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillAdmin = () => {
    setEmail('admin@example.com');
    setPassword('password123');
  };

  const fillEmployee = () => {
    setEmail('alice@example.com');
    setPassword('password123');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>📊</div>
          <h1 style={styles.title}>Performance Hub</h1>
          <p style={styles.subtitle}>Employee Performance Management System</p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={styles.input}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Access */}
        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Quick Demo Access</p>
          <div style={styles.demoButtons}>
            <button onClick={fillAdmin} style={styles.demoBtn}>
              👑 Admin Login
            </button>
            <button onClick={fillEmployee} style={styles.demoBtn}>
              👤 Employee Login
            </button>
          </div>
          <p style={styles.demoHint}>Password for both: <strong>password123</strong></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4f46e5 100%)',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoCircle: {
    fontSize: '2.5rem',
    marginBottom: '12px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: 0,
  },
  errorBox: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#374151',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  loginBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'opacity 0.2s',
  },
  demoSection: {
    marginTop: '28px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '10px',
    textAlign: 'center',
  },
  demoTitle: {
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 12px 0',
    fontSize: '0.9rem',
  },
  demoButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  demoBtn: {
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#374151',
  },
  demoHint: {
    color: '#6b7280',
    fontSize: '0.8rem',
    margin: 0,
  },
};

export default Login;
