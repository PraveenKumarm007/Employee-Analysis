import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

const ScoreCircle = ({ score, category }) => {
  const color = category === 'Excellent' ? '#10b981'
    : category === 'Good' ? '#3b82f6'
    : category === 'Average' ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        border: `8px solid ${color}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px',
        background: '#f9fafb',
      }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>/ 100</span>
      </div>
      <span style={{
        padding: '4px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem',
        background: category === 'Excellent' ? '#dcfce7'
          : category === 'Good' ? '#dbeafe'
          : category === 'Average' ? '#fef9c3' : '#fee2e2',
        color: category === 'Excellent' ? '#166534'
          : category === 'Good' ? '#1e40af'
          : category === 'Average' ? '#854d0e' : '#991b1b',
      }}>{category}</span>
    </div>
  );
};

const ProgressBar = ({ value, color = '#4f46e5' }) => (
  <div style={{ background: '#e5e7eb', borderRadius: 4, height: 10, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
  </div>
);

const MetricCard = ({ label, value, weight, weighted, color, available }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontWeight: 600, color: '#374151' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Weight: {weight}%</span>
    </div>
    {available ? (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value.toFixed(1)}</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', alignSelf: 'center' }}>Weighted: <strong>{weighted.toFixed(2)}</strong></span>
        </div>
        <ProgressBar value={value} color={color} />
      </>
    ) : (
      <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Data not available</p>
    )}
  </div>
);

const EmployeeReport = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      const [perfRes, kpiRes, projRes, attRes, trnRes, apprRes] = await Promise.all([
        API.get(`/performance/${id}`),
        API.get(`/kpis/employee/${id}`),
        API.get(`/projects/employee/${id}`),
        API.get(`/attendance/employee/${id}`),
        API.get(`/training/employee/${id}`),
        API.get(`/appraisals/employee/${id}`)
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
      console.error('Error loading report:', err);
      setError('Failed to load performance report.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchReport(); }, [fetchReport]);
  useSocket(fetchReport);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p style={{ color: '#6b7280', marginTop: 10 }}>Loading performance report...</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: '2rem' }}>❌</div>
      <p style={{ color: '#ef4444' }}>{error || 'Report not found.'}</p>
    </div>
  );

  const { performance, kpis, projects, attendance, training, appraisals } = report;
  const emp = performance.employeeDetails;

  const chartData = [
    { name: 'KPI', score: parseFloat(performance.kpiPerformance.toFixed(1)), fill: '#4f46e5' },
    { name: 'Projects', score: parseFloat(performance.projectPerformance.toFixed(1)), fill: '#10b981' },
    { name: 'Attendance', score: parseFloat(performance.attendancePerformance.toFixed(1)), fill: '#f59e0b' },
    { name: 'Training', score: parseFloat(performance.trainingPerformance.toFixed(1)), fill: '#3b82f6' },
    { name: 'Appraisal', score: parseFloat(performance.appraisalPerformance.toFixed(1)), fill: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Back Button — Admin Only */}
      {user?.role === 'Admin' && (
        <div style={{ marginBottom: 16 }}>
          <Link to="/employees" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to Employees
          </Link>
        </div>
      )}

      {/* Header Card */}
      <div style={{ background: 'linear-gradient(135deg, #1f2937, #4f46e5)', borderRadius: 14, padding: '28px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{emp.name}</h1>
          <p style={{ margin: '6px 0 4px', opacity: 0.8 }}>{emp.position} — {emp.department}</p>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>ID: {emp.employeeId} | {emp.email}</p>
        </div>
        <ScoreCircle score={performance.overallScore} category={performance.category} />
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard label="KPI Performance" value={performance.kpiPerformance} weight={30}
          weighted={performance.kpiPerformance * 0.30} color="#4f46e5" available={performance.hasKpi} />
        <MetricCard label="Project Contribution" value={performance.projectPerformance} weight={25}
          weighted={performance.projectPerformance * 0.25} color="#10b981" available={performance.hasProject} />
        <MetricCard label="Attendance" value={performance.attendancePerformance} weight={15}
          weighted={performance.attendancePerformance * 0.15} color="#f59e0b" available={performance.hasAttendance} />
        <MetricCard label="Training Completion" value={performance.trainingPerformance} weight={10}
          weighted={performance.trainingPerformance * 0.10} color="#3b82f6" available={performance.hasTraining} />
        <MetricCard label="Appraisal Score" value={performance.appraisalPerformance} weight={20}
          weighted={performance.appraisalPerformance * 0.20} color="#8b5cf6" available={performance.hasAppraisal} />
      </div>

      {/* Chart + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Performance Breakdown</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip formatter={(v) => `${v}/100`} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Score Calculation</h3>
          {[
            { label: 'KPI × 30%', val: (performance.kpiPerformance * 0.30).toFixed(2), color: '#4f46e5', available: performance.hasKpi },
            { label: 'Projects × 25%', val: (performance.projectPerformance * 0.25).toFixed(2), color: '#10b981', available: performance.hasProject },
            { label: 'Attendance × 15%', val: (performance.attendancePerformance * 0.15).toFixed(2), color: '#f59e0b', available: performance.hasAttendance },
            { label: 'Training × 10%', val: (performance.trainingPerformance * 0.10).toFixed(2), color: '#3b82f6', available: performance.hasTraining },
            { label: 'Appraisal × 20%', val: (performance.appraisalPerformance * 0.20).toFixed(2), color: '#8b5cf6', available: performance.hasAppraisal },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#374151', fontSize: '0.9rem' }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.available ? item.color : '#9ca3af' }}>
                {item.available ? item.val : 'N/A'}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', borderTop: '2px solid #1f2937', marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: '#1f2937' }}>Overall Score</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#4f46e5' }}>{performance.overallScore}</span>
          </div>
        </div>
      </div>

      {/* KPI Records */}
      {kpis.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>KPI Records</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['KPI Name', 'Target', 'Achieved', 'Score', 'Progress'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kpis.map(kpi => (
                  <tr key={kpi._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px' }}>{kpi.kpiName}</td>
                    <td style={{ padding: '12px 14px' }}>{kpi.targetValue}</td>
                    <td style={{ padding: '12px 14px' }}>{kpi.achievedValue}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#4f46e5' }}>{(kpi.kpiScore || 0).toFixed(1)}</td>
                    <td style={{ padding: '12px 14px', minWidth: 120 }}>
                      <ProgressBar value={kpi.kpiScore || 0} color="#4f46e5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Project Contributions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Project', 'Description', 'Score', 'Progress'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.projectName}</td>
                    <td style={{ padding: '12px 14px', color: '#6b7280' }}>{p.contributionDescription}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#10b981' }}>{p.contributionScore}</td>
                    <td style={{ padding: '12px 14px', minWidth: 120 }}>
                      <ProgressBar value={p.contributionScore} color="#10b981" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance */}
      {attendance.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Attendance Record</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Total Days', 'Present', 'Absent', 'Attendance %'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px' }}>{a.totalWorkingDays}</td>
                    <td style={{ padding: '12px 14px', color: '#10b981', fontWeight: 600 }}>{a.presentDays}</td>
                    <td style={{ padding: '12px 14px', color: '#ef4444', fontWeight: 600 }}>{a.absentDays}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ProgressBar value={a.attendancePercentage} color="#f59e0b" />
                        <span style={{ fontWeight: 600, color: '#f59e0b', minWidth: 50 }}>{(a.attendancePercentage || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Training */}
      {training.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Training Records</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Training Name', 'Status', 'Completion'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {training.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{t.trainingName}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                        background: t.trainingStatus === 'Completed' ? '#dcfce7' : t.trainingStatus === 'In Progress' ? '#dbeafe' : '#f3f4f6',
                        color: t.trainingStatus === 'Completed' ? '#166534' : t.trainingStatus === 'In Progress' ? '#1e40af' : '#6b7280',
                      }}>{t.trainingStatus}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={t.completionPercentage} color="#3b82f6" /></div>
                        <span style={{ fontWeight: 600, color: '#3b82f6', minWidth: 40 }}>{t.completionPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appraisals */}
      {appraisals.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', color: '#1f2937' }}>Appraisal Records</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Rating', 'Score', 'Manager Evaluation'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appraisals.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 14px' }}>
                      {'⭐'.repeat(a.performanceRating)} ({a.performanceRating}/5)
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#8b5cf6' }}>{a.appraisalScore}/100</td>
                    <td style={{ padding: '12px 14px', color: '#374151' }}>{a.managerEvaluation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeReport;
