import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const ProgressBar = ({ value, color = '#4f46e5', showLabel = true }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 10, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
    </div>
    {showLabel && <span style={{ fontWeight: 600, color, minWidth: 48, fontSize: '0.85rem' }}>{value.toFixed(1)}%</span>}
  </div>
);

const MyPerformance = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [perfRes, kpiRes, projRes, attRes, trnRes, apprRes] = await Promise.all([
        API.get(`/performance/${user.id}`),
        API.get(`/kpis/employee/${user.id}`),
        API.get(`/projects/employee/${user.id}`),
        API.get(`/attendance/employee/${user.id}`),
        API.get(`/training/employee/${user.id}`),
        API.get(`/appraisals/employee/${user.id}`)
      ]);
      setReport({
        performance: perfRes.data,
        kpis: kpiRes.data,
        projects: projRes.data,
        attendance: attRes.data,
        training: trnRes.data,
        appraisals: apprRes.data
      });
      setError(null);
    } catch (err) {
      console.error('Error loading performance:', err);
      setError('Failed to load your performance data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useSocket(fetchReport);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p style={{ color: '#6b7280', marginTop: 10 }}>Loading your performance data...</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: '2rem' }}>❌</div>
      <p style={{ color: '#ef4444' }}>{error || 'No performance data found.'}</p>
    </div>
  );

  const { performance, kpis, projects, attendance, training, appraisals } = report;

  const catColor = performance.category === 'Excellent' ? '#10b981'
    : performance.category === 'Good' ? '#3b82f6'
    : performance.category === 'Average' ? '#f59e0b' : '#ef4444';

  const catBg = performance.category === 'Excellent' ? '#dcfce7'
    : performance.category === 'Good' ? '#dbeafe'
    : performance.category === 'Average' ? '#fef9c3' : '#fee2e2';

  const catText = performance.category === 'Excellent' ? '#166534'
    : performance.category === 'Good' ? '#1e40af'
    : performance.category === 'Average' ? '#854d0e' : '#991b1b';

  const chartData = [
    { name: 'KPI', score: parseFloat(performance.kpiPerformance.toFixed(1)) },
    { name: 'Projects', score: parseFloat(performance.projectPerformance.toFixed(1)) },
    { name: 'Attendance', score: parseFloat(performance.attendancePerformance.toFixed(1)) },
    { name: 'Training', score: parseFloat(performance.trainingPerformance.toFixed(1)) },
    { name: 'Appraisal', score: parseFloat(performance.appraisalPerformance.toFixed(1)) },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Hero Score Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1f2937, #4f46e5)',
        borderRadius: 16, padding: '32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 28
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>My Performance Report</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>Real-time performance tracking — updates automatically</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem' }}>
              🔴 LIVE
            </span>
            <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>Connected to real-time updates</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: `8px solid ${catColor}`, background: 'rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{performance.overallScore}</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>/ 100</span>
          </div>
          <span style={{
            display: 'inline-block', marginTop: 10,
            background: catBg, color: catText,
            padding: '4px 14px', borderRadius: 20, fontWeight: 600, fontSize: '0.85rem'
          }}>{performance.category}</span>
        </div>
      </div>

      {/* 5 Component Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'KPI', icon: '🎯', val: performance.kpiPerformance, weight: '30%', color: '#4f46e5', available: performance.hasKpi },
          { label: 'Projects', icon: '💼', val: performance.projectPerformance, weight: '25%', color: '#10b981', available: performance.hasProject },
          { label: 'Attendance', icon: '📅', val: performance.attendancePerformance, weight: '15%', color: '#f59e0b', available: performance.hasAttendance },
          { label: 'Training', icon: '🎓', val: performance.trainingPerformance, weight: '10%', color: '#3b82f6', available: performance.hasTraining },
          { label: 'Appraisal', icon: '⭐', val: performance.appraisalPerformance, weight: '20%', color: '#8b5cf6', available: performance.hasAppraisal },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 10 }}>Weight: {item.weight}</div>
            {item.available ? (
              <>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: item.color }}>{item.val.toFixed(1)}</div>
                <div style={{ marginTop: 8 }}>
                  <ProgressBar value={item.val} color={item.color} showLabel={false} />
                </div>
              </>
            ) : (
              <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>Not Available</div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 20px', color: '#1f2937' }}>📊 Performance Breakdown</h3>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip formatter={(v) => `${v}/100`} />
              <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Formula */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>🧮 Score Calculation</h3>
        {[
          { label: 'KPI Performance × 30%', val: (performance.kpiPerformance * 0.30).toFixed(2), available: performance.hasKpi, color: '#4f46e5' },
          { label: 'Project Contribution × 25%', val: (performance.projectPerformance * 0.25).toFixed(2), available: performance.hasProject, color: '#10b981' },
          { label: 'Attendance × 15%', val: (performance.attendancePerformance * 0.15).toFixed(2), available: performance.hasAttendance, color: '#f59e0b' },
          { label: 'Training Completion × 10%', val: (performance.trainingPerformance * 0.10).toFixed(2), available: performance.hasTraining, color: '#3b82f6' },
          { label: 'Appraisal Score × 20%', val: (performance.appraisalPerformance * 0.20).toFixed(2), available: performance.hasAppraisal, color: '#8b5cf6' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#374151' }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: row.available ? row.color : '#9ca3af' }}>
              {row.available ? `+${row.val}` : 'N/A'}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', borderTop: '2px solid #1f2937', marginTop: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Overall Score</span>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#4f46e5' }}>{performance.overallScore} / 100</span>
        </div>
      </div>

      {/* Detailed Tables */}
      {kpis.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', color: '#1f2937' }}>🎯 My KPIs</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb' }}>
                {['KPI Name', 'Target', 'Achieved', 'Score', 'Progress'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {kpis.map(k => (
                  <tr key={k._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{k.kpiName}</td>
                    <td style={{ padding: '12px 14px' }}>{k.targetValue}</td>
                    <td style={{ padding: '12px 14px' }}>{k.achievedValue}</td>
                    <td style={{ padding: '12px 14px', color: '#4f46e5', fontWeight: 700 }}>{(k.kpiScore || 0).toFixed(1)}</td>
                    <td style={{ padding: '12px 14px', minWidth: 120 }}><ProgressBar value={k.kpiScore || 0} color="#4f46e5" showLabel={false} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {attendance.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', color: '#1f2937' }}>📅 My Attendance</h3>
          {attendance.map(a => (
            <div key={a._id} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[
                { label: 'Total Days', value: a.totalWorkingDays, color: '#374151' },
                { label: 'Present', value: a.presentDays, color: '#10b981' },
                { label: 'Absent', value: a.absentDays, color: '#ef4444' },
                { label: 'Attendance %', value: `${(a.attendancePercentage||0).toFixed(1)}%`, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: 16, background: '#f9fafb', borderRadius: 10 }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {training.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', color: '#1f2937' }}>🎓 My Training</h3>
          {training.map(t => (
            <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.trainingName}</div>
                <span style={{
                  display: 'inline-block', marginTop: 4, padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                  background: t.trainingStatus === 'Completed' ? '#dcfce7' : t.trainingStatus === 'In Progress' ? '#dbeafe' : '#f3f4f6',
                  color: t.trainingStatus === 'Completed' ? '#166534' : t.trainingStatus === 'In Progress' ? '#1e40af' : '#6b7280',
                }}>{t.trainingStatus}</span>
              </div>
              <div style={{ minWidth: 160 }}>
                <ProgressBar value={t.completionPercentage} color="#3b82f6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {appraisals.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', color: '#1f2937' }}>⭐ My Appraisals</h3>
          {appraisals.map(a => (
            <div key={a._id} style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{'⭐'.repeat(a.performanceRating)} ({a.performanceRating}/5 Rating)</span>
                <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '1.1rem' }}>{a.appraisalScore}/100</span>
              </div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>"{a.managerEvaluation}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPerformance;
