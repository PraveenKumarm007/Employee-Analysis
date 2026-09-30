import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Target, Briefcase,
  CalendarCheck, GraduationCap, Star, LogOut,
  User, TrendingUp, Bell, Search, Wifi, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  const adminNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/kpis', icon: Target, label: 'KPI Management' },
    { to: '/projects', icon: Briefcase, label: 'Projects' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/training', icon: GraduationCap, label: 'Training' },
    { to: '/appraisals', icon: Star, label: 'Appraisals' },
  ];

  const empNav = [
    { to: '/', icon: User, label: 'My Profile', end: true },
    { to: '/my-performance', icon: TrendingUp, label: 'My Performance' },
  ];

  const links = user?.role === 'Admin' ? adminNav : empNav;

  // Get active route name
  const currentLink = links.find(l => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)));
  const pageTitle = currentLink ? currentLink.label : 'Employee Hub';

  const notifications = [
    { id: 1, title: 'Real-Time Sync Active', desc: 'Socket connection established with backend server', time: 'Just now', icon: '🟢' },
    { id: 2, title: 'Quarterly Evaluation Cycle', desc: 'Review metrics for 5 performance weight components', time: 'Today', icon: '🎯' },
    { id: 3, title: 'Automated Score Engine', desc: 'Formulas weighted: KPI 30%, Projects 25%, Attendance 15%, Training 10%, Appraisal 20%', time: 'Active', icon: '⚡' }
  ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <div className="sidebar-brand-icon">📊</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">Performance Hub</span>
              <span className="sidebar-brand-sub">Enterprise Management</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="sidebar-section-label">
            {user?.role === 'Admin' ? 'Management Center' : 'Personal Workspace'}
          </div>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} className="sidebar-link-icon" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="breadcrumb-tag">{user?.role}</span>
            <span className="topbar-page-name">{pageTitle}</span>
          </div>

          <div className="topbar-right">
            {/* Live Socket Status Pill */}
            <div className="live-status-pill" title="Websocket Live Connection">
              <span className="live-dot" />
              <span>Real-Time Sync</span>
            </div>

            {/* Date Pill */}
            <div className="date-pill">
              📅 {formattedDate}
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="icon-button"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                aria-label="Toggle notifications"
              >
                <Bell size={18} />
                <span className="badge-dot" />
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>System Notifications</span>
                    <span style={{ fontSize: '0.75rem', color: '#6366f1', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>
                      Close
                    </span>
                  </div>
                  <div className="dropdown-body">
                    {notifications.map(n => (
                      <div key={n.id} className="notification-item">
                        <span style={{ fontSize: '1.2rem' }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{n.title}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>{n.desc}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Pill */}
            <div className="topbar-user-pill">
              <div className="topbar-avatar">{initials}</div>
              <span className="topbar-username">{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
