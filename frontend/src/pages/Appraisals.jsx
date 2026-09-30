import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Star, Award, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';

const Appraisals = () => {
  const { addToast } = useToast();
  const [appraisals, setAppraisals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    performanceRating: 5,
    appraisalScore: 85,
    managerEvaluation: ''
  });
  const [saving, setSaving] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [apprRes, empRes] = await Promise.all([API.get('/appraisals'), API.get('/employees')]);
      setAppraisals(apprRes.data);
      setEmployees(empRes.data);
    } catch {
      addToast('Failed to load appraisals data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSocket(fetchData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      addToast('Please select an employee', 'warning');
      return;
    }
    setSaving(true);
    try {
      await API.post('/appraisals', formData);
      setFormData({ employeeId: '', performanceRating: 5, appraisalScore: 85, managerEvaluation: '' });
      setShowForm(false);
      addToast('Appraisal submitted successfully!', 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error adding appraisal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete appraisal record for ${name || 'employee'}?`)) return;
    try {
      await API.delete(`/appraisals/${id}`);
      addToast('Appraisal record removed', 'info');
      fetchData();
    } catch {
      addToast('Error deleting appraisal', 'error');
    }
  };

  const avgRating = appraisals.length
    ? (appraisals.reduce((sum, a) => sum + (Number(a.performanceRating) || 0), 0) / appraisals.length).toFixed(1)
    : '0.0';

  const avgScore = appraisals.length
    ? (appraisals.reduce((sum, a) => sum + (Number(a.appraisalScore) || 0), 0) / appraisals.length).toFixed(1)
    : '0.0';

  const topRated = appraisals.filter(a => Number(a.performanceRating) >= 4).length;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#6366f1';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1>Appraisal Management</h1>
          <p>Review manager evaluations, rating performance and overall scores</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={16} /> {showForm ? 'Close Form' : 'New Appraisal'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card primary">
          <div className="stat-card-info">
            <div className="stat-card-label">Total Appraisals</div>
            <div className="stat-card-value">{appraisals.length}</div>
            <div className="stat-card-sub">Recorded reviews</div>
          </div>
          <div className="stat-card-icon"><Award size={22} /></div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-info">
            <div className="stat-card-label">Avg. Rating</div>
            <div className="stat-card-value" style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              {avgRating} <span style={{ fontSize: '1rem', color: '#f59e0b' }}>⭐</span>
            </div>
            <div className="stat-card-sub">Out of 5.0 stars</div>
          </div>
          <div className="stat-card-icon"><Star size={22} /></div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-info">
            <div className="stat-card-label">Avg. Appraisal Score</div>
            <div className="stat-card-value">{avgScore}</div>
            <div className="stat-card-sub">Weighted 20% total</div>
          </div>
          <div className="stat-card-icon"><TrendingUp size={22} /></div>
        </div>

        <div className="stat-card primary" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}>
          <div className="stat-card-info">
            <div className="stat-card-label">High Ratings (4-5★)</div>
            <div className="stat-card-value" style={{ color: '#166534' }}>{topRated}</div>
            <div className="stat-card-sub">Top tier reviews</div>
          </div>
          <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#166534' }}><Sparkles size={22} /></div>
        </div>
      </div>

      {/* Add / Edit Form Modal or Card */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #818cf8', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)' }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><Star size={16} /></div>
              Add Manager Appraisal
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select
                  className="form-select"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId}) - {emp.department}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Performance Rating (1 to 5 Stars) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '42px', padding: '0 8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormData({ ...formData, performanceRating: star })}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.6rem',
                        transition: 'transform 0.15s ease',
                        transform: (hoverRating || formData.performanceRating) >= star ? 'scale(1.2)' : 'scale(1)',
                        padding: '0 2px'
                      }}
                    >
                      {(hoverRating || formData.performanceRating) >= star ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span style={{ marginLeft: 12, fontWeight: 700, color: '#4f46e5', fontSize: '0.95rem' }}>
                    {formData.performanceRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Appraisal Score (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  required
                  value={formData.appraisalScore}
                  onChange={(e) => setFormData({ ...formData, appraisalScore: Number(e.target.value) })}
                  placeholder="e.g. 88"
                />
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">Manager Feedback & Evaluation *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  placeholder="Provide detailed qualitative feedback regarding this employee's goals, milestones, and strengths..."
                  value={formData.managerEvaluation}
                  onChange={(e) => setFormData({ ...formData, managerEvaluation: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Submit Appraisal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Records */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📋</div>
            All Appraisals & Evaluations
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{appraisals.length} records</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 54, borderRadius: 8 }} />)}
          </div>
        ) : appraisals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⭐</div>
            <h3>No appraisals recorded yet</h3>
            <p>Click "New Appraisal" above to create an evaluation.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Rating</th>
                  <th>Appraisal Score</th>
                  <th>Manager Evaluation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appraisals.map((appr) => {
                  const empName = appr.employeeId?.name || 'Unknown';
                  const score = Number(appr.appraisalScore) || 0;
                  const scoreColor = getScoreColor(score);

                  return (
                    <tr key={appr._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {empName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{empName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {appr.employeeId?.employeeId || 'ID: --'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#f59e0b', fontSize: '1rem' }}>
                            {'★'.repeat(appr.performanceRating)}
                            <span style={{ color: '#d1d5db' }}>{'★'.repeat(Math.max(0, 5 - appr.performanceRating))}</span>
                          </span>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginLeft: 4 }}>
                            ({appr.performanceRating}/5)
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, maxWidth: 80 }}>
                            <div className="progress-wrap">
                              <div
                                className="progress-bar"
                                style={{ width: `${Math.min(score, 100)}%`, background: scoreColor }}
                              />
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, color: scoreColor, minWidth: 32 }}>
                            {score}/100
                          </span>
                        </div>
                      </td>

                      <td style={{ maxWidth: 300 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 6,
                          background: '#f8fafc',
                          padding: '6px 10px',
                          borderRadius: 6,
                          borderLeft: '3px solid #6366f1'
                        }}>
                          <MessageSquare size={13} style={{ color: '#6366f1', marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.83rem', color: '#334151', fontStyle: 'italic', lineHeight: 1.4 }}>
                            "{appr.managerEvaluation}"
                          </span>
                        </div>
                      </td>

                      <td>
                        <button
                          onClick={() => handleDelete(appr._id, empName)}
                          className="btn btn-danger btn-sm"
                          title="Delete appraisal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appraisals;
