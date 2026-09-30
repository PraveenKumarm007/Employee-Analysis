import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Briefcase } from 'lucide-react';

const Projects = () => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', projectName: '', contributionDescription: '', contributionScore: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, eRes] = await Promise.all([API.get('/projects'), API.get('/employees')]);
      setProjects(pRes.data); setEmployees(eRes.data);
    } catch { addToast('Failed to load projects', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useSocket(fetchData);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/projects', form);
      setForm({ employeeId: '', projectName: '', contributionDescription: '', contributionScore: '' });
      setShowForm(false);
      addToast('Project contribution added!', 'success');
      fetchData();
    } catch { addToast('Failed to add project', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project record?')) return;
    try { await API.delete(`/projects/${id}`); addToast('Deleted', 'info'); fetchData(); }
    catch { addToast('Delete failed', 'error'); }
  };

  const scoreColor = s => s >= 80 ? '#10b981' : s >= 60 ? '#6366f1' : s >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Project Contributions</h1><p>Track employee project involvement and scores</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Record</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card primary"><div className="stat-card-info"><div className="stat-card-label">Total Records</div><div className="stat-card-value">{projects.length}</div></div><div className="stat-card-icon"><Briefcase size={22} /></div></div>
        <div className="stat-card success"><div className="stat-card-info"><div className="stat-card-label">High Score (≥80)</div><div className="stat-card-value">{projects.filter(p => p.contributionScore >= 80).length}</div></div><div className="stat-card-icon">⭐</div></div>
        <div className="stat-card warning"><div className="stat-card-info"><div className="stat-card-label">Avg Score</div><div className="stat-card-value">{projects.length ? (projects.reduce((s,p) => s + p.contributionScore, 0) / projects.length).toFixed(1) : 0}</div></div><div className="stat-card-icon">📊</div></div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #e0e7ff' }}>
          <div className="card-header"><div className="card-title"><Plus size={16} /> New Project Contribution</div></div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select className="form-select" required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" required placeholder="Project Alpha" value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})} />
              </div>
              <div className="form-group form-grid-full">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" required placeholder="Describe the contribution..." value={form.contributionDescription} onChange={e => setForm({...form, contributionDescription: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Score (0-100) *</label>
                <input className="form-input" type="number" min="0" max="100" required placeholder="85" value={form.contributionScore} onChange={e => setForm({...form, contributionScore: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Record'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header"><div className="card-title">💼 Project Records</div></div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}</div>
        ) : projects.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">💼</div><h3>No project records</h3><p>Click "Add Record" to get started.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Project</th><th>Description</th><th>Score</th><th>Progress</th><th></th></tr></thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                          {(p.employeeId?.name || '?').charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{p.employeeId?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.projectName}</td>
                    <td style={{ color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.contributionDescription}</td>
                    <td><span style={{ fontWeight: 700, color: scoreColor(p.contributionScore) }}>{p.contributionScore}</span></td>
                    <td style={{ minWidth: 120 }}><div className="progress-wrap"><div className="progress-bar" style={{ width: `${Math.min(p.contributionScore, 100)}%`, background: scoreColor(p.contributionScore) }} /></div></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
