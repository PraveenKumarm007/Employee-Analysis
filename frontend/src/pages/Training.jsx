import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

const STATUSES = ['Not Started', 'In Progress', 'Completed'];

const Training = () => {
  const { addToast } = useToast();
  const [training, setTraining] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', trainingName: '', trainingStatus: 'Not Started', completionPercentage: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, eRes] = await Promise.all([API.get('/training'), API.get('/employees')]);
      setTraining(tRes.data); setEmployees(eRes.data);
    } catch { addToast('Failed to load training data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useSocket(fetchData);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/training', form);
      setForm({ employeeId: '', trainingName: '', trainingStatus: 'Not Started', completionPercentage: '' });
      setShowForm(false);
      addToast('Training record added!', 'success');
      fetchData();
    } catch { addToast('Failed to add record', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training record?')) return;
    try { await API.delete(`/training/${id}`); addToast('Deleted', 'info'); fetchData(); }
    catch { addToast('Delete failed', 'error'); }
  };

  const statusStyle = s => ({
    Completed: { bg: '#dcfce7', color: '#166534' },
    'In Progress': { bg: '#dbeafe', color: '#1e40af' },
    'Not Started': { bg: '#f1f5f9', color: '#475569' },
  }[s] || { bg: '#f1f5f9', color: '#475569' });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Training Management</h1><p>Track employee learning and development</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Record</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card primary"><div className="stat-card-info"><div className="stat-card-label">Total Records</div><div className="stat-card-value">{training.length}</div></div><div className="stat-card-icon"><GraduationCap size={22} /></div></div>
        <div className="stat-card success"><div className="stat-card-info"><div className="stat-card-label">Completed</div><div className="stat-card-value">{training.filter(t => t.trainingStatus === 'Completed').length}</div></div><div className="stat-card-icon">✅</div></div>
        <div className="stat-card warning"><div className="stat-card-info"><div className="stat-card-label">In Progress</div><div className="stat-card-value">{training.filter(t => t.trainingStatus === 'In Progress').length}</div></div><div className="stat-card-icon">⏳</div></div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #e0e7ff' }}>
          <div className="card-header"><div className="card-title"><Plus size={16} /> New Training Record</div></div>
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
                <label className="form-label">Training Name *</label>
                <input className="form-input" required placeholder="React Advanced" value={form.trainingName} onChange={e => setForm({...form, trainingName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select className="form-select" value={form.trainingStatus} onChange={e => setForm({...form, trainingStatus: e.target.value})}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Completion % *</label>
                <input className="form-input" type="number" min="0" max="100" required placeholder="75" value={form.completionPercentage} onChange={e => setForm({...form, completionPercentage: e.target.value})} />
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
        <div className="card-header"><div className="card-title">🎓 Training Records</div></div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}</div>
        ) : training.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎓</div><h3>No training records</h3><p>Click "Add Record" to begin tracking.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Training</th><th>Status</th><th>Completion</th><th></th></tr></thead>
              <tbody>
                {training.map(t => {
                  const st = statusStyle(t.trainingStatus);
                  return (
                    <tr key={t._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                            {(t.employeeId?.name || '?').charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{t.employeeId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.trainingName}</td>
                      <td><span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{t.trainingStatus}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, maxWidth: 120 }}><div className="progress-wrap"><div className="progress-bar" style={{ width: `${t.completionPercentage}%`, background: st.color }} /></div></div>
                          <span style={{ fontWeight: 700, color: st.color, minWidth: 36 }}>{t.completionPercentage}%</span>
                        </div>
                      </td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}><Trash2 size={13} /></button></td>
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

export default Training;
