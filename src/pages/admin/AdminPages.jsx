import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, auditAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, AdminSidebar, PageHeader, StatusBadge, LoadingPage, Logo } from '../../components/shared.jsx';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Admin Login ───────────────────────────────────────────────────
export function AdminLogin() {
  const [form, setForm] = useState({ adminId: 'ADMIN001', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await adminAPI.login(form);
      const d = r.data.data;
      loginUser({ fullName: d.fullName, officerId: d.officerId }, 'ADMIN', d.accessToken);
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #112240 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/"><Logo /></Link>
          <div style={{ marginTop: 20, display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 8, padding: '8px 20px' }}>
            <span style={{ color: '#c9a84c', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>ADMINISTRATOR PORTAL</span>
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginTop: 16, color: 'white' }}>Admin Sign In</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Admin ID</label>
              <input className="form-input" value={form.adminId} onChange={e => setForm({ ...form, adminId: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-full" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96c)', color: '#0a1628', fontWeight: 700, padding: '14px', marginTop: 8 }}>
              {loading ? <span className="spinner" style={{ borderTopColor: '#0a1628' }} /> : 'Sign In as Admin'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 20 }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────
export function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getPendingOfficers(), adminAPI.getAllOfficers(), adminAPI.getAllUsers()])
      .then(([p, o, u]) => { setPending(p.data.data || []); setOfficers(o.data.data || []); setUsers(u.data.data || []); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout sidebar={<AdminSidebar />}><LoadingPage /></DashboardLayout>;

  const approved = officers.filter(o => o.status === 'APPROVED').length;
  const totalBalance = users.reduce((s, u) => s + (u.accounts?.reduce((a, acc) => a + (acc.balance || 0), 0) || 0), 0);

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <PageHeader title="Admin Dashboard" subtitle="System overview" />
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Customers', value: users.length, color: '#1a6bcc' },
          { label: 'Pending Approvals', value: pending.length, color: pending.length > 0 ? '#c9a84c' : '#00b894' },
          { label: 'Active Officers', value: approved, color: '#00b894' },
          { label: 'Total Deposits', value: fmt(totalBalance), color: '#7c3aed', small: true },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <p className="stat-label">{s.label}</p>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: s.small ? 18 : 32, color: s.color, margin: '8px 0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="section-title">⚠️ Pending Officer Approvals</h3>
            <span className="badge badge-warning">{pending.length} pending</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>DOB</th><th>Applied</th><th>Actions</th></tr></thead>
              <tbody>
                {pending.slice(0, 5).map(o => (
                  <tr key={o.email}>
                    <td className="fw-600">{o.fullName}</td>
                    <td>{o.email}</td>
                    <td>{o.dob}</td>
                    <td className="text-muted text-sm">{fmtDate(o.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={async () => {
                          try { await adminAPI.approveOfficer({ officerEmail: o.email }); toast.success('Officer approved! ID sent via email.'); setPending(p => p.filter(x => x.email !== o.email)); }
                          catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
                        }}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={async () => {
                          const reason = prompt('Rejection reason:');
                          if (!reason) return;
                          try { await adminAPI.rejectOfficer({ officerEmail: o.email, rejectionReason: reason }); toast.success('Rejected'); setPending(p => p.filter(x => x.email !== o.email)); }
                          catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
                        }}>✗ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent users */}
      <div className="card">
        <div className="card-header">
          <h3 className="section-title">Recent Customers</h3>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Status</th><th>Accounts</th></tr></thead>
            <tbody>
              {users.slice(0, 8).map(u => (
                <tr key={u.customerId}>
                  <td><span className="font-mono text-sm">{u.customerId}</span></td>
                  <td className="fw-600">{u.fullName}</td>
                  <td>{u.email}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>{u.accounts?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Officers Management ───────────────────────────────────────────
export function OfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = () => {
    setLoading(true);
    adminAPI.getAllOfficers().then(r => setOfficers(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filter === 'ALL' ? officers : officers.filter(o => o.status === filter);

  const handleApprove = async (email) => {
    try { await adminAPI.approveOfficer({ officerEmail: email }); toast.success('Approved! Officer ID sent via email.'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleReject = async (email) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await adminAPI.rejectOfficer({ officerEmail: email, rejectionReason: reason }); toast.success('Rejected'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this officer?')) return;
    try { await adminAPI.removeOfficer(id); toast.success('Officer suspended'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleReactivate = async (id) => {
    try { await adminAPI.reactivateOfficer(id); toast.success('Officer reactivated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <PageHeader title="Compliance Officers" subtitle="Manage officer registrations and access" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>
      <div className="card">
        {loading ? <LoadingPage /> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">◈</div><p>No officers found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Officer ID</th><th>Name</th><th>Email</th><th>DOB</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.email}>
                    <td><span className="font-mono text-sm">{o.officerId || '—'}</span></td>
                    <td className="fw-600">{o.fullName}</td>
                    <td>{o.email}</td>
                    <td>{o.dob}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-muted text-sm">{fmtDate(o.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {o.status === 'PENDING' && <>
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(o.email)}>✓ Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(o.email)}>✗ Reject</button>
                        </>}
                        {o.status === 'APPROVED' && <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(o.officerId)}>Suspend</button>}
                        {o.status === 'SUSPENDED' && <button className="btn btn-success btn-sm" onClick={() => handleReactivate(o.officerId)}>Reactivate</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Users Management ──────────────────────────────────────────────
export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [freezeForm, setFreezeForm] = useState({ show: false, accountNumber: '', reason: '', action: 'freeze' });

  const load = () => { setLoading(true); adminAPI.getAllUsers().then(r => setUsers(r.data.data || [])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleLock = async (customerId, action) => {
    try {
      if (action === 'lock') await adminAPI.lockUser(customerId);
      else await adminAPI.unlockUser(customerId);
      toast.success(`User ${action}ed`); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleFreezeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (freezeForm.action === 'freeze') await adminAPI.freezeAccount({ accountNumber: freezeForm.accountNumber, reason: freezeForm.reason });
      else await adminAPI.unfreezeAccount({ accountNumber: freezeForm.accountNumber, reason: freezeForm.reason });
      toast.success(`Account ${freezeForm.action}d`);
      setFreezeForm({ show: false, accountNumber: '', reason: '', action: 'freeze' }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <PageHeader title="All Customers" subtitle={`${users.length} registered customers`} />
      <div className="card">
        {loading ? <LoadingPage /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Accounts</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <React.Fragment key={u.customerId}>
                    <tr>
                      <td><span className="font-mono text-sm">{u.customerId}</span></td>
                      <td className="fw-600">{u.fullName}</td>
                      <td className="text-sm">{u.email}</td>
                      <td className="text-sm">{u.phoneNumber}</td>
                      <td><StatusBadge status={u.status} /></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(selected === u.customerId ? null : u.customerId)}>
                          {u.accounts?.length || 0} acct(s) {selected === u.customerId ? '▲' : '▼'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {u.status === 'ACTIVE' && <button className="btn btn-danger btn-sm" onClick={() => handleLock(u.customerId, 'lock')}>Lock</button>}
                          {u.status === 'LOCKED' && <button className="btn btn-success btn-sm" onClick={() => handleLock(u.customerId, 'unlock')}>Unlock</button>}
                        </div>
                      </td>
                    </tr>
                    {selected === u.customerId && u.accounts?.map(acc => (
                      <tr key={acc.accountNumber} style={{ background: 'rgba(26,107,204,0.03)' }}>
                        <td colSpan={2} style={{ paddingLeft: 40 }}>
                          <span className="font-mono text-sm" style={{ color: 'var(--sky)' }}>↳ {acc.accountNumber}</span>
                          <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: 11 }}>{acc.accountType}</span>
                        </td>
                        <td colSpan={2}><span className="fw-600">{fmt(acc.balance)}</span></td>
                        <td><StatusBadge status={acc.status} /></td>
                        <td />
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {acc.status !== 'FROZEN' && acc.status !== 'CLOSED' && (
                              <button className="btn btn-sm" style={{ background: 'rgba(26,107,204,0.1)', color: 'var(--sky)', fontSize: 12 }}
                                onClick={() => setFreezeForm({ show: true, accountNumber: acc.accountNumber, reason: '', action: 'freeze' })}>Freeze</button>
                            )}
                            {acc.status === 'FROZEN' && (
                              <button className="btn btn-sm" style={{ background: 'rgba(0,184,148,0.1)', color: 'var(--mint)', fontSize: 12 }}
                                onClick={() => setFreezeForm({ show: true, accountNumber: acc.accountNumber, reason: '', action: 'unfreeze' })}>Unfreeze</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Freeze/Unfreeze modal */}
      {freezeForm.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22 }}>
                {freezeForm.action === 'freeze' ? '🔒 Freeze Account' : '🔓 Unfreeze Account'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setFreezeForm({ ...freezeForm, show: false })}>✕</button>
            </div>
            <form onSubmit={handleFreezeSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input className="form-input font-mono" value={freezeForm.accountNumber} readOnly style={{ background: 'var(--slate)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input className="form-input" placeholder="State the reason..." value={freezeForm.reason}
                    onChange={e => setFreezeForm({ ...freezeForm, reason: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setFreezeForm({ ...freezeForm, show: false })}>Cancel</button>
                <button type="submit" className={`btn ${freezeForm.action === 'freeze' ? 'btn-danger' : 'btn-success'}`}>
                  {freezeForm.action === 'freeze' ? 'Freeze Account' : 'Unfreeze Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ── Admin Audit Viewer ────────────────────────────────────────────
export function AdminAuditPage() {
  const [mode, setMode] = useState('account'); // 'account' | 'customer'
  const [form, setForm] = useState({ accountNumber: '', customerId: '', from: new Date(new Date().setDate(1)).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault(); setLoading(true); setSearched(true);
    try {
      if (mode === 'account') {
        const [t, s] = await Promise.all([
          adminAPI.complianceTransactions(form.accountNumber, form.from, form.to),
          adminAPI.complianceSummary(form.accountNumber, form.from, form.to),
        ]);
        setTransactions(t.data.data || []); setSummary(s.data.data);
      } else {
        const t = await adminAPI.complianceByCustomer(form.customerId, form.from, form.to);
        setTransactions(t.data.data || []); setSummary(null);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Search failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <PageHeader title="Audit Viewer" subtitle="View transactions for any account or customer" />
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${mode === 'account' ? 'active' : ''}`} onClick={() => { setMode('account'); setSearched(false); }}>By Account Number</button>
        <button className={`tab ${mode === 'customer' ? 'active' : ''}`} onClick={() => { setMode('customer'); setSearched(false); }}>By Customer ID</button>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {mode === 'account' ? (
              <div className="form-group" style={{ margin: 0, flex: 2, minWidth: 200 }}>
                <label className="form-label">Account Number</label>
                <input className="form-input font-mono" placeholder="e.g. SB100000000001" value={form.accountNumber}
                  onChange={e => setForm({ ...form, accountNumber: e.target.value })} required />
              </div>
            ) : (
              <div className="form-group" style={{ margin: 0, flex: 2, minWidth: 200 }}>
                <label className="form-label">Customer ID</label>
                <input className="form-input font-mono" placeholder="e.g. CUS000000001" value={form.customerId}
                  onChange={e => setForm({ ...form, customerId: e.target.value })} required />
              </div>
            )}
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
              <label className="form-label">From</label>
              <input className="form-input" type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
              <label className="form-label">To</label>
              <input className="form-input" type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '◉ Search'}
            </button>
          </form>
        </div>
      </div>
      {summary && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: summary.totalTransactions, color: 'var(--sky)' },
            { label: 'Credit', value: fmt(summary.totalCredit), color: 'var(--mint)' },
            { label: 'Debit', value: fmt(summary.totalDebit), color: 'var(--rose)' },
            { label: 'Net Flow', value: fmt(summary.netFlow), color: summary.netFlow >= 0 ? 'var(--mint)' : 'var(--rose)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <p className="stat-label">{s.label}</p>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: s.color, margin: '6px 0' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
      {searched && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Results</h3>
            <span className="badge badge-info">{transactions.length} records</span>
          </div>
          {loading ? <LoadingPage /> : transactions.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">◉</div><p>No transactions found</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Reference</th><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Fee</th><th>Balance After</th><th>Date</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.transactionRef}>
                      <td><span className="font-mono text-sm">{t.transactionRef}</span></td>
                      <td><StatusBadge status={t.transactionType || t.flowDirection} /></td>
                      <td className="font-mono text-xs text-muted">{t.fromAccount || t.accountNumber || '—'}</td>
                      <td className="font-mono text-xs text-muted">{t.toAccount || t.counterpartAccount || '—'}</td>
                      <td><span className="fw-600" style={{ color: t.flowDirection === 'CREDIT' ? 'var(--mint)' : 'var(--rose)' }}>{fmt(t.amount)}</span></td>
                      <td className="text-muted text-sm">{t.feeAmount > 0 ? fmt(t.feeAmount) : '—'}</td>
                      <td className="fw-600">{fmt(t.balanceAfter)}</td>
                      <td className="text-muted text-sm">{new Date(t.transactionTime || t.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
