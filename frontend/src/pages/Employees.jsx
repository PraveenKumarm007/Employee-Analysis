import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { Pencil, Trash2, Eye, Search, UserPlus, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const DEPTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];
const POSITIONS = ['Software Engineer', 'Senior Developer', 'HR Manager', 'Financial Analyst', 'Marketing Specialist', 'Sales Executive', 'DevOps Engineer', 'SEO Expert', 'Manager'];

const initForm = { name: '', email: '', phone: '', employeeId: '', department: '', position: '', role: 'Employee', status: 'Active', password: '' };

const Employees = () => {
  const { addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data);
    } catch {
      addToast('Failed to load users', 'error');
    } finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useSocket(fetchEmployees);

  const openAdd = () => { setEditing(null); setForm(initForm); setShowModal(true); };
  const openEdit = (emp) => {
    setEditing(emp._id);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      employeeId: emp.employeeId,
      department: emp.department,
      position: emp.position,
      role: emp.role || 'Employee',
      status: emp.status || 'Active',
      password: ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await API.put(`/employees/${editing}`, payload);
        addToast('User updated successfully!', 'success');
      } else {
        await API.post('/employees', form);
        addToast('User added successfully!', 'success');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      await API.put(`/employees/${emp._id}`, { status: newStatus });
      addToast(`Account for ${emp.name} is now ${newStatus}.`, 'info');
      fetchEmployees();
    } catch {
      addToast('Failed to change status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/employees/${id}`);
      addToast(`${name} deleted successfully.`, 'info');
      fetchEmployees();
    } catch { addToast('Delete failed', 'error'); }
  };

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone || '').includes(search) ||
      e.department.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || (e.status || 'Active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deptColors = { Engineering: '#6366f1', HR: '#10b981', Finance: '#f59e0b', Marketing: '#3b82f6', Sales: '#8b5cf6', Operations: '#ef4444' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>User & Account Management</h1>
          <p>Administrative view — {employees.length} total registered accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={15} /> Add User / Admin
        </button>
      </div>

      <div className="card" style={{ marginBottom: 0 }}>
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search by name, email, phone or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Users
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Active' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'Inactive' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('Inactive')}
            >
              Deactivated
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>{search ? 'Try a different search term or filter' : 'Click "Add User / Admin" to create an account'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User / Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${deptColors[emp.department] || '#6366f1'}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          {emp.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {emp.email} {emp.phone ? `• ${emp.phone}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: emp.role === 'Admin' ? '#fef3c7' : '#f1f5f9',
                        color: emp.role === 'Admin' ? '#92400e' : '#475569',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {emp.role === 'Admin' && <ShieldAlert size={12} />}
                        {emp.role || 'Employee'}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: `${deptColors[emp.department] || '#6366f1'}18`, color: deptColors[emp.department] || '#6366f1', padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                        {emp.department || 'General'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: (emp.status || 'Active') === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: (emp.status || 'Active') === 'Active' ? '#16a34a' : '#dc2626',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {(emp.status || 'Active') === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/employees/${emp._id}`} className="btn btn-ghost btn-sm" title="View Details / Performance">
                          <Eye size={14} />
                        </Link>

                        <button
                          className={`btn btn-sm ${emp.status === 'Inactive' ? 'btn-success' : 'btn-ghost'}`}
                          style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'Inactive' ? 'Activate Account' : 'Deactivate Account'}
                        >
                          {emp.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                        </button>

                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)} title="Edit User">
                          <Pencil size={14} />
                        </button>

                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)} title="Delete Account">
                          <Trash2 size={14} />
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
              {editing ? <><Pencil size={18} /> Edit User Details</> : <><UserPlus size={18} /> Add New User / Admin</>}
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Smith" />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
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
                    <option value="Employee">User / Employee</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Deactivated</option>
                  </select>
                </div>

                <div className="form-group form-grid-full">
                  <label className="form-label">{editing ? 'New Password (leave blank to keep unchanged)' : 'Password *'}</label>
                  <input className="form-input" type="password" required={!editing} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editing ? '••••••••' : 'Set password'} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Account'}
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
