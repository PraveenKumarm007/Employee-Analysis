import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Users, TrendingUp, Award, AlertTriangle, Building2, Target } from 'lucide-react';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
        <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '0.85rem' }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

const SkeletonCard = () => (
  <div className="stat-card primary" style={{ minHeight: 110 }}>
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      <div className="skeleton" style={{ height: 32, width: '40%', marginTop: 8, borderRadius: 6 }} />
    </div>
    <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 12 }} />
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/dashboard');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useSocket(fetchStats);

  if (loading) return (
    <div>
      <div className="page-header">
        <h1>Management Dashboard</h1>
        <p>Organization-wide performance overview</p>
      </div>
      <div className="stats-grid">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="charts-grid">
        {[1,2].map(i => (
          <div className="card" key={i}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-card" />
          </div>
        ))}
      </div>
    </div>
  );

  const excellent = stats.performanceDistribution.find(d => d.name === 'Excellent')?.value || 0;
  const needsImp = stats.performanceDistribution.find(d => d.name === 'Needs Improvement')?.value || 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Management Dashboard</h1>
          <p>Real-time organization performance overview <span className="live-dot" style={{ marginLeft: 6 }} /> LIVE</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-info">
            <div className="stat-card-label">Total Employees</div>
            <div className="stat-card-value">{stats.totalEmployees}</div>
            <div className="stat-card-sub">Active workforce</div>
          </div>
          <div className="stat-card-icon"><Users size={22} /></div>
        </div>
        <div className="stat-card success">
          <div className="stat-card-info">
            <div className="stat-card-label">Avg. Performance</div>
            <div className="stat-card-value">{stats.averagePerformance}</div>
            <div className="stat-card-sub">Out of 100</div>
          </div>
          <div className="stat-card-icon"><TrendingUp size={22} /></div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-info">
            <div className="stat-card-label">High Performers</div>
            <div className="stat-card-value">{excellent}</div>
            <div className="stat-card-sub">Excellent category</div>
          </div>
          <div className="stat-card-icon"><Award size={22} /></div>
        </div>
        <div className="stat-card danger">
          <div className="stat-card-info">
            <div className="stat-card-label">Needs Improvement</div>
            <div className="stat-card-value">{needsImp}</div>
            <div className="stat-card-sub">Require attention</div>
          </div>
          <div className="stat-card-icon"><AlertTriangle size={22} /></div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Performance Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: '#e0e7ff' }}>🎯</div>
              Performance Distribution
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.performanceDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                  paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {stats.performanceDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: '#d1fae5' }}>🏢</div>
              Department Performance
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentAverages} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="average" name="Avg Score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        {/* KPI / Attendance / Training Averages */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: '#fef3c7' }}>📈</div>
              Component Averages
            </div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'KPI', value: Number(stats.averages.kpi) },
                  { name: 'Attendance', value: Number(stats.averages.attendance) },
                  { name: 'Training', value: Number(stats.averages.training) },
                ]}
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Average" radius={[6, 6, 0, 0]}>
                  {['#6366f1','#10b981','#3b82f6'].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employees Needing Improvement */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: '#fee2e2' }}>⚠️</div>
              Needs Improvement
            </div>
          </div>
          {stats.needsImprovementList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3>Great job!</h3>
              <p>No employees need improvement right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.needsImprovementList.slice(0, 5).map(p => (
                <div key={p.employeeId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#fff7f7', borderRadius: 8, border: '1px solid #fee2e2' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                    {p.employeeDetails.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.employeeDetails.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.employeeDetails.department}</div>
                  </div>
                  <span className="badge needs-improvement">{p.overallScore}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: '#dcfce7' }}>🏆</div>
            Top Performing Employees
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th><th>Employee</th><th>Department</th><th>Position</th>
                <th>Score</th><th>Category</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPerformers.map((p, i) => (
                <tr key={p.employeeId}>
                  <td>
                    <span style={{ fontSize: '1.1rem' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {p.employeeDetails.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.employeeDetails.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.employeeDetails.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background: '#f1f5f9', padding: '3px 9px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500 }}>{p.employeeDetails.department}</span></td>
                  <td style={{ color: '#64748b' }}>{p.employeeDetails.position}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, maxWidth: 80 }}>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${p.overallScore}%`, background: p.category === 'Excellent' ? '#10b981' : p.category === 'Good' ? '#6366f1' : '#f59e0b' }} />
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, minWidth: 32 }}>{p.overallScore}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${p.category.toLowerCase().replace(' ', '-')}`}>{p.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
