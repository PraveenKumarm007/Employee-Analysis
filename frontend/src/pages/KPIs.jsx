import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Target } from 'lucide-react';

const KPIs = () => {
  const { addToast } = useToast();
  const [kpis, setKpis] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', kpiName: '', targetValue: '', achievedValue: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, empRes] = await Promise.all([API.get('/kpis'), API.get('/employees')]);
      setKpis(kpiRes.data); setEmployees(empRes.data);
    } catch { addToast('Failed to load KPIs', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useSocket(fetchData);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/kpis', form);
      setForm({ employeeId: '', kpiName: '', targetValue: '', achievedValue: '' });
      setShowForm(false);
      addToast('KPI added successfully!', 'success');
      fetchData();
    } catch { addToast('Failed to add KPI', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this KPI?')) return;
    try { await API.delete(`/kpis/${id}`); addToast('KPI deleted', 'info'); fetchData(); }
    catch { addToast('Delete failed', 'error'); }
  };

  const scoreColor = (score) => score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>KPI Management</h1>
          <p>Track and manage employee key performance indicators</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> Add KPI
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card primary">
          <div className="stat-card-info">
            <div className="stat-card-label">Total KPIs</div>
            <div className="stat-card-value">{kpis.length}</div>
          </div>
          <div className="stat-card-icon"><Target size={22} /></div>
        </div>
        <div className="stat-card success">
          <div className="stat-card-info">
            <div className="stat-card-label">High Performers (≥80)</div>
            <div className="stat-card-value">{kpis.filter(k => (k.kpiScore || 0) >= 80).length}</div>
          </div>
          <div className="stat-card-icon">🏆</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-card-info">
            <div className="stat-card-label">Avg KPI Score</div>
            <div className="stat-card-value">{kpis.length ? (kpis.reduce((s, k) => s + (k.kpiScore || 0), 0) / kpis.length).toFixed(1) : 0}</div>
          </div>
          <div className="stat-card-icon">📊</div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #e0e7ff' }}>
          <div className="card-header">
            <div className="card-title"><Plus size={16} /> New KPI Entry</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select className="form-select" required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">KPI Name *</label>
                <input className="form-input" required placeholder="e.g. Sales Target" value={form.kpiName} onChange={e => setForm({...form, kpiName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Value *</label>
                <input className="form-input" type="number" required placeholder="100" value={form.targetValue} onChange={e => setForm({...form, targetValue: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Achieved Value *</label>
                <input className="form-input" type="number" required placeholder="85" value={form.achievedValue} onChange={e => setForm({...form, achievedValue: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add KPI'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header"><div className="card-title">📋 All KPI Records</div></div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
          </div>
        ) : kpis.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎯</div><h3>No KPIs yet</h3><p>Click "Add KPI" to get started.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>KPI Name</th><th>Target</th><th>Achieved</th><th>Score</th><th>Progress</th><th></th></tr></thead>
              <tbody>
                {kpis.map(kpi => {
                  const score = kpi.kpiScore || 0;
                  const emp = employees.find(e => e._id === kpi.employeeId?._id || e._id === kpi.employeeId);
                  return (
                    <tr key={kpi._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                            {(kpi.employeeId?.name || emp?.name || '?').charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{kpi.employeeId?.name || emp?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{kpi.kpiName}</td>
                      <td style={{ color: '#64748b' }}>{kpi.targetValue}</td>
                      <td style={{ color: '#64748b' }}>{kpi.achievedValue}</td>
                      <td><span style={{ fontWeight: 700, color: scoreColor(score), fontSize: '0.95rem' }}>{score.toFixed(1)}</span></td>
                      <td style={{ minWidth: 120 }}>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${Math.min(score, 100)}%`, background: scoreColor(score) }} />
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(kpi._id)}><Trash2 size={13} /></button>
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

export default KPIs;
