import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { complianceAPI, auditAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout, ComplianceSidebar, PageHeader, StatusBadge, LoadingPage, Logo } from '../../components/shared.jsx';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Register ──────────────────────────────────────────────────────
export function ComplianceRegister() {
  const [form, setForm] = useState({ fullName: '', dob: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await complianceAPI.register(form);
      setSuccess(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f5f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/"><Logo /></Link>
          <div style={{ marginTop: 20, display: 'inline-block', background: 'rgba(0,184,148,0.1)', border: '1px solid rgba(0,184,148,0.3)', borderRadius: 8, padding: '8px 20px' }}>
            <span style={{ color: '#00b894', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>COMPLIANCE OFFICER PORTAL</span>
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginTop: 16 }}>Apply as Compliance Officer</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Your application will be reviewed by the administrator</p>
        </div>
        <div className="card">
          <div className="card-body">
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--mint)' }}>Application Submitted!</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: 12, marginBottom: 24 }}>
                  Your application is under review. Once approved, you'll receive your Officer ID via email.
                </p>
                <Link to="/compliance/login" className="btn btn-primary">Go to Login →</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Priya Nair" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input className="form-input" type="email" placeholder="priya@securebank.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-success btn-full" disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
          {!success && (
            <div className="card-footer" style={{ textAlign: 'center' }}>
              Already approved? <Link to="/compliance/login" style={{ color: 'var(--mint)', fontWeight: 600 }}>Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────
export function ComplianceLogin() {
  const [form, setForm] = useState({ officerId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await complianceAPI.login(form);
      const d = r.data.data;
      loginUser({ fullName: d.fullName, email: d.email, officerId: d.officerId }, 'COMPLIANCE', d.accessToken);
      toast.success('Welcome, ' + d.fullName);
      navigate('/compliance/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2744 0%, #0a1e35 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/"><Logo /></Link>
          <div style={{ marginTop: 20, display: 'inline-block', background: 'rgba(0,184,148,0.15)', border: '1px solid rgba(0,184,148,0.35)', borderRadius: 8, padding: '8px 20px' }}>
            <span style={{ color: '#00b894', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>COMPLIANCE PORTAL</span>
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginTop: 16, color: 'white' }}>Officer Sign In</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Officer ID</label>
              <input className="form-input font-mono" placeholder="CO20260001" value={form.officerId}
                onChange={e => setForm({ ...form, officerId: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-full" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #00b894, #00d4a8)', color: 'white', fontWeight: 700, padding: '14px', marginTop: 8 }}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 20 }}>
          <Link to="/compliance/register" style={{ color: 'rgba(0,212,168,0.6)' }}>Apply as officer</Link>
          {' · '}
          <Link to="/" style={{ color: 'rgba(255,255,255,0.3)' }}>Home</Link>
        </p>
      </div>
    </div>
  );
}

// ── Compliance Dashboard ──────────────────────────────────────────
export function ComplianceDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { complianceAPI.getAllUsers().then(r => setUsers(r.data.data || [])).finally(() => setLoading(false)); }, []);

  const active = users.filter(u => u.status === 'ACTIVE').length;
  const locked = users.filter(u => u.status === 'LOCKED').length;
  const frozenAccounts = users.flatMap(u => u.accounts || []).filter(a => a.status === 'FROZEN').length;

  return (
    <DashboardLayout sidebar={<ComplianceSidebar />}>
      <PageHeader title="Compliance Dashboard" subtitle="Monitor and manage customer accounts" />
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Customers', value: users.length, color: 'var(--sky)' },
          { label: 'Active', value: active, color: 'var(--mint)' },
          { label: 'Locked Users', value: locked, color: 'var(--rose)' },
          { label: 'Frozen Accounts', value: frozenAccounts, color: '#1a6bcc' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <p className="stat-label">{s.label}</p>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, color: s.color, margin: '8px 0' }}>{s.value}</p>
          </div>
        ))}
      </div>
      {loading ? <LoadingPage /> : (
        <div className="card">
          <div className="card-header"><h3 className="section-title">Recent Customers</h3></div>
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
      )}
    </DashboardLayout>
  );
}

// ── Users Management ──────────────────────────────────────────────
export function ComplianceUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [freezeForm, setFreezeForm] = useState({ show: false, accountNumber: '', reason: '', action: 'freeze' });

  const load = () => { setLoading(true); complianceAPI.getAllUsers().then(r => setUsers(r.data.data || [])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleLock = async (customerId, action) => {
    try {
      if (action === 'lock') await complianceAPI.lockUser(customerId);
      else await complianceAPI.unlockUser(customerId);
      toast.success(`User ${action}ed`); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleFreezeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (freezeForm.action === 'freeze') await complianceAPI.freezeAccount({ accountNumber: freezeForm.accountNumber, reason: freezeForm.reason });
      else await complianceAPI.unfreezeAccount({ accountNumber: freezeForm.accountNumber, reason: freezeForm.reason });
      toast.success(`Account ${freezeForm.action}d`);
      setFreezeForm({ show: false, accountNumber: '', reason: '', action: 'freeze' }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout sidebar={<ComplianceSidebar />}>
      <PageHeader title="User Management" subtitle="Freeze accounts, lock users" />
      <div className="card">
        {loading ? <LoadingPage /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Status</th><th>Accounts</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <React.Fragment key={u.customerId}>
                    <tr>
                      <td><span className="font-mono text-sm">{u.customerId}</span></td>
                      <td className="fw-600">{u.fullName}</td>
                      <td>{u.email}</td>
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
                      <tr key={acc.accountNumber} style={{ background: 'rgba(0,184,148,0.03)' }}>
                        <td colSpan={2} style={{ paddingLeft: 40 }}>
                          <span className="font-mono text-sm" style={{ color: 'var(--mint)' }}>↳ {acc.accountNumber}</span>
                          <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: 11 }}>{acc.accountType}</span>
                        </td>
                        <td colSpan={2}><span className="fw-600">{fmt(acc.balance)}</span></td>
                        <td><StatusBadge status={acc.status} /></td>
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
                  <label className="form-label">Account</label>
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

// ── Compliance Audit Viewer ───────────────────────────────────────
export function ComplianceAuditPage() {
  const [mode, setMode] = useState('account');
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
          auditAPI.complianceTransactions(form.accountNumber, form.from, form.to),
          auditAPI.complianceSummary(form.accountNumber, form.from, form.to),
        ]);
        setTransactions(t.data.data || []); setSummary(s.data.data);
      } else {
        const t = await auditAPI.complianceByCustomer(form.customerId, form.from, form.to);
        setTransactions(t.data.data || []); setSummary(null);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Search failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout sidebar={<ComplianceSidebar />}>
      <PageHeader title="Audit Viewer" subtitle="Investigate any account's transactions by date range" />
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
            <button type="submit" className="btn btn-success" disabled={loading}>
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
            <div className="empty-state"><div className="empty-state-icon">◉</div><p>No transactions in this date range</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Reference</th><th>Type</th><th>Amount</th><th>Fee</th><th>Balance After</th><th>Description</th><th>Date</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.transactionRef}>
                      <td><span className="font-mono text-sm">{t.transactionRef}</span></td>
                      <td><StatusBadge status={t.transactionType || t.flowDirection} /></td>
                      <td><span className="fw-600" style={{ color: t.flowDirection === 'CREDIT' ? 'var(--mint)' : 'var(--rose)' }}>{fmt(t.amount)}</span></td>
                      <td className="text-muted text-sm">{t.feeAmount > 0 ? fmt(t.feeAmount) : '—'}</td>
                      <td className="fw-600">{fmt(t.balanceAfter)}</td>
                      <td className="text-muted text-sm">{t.description || '—'}</td>
                      <td className="text-muted text-sm">{fmtDate(t.transactionTime || t.createdAt)}</td>
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
