import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/employees/${user.id}`);
        setProfile(res.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#6b7280' }}>Loading profile...</p>
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <p style={{ color: '#ef4444' }}>Profile not found.</p>
    </div>
  );

  const perf = profile.performance;
  const catColor = perf?.category === 'Excellent' ? '#10b981'
    : perf?.category === 'Good' ? '#3b82f6'
    : perf?.category === 'Average' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1f2937, #4f46e5)',
        borderRadius: 16, padding: '32px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 24,
        flexWrap: 'wrap', marginBottom: 24
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', flexShrink: 0
        }}>
          👤
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{profile.name}</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.8 }}>{profile.position} — {profile.department}</p>
          <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>ID: {profile.employeeId}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '📧', label: 'Email', value: profile.email },
          { icon: '🏢', label: 'Department', value: profile.department },
          { icon: '💼', label: 'Position', value: profile.position },
          { icon: '🆔', label: 'Employee ID', value: profile.employeeId },
          { icon: '🔐', label: 'Role', value: profile.role },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontWeight: 600, color: '#1f2937', wordBreak: 'break-all' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      {perf && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1f2937' }}>📊 Performance Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                border: `8px solid ${catColor}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: '#f9fafb'
              }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: catColor }}>{perf.overallScore}</span>
                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>/ 100</span>
              </div>
              <span style={{
                display: 'inline-block', marginTop: 8,
                padding: '3px 12px', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem',
                background: perf.category === 'Excellent' ? '#dcfce7' : perf.category === 'Good' ? '#dbeafe' : perf.category === 'Average' ? '#fef9c3' : '#fee2e2',
                color: perf.category === 'Excellent' ? '#166534' : perf.category === 'Good' ? '#1e40af' : perf.category === 'Average' ? '#854d0e' : '#991b1b',
              }}>{perf.category}</span>
            </div>
            <div style={{ flex: 1, display: 'grid', gap: 10 }}>
              {[
                { label: 'KPI', val: perf.kpiPerformance, color: '#4f46e5', available: perf.hasKpi },
                { label: 'Projects', val: perf.projectPerformance, color: '#10b981', available: perf.hasProject },
                { label: 'Attendance', val: perf.attendancePerformance, color: '#f59e0b', available: perf.hasAttendance },
                { label: 'Training', val: perf.trainingPerformance, color: '#3b82f6', available: perf.hasTraining },
                { label: 'Appraisal', val: perf.appraisalPerformance, color: '#8b5cf6', available: perf.hasAppraisal },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ minWidth: 80, fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{item.label}</span>
                  {item.available ? (
                    <>
                      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(item.val, 100)}%`, height: '100%', background: item.color, borderRadius: 4 }} />
                      </div>
                      <span style={{ minWidth: 36, fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.val.toFixed(1)}</span>
                    </>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>Not available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
