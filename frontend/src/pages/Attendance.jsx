import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, CalendarCheck } from 'lucide-react';

const Attendance = () => {
  const { addToast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', totalWorkingDays: '', presentDays: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [aRes, eRes] = await Promise.all([API.get('/attendance'), API.get('/employees')]);
      setAttendance(aRes.data); setEmployees(eRes.data);
    } catch { addToast('Failed to load attendance', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useSocket(fetchData);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/attendance', form);
      setForm({ employeeId: '', totalWorkingDays: '', presentDays: '' });
      setShowForm(false);
      addToast('Attendance record added!', 'success');
      fetchData();
    } catch { addToast('Failed to add record', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try { await API.delete(`/attendance/${id}`); addToast('Deleted', 'info'); fetchData(); }
    catch { addToast('Delete failed', 'error'); }
  };

  const avgPct = attendance.length ? (attendance.reduce((s, a) => s + (a.attendancePercentage || 0), 0) / attendance.length).toFixed(1) : 0;
  const pctColor = p => p >= 90 ? '#10b981' : p >= 75 ? '#6366f1' : p >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Attendance Tracking</h1><p>Monitor employee attendance records</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Record</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card primary"><div className="stat-card-info"><div className="stat-card-label">Total Records</div><div className="stat-card-value">{attendance.length}</div></div><div className="stat-card-icon"><CalendarCheck size={22} /></div></div>
        <div className="stat-card success"><div className="stat-card-info"><div className="stat-card-label">Avg Attendance</div><div className="stat-card-value">{avgPct}%</div></div><div className="stat-card-icon">📅</div></div>
        <div className="stat-card danger"><div className="stat-card-info"><div className="stat-card-label">Below 75%</div><div className="stat-card-value">{attendance.filter(a => (a.attendancePercentage || 0) < 75).length}</div></div><div className="stat-card-icon">⚠️</div></div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #e0e7ff' }}>
          <div className="card-header"><div className="card-title"><Plus size={16} /> New Attendance Record</div></div>
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
                <label className="form-label">Total Working Days *</label>
                <input className="form-input" type="number" required placeholder="26" value={form.totalWorkingDays} onChange={e => setForm({...form, totalWorkingDays: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Days Present *</label>
                <input className="form-input" type="number" required placeholder="24" value={form.presentDays} onChange={e => setForm({...form, presentDays: e.target.value})} />
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
        <div className="card-header"><div className="card-title">📅 Attendance Records</div></div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}</div>
        ) : attendance.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No records yet</h3><p>Click "Add Record" to begin tracking.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Total Days</th><th>Present</th><th>Absent</th><th>Attendance %</th><th></th></tr></thead>
              <tbody>
                {attendance.map(a => {
                  const pct = a.attendancePercentage || 0;
                  return (
                    <tr key={a._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                            {(a.employeeId?.name || '?').charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{a.employeeId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.totalWorkingDays}</td>
                      <td><span style={{ color: '#10b981', fontWeight: 700 }}>{a.presentDays}</span></td>
                      <td><span style={{ color: '#ef4444', fontWeight: 700 }}>{a.absentDays}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, maxWidth: 100 }}><div className="progress-wrap"><div className="progress-bar" style={{ width: `${pct}%`, background: pctColor(pct) }} /></div></div>
                          <span style={{ fontWeight: 700, color: pctColor(pct), minWidth: 48 }}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}><Trash2 size={13} /></button></td>
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

export default Attendance;
