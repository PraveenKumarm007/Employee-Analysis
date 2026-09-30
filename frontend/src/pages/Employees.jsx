import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Plus, Pencil, Trash2, Eye, Search, UserPlus } from 'lucide-react';
import { useEffect } from 'react';

const DEPTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];
const POSITIONS = ['Software Engineer', 'Senior Developer', 'HR Manager', 'Financial Analyst', 'Marketing Specialist', 'Sales Executive', 'DevOps Engineer', 'SEO Expert', 'Manager'];

const initForm = { name: '', email: '', employeeId: '', department: '', position: '', role: 'Employee', password: '' };

const Employees = () => {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data);
    } catch {
      addToast('Failed to load employees', 'error');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useSocket(fetchEmployees);

  const openAdd = () => { setEditing(null); setForm(initForm); setShowModal(true); };
  const openEdit = (emp) => {
    setEditing(emp._id);
    setForm({ name: emp.name, email: emp.email, employeeId: emp.employeeId, department: emp.department, position: emp.position, role: emp.role, password: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await API.put(`/employees/${editing}`, payload);
        addToast('Employee updated successfully!', 'success');
      } else {
        await API.post('/employees', form);
        addToast('Employee added successfully!', 'success');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/employees/${id}`);
      addToast(`${name} deleted.`, 'info');
      fetchEmployees();
    } catch { addToast('Delete failed', 'error'); }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const deptColors = { Engineering: '#6366f1', HR: '#10b981', Finance: '#f59e0b', Marketing: '#3b82f6', Sales: '#8b5cf6', Operations: '#ef4444' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Employees</h1>
          <p>Manage your workforce — {employees.length} total employees</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={15} /> Add Employee
        </button>
      </div>

      <div className="card" style={{ marginBottom: 0 }}>
        {/* Search */}
        <div style={{ marginBottom: 20, position: 'relative', maxWidth: 340 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No employees found</h3>
            <p>{search ? 'Try a different search term' : 'Click "Add Employee" to get started'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>ID</th><th>Department</th><th>Position</th><th>Role</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${deptColors[emp.department] || '#6366f1'}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                          {emp.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem' }}>{emp.employeeId}</code></td>
                    <td>
                      <span style={{ background: `${deptColors[emp.department] || '#6366f1'}18`, color: deptColors[emp.department] || '#6366f1', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{emp.position}</td>
                    <td>
                      <span style={{ background: emp.role === 'Admin' ? '#fef3c7' : '#f1f5f9', color: emp.role === 'Admin' ? '#92400e' : '#475569', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/employees/${emp._id}`} className="btn btn-ghost btn-sm" title="View Report">
                          <Eye size={13} />
                        </Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">
              {editing ? <><Pencil size={18} /> Edit Employee</> : <><UserPlus size={18} /> Add New Employee</>}
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Smith" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID *</label>
                  <input className="form-input" required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="EMP009" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" required value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    <option value="">Select Department</option>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Position *</label>
                  <select className="form-select" required value={form.position} onChange={e => setForm({...form, position: e.target.value})}>
                    <option value="">Select Position</option>
                    {POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option>Employee</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                  <input className="form-input" type="password" required={!editing} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editing ? '••••••••' : 'Set password'} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
