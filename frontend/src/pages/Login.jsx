import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = ({ initialMode }) => {
  // Modes: 'login' | 'register' | 'admin' | 'forgot'
  const [mode, setMode] = useState(() => {
    if (initialMode) return initialMode;
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) return 'admin';
    return 'login';
  });

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Admin form state
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  const { login, adminLogin, register, googleAuth, forgotPassword, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Reset notifications on mode change
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setDemoOtpNotice('');
    setForgotStep(1);
  }, [mode]);

  // Password validation checks
  const passwordRequirements = {
    length: regPassword.length >= 8,
    uppercase: /[A-Z]/.test(regPassword),
    lowercase: /[a-z]/.test(regPassword),
    number: /[0-9]/.test(regPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  // --- HANDLERS ---

  // 1. USER LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginIdentifier || !loginPassword) {
      setError('Please enter your email/phone number and password.');
      return;
    }

    setLoading(true);
    const result = await login(loginIdentifier, loginPassword);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid email/phone or password. Please try again.');
    }
  };

  // 2. ADMIN LOGIN
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!adminIdentifier || !adminPassword) {
      setError('Please enter your admin email/username and password.');
      return;
    }

    setLoading(true);
    const result = await adminLogin(adminIdentifier, adminPassword);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid admin credentials.');
    }
  };

  // 3. REGISTER (STANDARD USER)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Please complete all required fields.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please fulfill all password strength requirements.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    const result = await register(regName, regEmail, regPhone, regPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Account created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } else {
      setError(result.message || 'Registration failed. An account may already exist.');
    }
  };

  // 4. GOOGLE SIGN IN
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const mockGoogleUser = {
      email: regEmail || loginIdentifier || 'demo.user@gmail.com',
      name: regName || 'Google User',
      googleId: 'google-uid-' + Date.now()
    };

    const result = await googleAuth(mockGoogleUser);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Google sign-in failed.');
    }
  };

  // 5. FORGOT PASSWORD STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotIdentifier) {
      setError('Please enter your registered email address or phone number.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(forgotIdentifier);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      if (res.demoOtp) {
        setDemoOtpNotice(`(Demo OTP code: ${res.demoOtp})`);
      }
      setForgotStep(2);
    } else {
      setError(res.message);
    }
  };

  // 6. FORGOT PASSWORD STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the verification code sent to your email/phone.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(forgotIdentifier, otpCode);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('OTP verified successfully! Now set a new password.');
      setForgotStep(3);
    } else {
      setError(res.message);
    }
  };

  // 7. FORGOT PASSWORD STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(forgotIdentifier, otpCode, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${mode === 'admin' ? 'admin-mode' : ''}`}>
        
        {/* Brand Header */}
        <div className="auth-brand">
          <div className={`auth-logo-badge ${mode === 'admin' ? 'admin-badge' : ''}`}>
            {mode === 'admin' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            )}
          </div>
          <h1 className="auth-brand-name">
            {mode === 'admin' ? 'Performance Hub (Admin Portal)' : 'Performance Hub'}
          </h1>
        </div>

        {/* Mode Title & Subtitle */}
        <div className="auth-header">
          {mode === 'login' && (
            <>
              <h2 className="auth-title">User Login</h2>
              <p className="auth-subtitle">Login to your account or create a new user account to get started.</p>
            </>
          )}

          {mode === 'admin' && (
            <>
              <h2 className="auth-title">Admin Login</h2>
              <p className="auth-subtitle">Authorized administrators only. Access administrative controls & user management.</p>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Join us today to access your employee portal and dashboard.</p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">Follow the steps below to securely reset your password.</p>
            </>
          )}
        </div>

        {/* Primary Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              User Login
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`auth-tab-btn admin-tab ${mode === 'admin' ? 'active-admin' : ''}`}
              onClick={() => setMode('admin')}
            >
              Admin Login
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="auth-alert error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="auth-alert success" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================================================== */}
        {/* 1. USER LOGIN FORM                                   */}
        {/* ==================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-identifier">Email Address or Phone Number</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  id="login-identifier"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter email or phone number"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setMode('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Login'}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </button>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <button type="button" className="auth-inline-link" onClick={() => setMode('register')}>
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* ==================================================== */}
        {/* 2. ADMIN LOGIN FORM                                  */}
        {/* ==================================================== */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLoginSubmit} className="auth-form">
            <div className="admin-notice-bar">
              🔒 Restrained Area — Authorized System Administrators Only
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-identifier">Admin Email / Username</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  id="admin-identifier"
                  type="text"
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  className="auth-input admin-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="admin-password">Admin Password</label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setMode('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="auth-input admin-input"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn admin-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Login as Admin'}
            </button>

            <p className="auth-footer-text">
              Not an Administrator?{' '}
              <button type="button" className="auth-inline-link" onClick={() => setMode('login')}>
                User Login
              </button>
            </p>
          </form>
        )}

        {/* ==================================================== */}
        {/* 3. CREATE USER ACCOUNT FORM                          */}
        {/* ==================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-name">Full Name</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-phone">Phone Number (Optional)</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input
                  id="reg-phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              {regPassword.length > 0 && (
                <div className="pw-checklist">
                  <div className={`pw-check-item ${passwordRequirements.length ? 'valid' : ''}`}>
                    <span>{passwordRequirements.length ? '✓' : '•'}</span> Minimum 8 characters
                  </div>
                  <div className={`pw-check-item ${passwordRequirements.uppercase ? 'valid' : ''}`}>
                    <span>{passwordRequirements.uppercase ? '✓' : '•'}</span> At least 1 uppercase letter
                  </div>
                  <div className={`pw-check-item ${passwordRequirements.lowercase ? 'valid' : ''}`}>
                    <span>{passwordRequirements.lowercase ? '✓' : '•'}</span> At least 1 lowercase letter
                  </div>
                  <div className={`pw-check-item ${passwordRequirements.number ? 'valid' : ''}`}>
                    <span>{passwordRequirements.number ? '✓' : '•'}</span> At least 1 number
                  </div>
                  <div className={`pw-check-item ${passwordRequirements.special ? 'valid' : ''}`}>
                    <span>{passwordRequirements.special ? '✓' : '•'}</span> At least 1 special character
                  </div>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm-password">Confirm Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create Account'}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign up with Google
            </button>

            <p className="auth-footer-text">
              Already have an account?{' '}
              <button type="button" className="auth-inline-link" onClick={() => setMode('login')}>
                User Login
              </button>
            </p>
          </form>
        )}

        {/* ==================================================== */}
        {/* 4. FORGOT PASSWORD FLOW                              */}
        {/* ==================================================== */}
        {mode === 'forgot' && (
          <div className="auth-form">
            <div className="forgot-steps-bar">
              <div className={`forgot-step-dot ${forgotStep >= 1 ? 'active' : ''}`}>1</div>
              <div className="forgot-step-line" />
              <div className={`forgot-step-dot ${forgotStep >= 2 ? 'active' : ''}`}>2</div>
              <div className="forgot-step-line" />
              <div className={`forgot-step-dot ${forgotStep >= 3 ? 'active' : ''}`}>3</div>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="forgot-identifier">Registered Email or Phone</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input
                      id="forgot-identifier"
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="Enter registered email or phone"
                      required
                      className="auth-input"
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Send Verification Code'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                {demoOtpNotice && <p className="demo-otp-notice">{demoOtpNotice}</p>}

                <div className="auth-field">
                  <label className="auth-label" htmlFor="otp-input">6-Digit Verification Code (OTP)</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="auth-input otp-style"
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Verify OTP Code'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="new-password">New Password</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      id="confirm-new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="auth-input"
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : 'Update Password'}
                </button>
              </form>
            )}

            <p className="auth-footer-text">
              Remember your password?{' '}
              <button type="button" className="auth-inline-link" onClick={() => setMode('login')}>
                Back to Login
              </button>
            </p>
          </div>
        )}

      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 24px 16px;
        }

        .auth-container {
          width: 100%;
          max-width: 450px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
          padding: 32px 28px;
          box-sizing: border-box;
          transition: border-color 0.3s ease;
        }

        .auth-container.admin-mode {
          border-color: #6366f1;
          box-shadow: 0 12px 36px rgba(99, 102, 241, 0.12);
        }

        /* Brand */
        .auth-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .auth-logo-badge {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b37ff, #6366f1);
          color: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 55, 255, 0.25);
        }

        .auth-logo-badge.admin-badge {
          background: linear-gradient(135deg, #0f172a, #1e1b4b);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
        }

        .auth-brand-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.3px;
        }

        /* Header */
        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-title {
          font-size: 1.7rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.4px;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
          line-height: 1.45;
        }

        /* Tab Switcher */
        .auth-tab-switch {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 24px;
          gap: 2px;
        }

        .auth-tab-btn {
          flex: 1;
          padding: 8px 6px;
          border: none;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .auth-tab-btn.active {
          background: #ffffff;
          color: #3b37ff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .auth-tab-btn.active-admin {
          background: #0f172a;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
        }

        .admin-notice-bar {
          background: #f1f5f9;
          border: 1px dashed #cbd5e1;
          color: #334155;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 8px;
        }

        /* Alerts */
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .auth-alert.error {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          color: #dc2626;
        }

        .auth-alert.success {
          background-color: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #16a34a;
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }

        .auth-link-btn {
          background: none;
          border: none;
          color: #3b37ff;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .auth-link-btn:hover {
          text-decoration: underline;
        }

        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          height: 46px;
          padding: 0 16px 0 44px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          font-size: 0.92rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .auth-input.admin-input:focus {
          border-color: #0f172a;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.15);
        }

        .auth-input.otp-style {
          letter-spacing: 4px;
          font-weight: 700;
          text-align: center;
          padding: 0 16px;
          font-size: 1.2rem;
        }

        .auth-input::placeholder {
          color: #94a3b8;
        }

        .auth-input:focus {
          border-color: #3b37ff;
          box-shadow: 0 0 0 3px rgba(59, 55, 255, 0.12);
        }

        .auth-pw-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-pw-toggle:hover {
          color: #475569;
        }

        /* Password Checklist */
        .pw-checklist {
          margin-top: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pw-check-item {
          font-size: 0.76rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pw-check-item.valid {
          color: #16a34a;
          font-weight: 600;
        }

        /* Buttons */
        .auth-submit-btn {
          width: 100%;
          height: 46px;
          background-color: #3b37ff;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-submit-btn.admin-submit-btn {
          background-color: #0f172a;
        }

        .auth-submit-btn.admin-submit-btn:hover {
          background-color: #1e293b;
        }

        .auth-submit-btn:hover {
          background-color: #2b27e0;
        }

        .auth-submit-btn:disabled {
          background-color: #818cf8;
          cursor: not-allowed;
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 14px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .auth-divider span {
          padding: 0 12px;
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* Google Button */
        .auth-google-btn {
          width: 100%;
          height: 46px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #1e293b;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .auth-google-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }

        /* Footer Text */
        .auth-footer-text {
          font-size: 0.85rem;
          color: #64748b;
          text-align: center;
          margin-top: 20px;
          margin-bottom: 0;
        }

        .auth-inline-link {
          background: none;
          border: none;
          color: #3b37ff;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
        }

        .auth-inline-link:hover {
          text-decoration: underline;
        }

        /* Forgot Password Steps Bar */
        .forgot-steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .forgot-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .forgot-step-dot.active {
          background: #3b37ff;
          color: #ffffff;
        }

        .forgot-step-line {
          flex: 0.2;
          height: 2px;
          background: #e2e8f0;
        }

        .demo-otp-notice {
          font-size: 0.8rem;
          color: #6366f1;
          font-weight: 600;
          background: #eef2ff;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          text-align: center;
        }

        .auth-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: authSpin 0.6s linear infinite;
        }

        @keyframes authSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
