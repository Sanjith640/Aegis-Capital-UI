import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { accountAPI, txnAPI } from '../../services/api';
import { DashboardLayout, CustomerSidebar, PageHeader, StatusBadge, Amount, LoadingPage } from '../../components/shared.jsx';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Shared Account selector ───────────────────────────────────────
function AccountPicker({ accounts, value, onChange, label = 'Select Account' }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">-- Choose Account --</option>
        {accounts.filter(a => a.status === 'ACTIVE').map(a => (
          <option key={a.accountNumber} value={a.accountNumber}>
            {a.accountNumber} — {a.accountType} — {fmt(a.balance)}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Success Receipt ───────────────────────────────────────────────
function Receipt({ data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-body" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(0,184,148,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✓</div>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: 'var(--mint)', marginBottom: 8 }}>Transaction Successful</h3>
          <p className="text-muted" style={{ marginBottom: 28 }}>{data.summary}</p>
          <div style={{ background: 'var(--slate)', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 24 }}>
            {[
              ['Reference', data.transactionRef],
              ['Amount', fmt(data.amount)],
              data.feeAmount > 0 && ['Fee', fmt(data.feeAmount)],
              data.feeAmount > 0 && ['Total Debited', fmt(data.totalDebited)],
              ['Balance After', fmt(data.balanceAfter)],
              ['Type', data.transactionType],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate-mid)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600, fontFamily: k === 'Reference' ? 'monospace' : 'inherit' }}>{v}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Deposit Page ──────────────────────────────────────────────────
export function DepositPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountNumber: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    accountAPI.getProfile().then(r => setAccounts(r.data.data?.accounts || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.accountNumber) return toast.error('Please select an account');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const r = await txnAPI.deposit({ ...form, amount: Number(form.amount) });
      setResult(r.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Deposit failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout sidebar={<CustomerSidebar />}>
      <PageHeader title="Deposit Funds" subtitle="Add money to your account" />
      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="card-body">
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
              ✓ No fee on deposits. Funds reflect immediately.
            </div>
            <form onSubmit={handleSubmit}>
              <AccountPicker accounts={accounts} value={form.accountNumber} onChange={v => setForm({ ...form, accountNumber: v })} />
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                  <input className="form-input" type="number" min="1" step="0.01" placeholder="0.00"
                    style={{ paddingLeft: 32 }} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input className="form-input" placeholder="e.g. Salary - March 2026"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-success btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : '↓ Deposit Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {result && <Receipt data={result} onClose={() => { setResult(null); setForm({ accountNumber: '', amount: '', description: '' }); }} />}
    </DashboardLayout>
  );
}

// ── Withdraw Page ─────────────────────────────────────────────────
export function WithdrawPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountNumber: '', pin: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { accountAPI.getProfile().then(r => setAccounts(r.data.data?.accounts || [])); }, []);

  const calcFee = (amt) => {
    const a = Number(amt);
    if (!a) return { fee: 0, rate: 0 };
    const rate = a < 10000 ? 2.5 : 5;
    return { fee: (a * rate) / 100, rate };
  };
  const { fee, rate } = calcFee(form.amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.accountNumber) return toast.error('Select an account');
    if (!form.pin || form.pin.length !== 4) return toast.error('Enter your 4-digit PIN');
    setLoading(true);
    try {
      const r = await txnAPI.withdraw({ ...form, amount: Number(form.amount) });
      setResult(r.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Withdrawal failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout sidebar={<CustomerSidebar />}>
      <PageHeader title="Withdraw Funds" subtitle="Withdraw from your account" />
      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <AccountPicker accounts={accounts} value={form.accountNumber} onChange={v => setForm({ ...form, accountNumber: v })} />
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                  <input className="form-input" type="number" min="1" step="0.01" placeholder="0.00"
                    style={{ paddingLeft: 32 }} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>
              {form.amount > 0 && (
                <div style={{ background: 'rgba(26,107,204,0.05)', border: '1px solid rgba(26,107,204,0.15)', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14 }}>
                  <div className="flex-between"><span style={{ color: 'var(--text-muted)' }}>Fee ({rate}%)</span><span className="fw-600">- {fmt(fee)}</span></div>
                  <div className="flex-between" style={{ marginTop: 8 }}><span style={{ color: 'var(--text-muted)' }}>Total Debited</span><span className="fw-700" style={{ color: 'var(--rose)' }}>{fmt(Number(form.amount) + fee)}</span></div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">4-Digit PIN</label>
                <input className="form-input" type="password" placeholder="••••" maxLength={4}
                  value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} />
                <span className="form-hint">Required for all withdrawals</span>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input className="form-input" placeholder="e.g. Rent payment" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : '↑ Withdraw Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {result && <Receipt data={result} onClose={() => { setResult(null); setForm({ accountNumber: '', pin: '', amount: '', description: '' }); }} />}
    </DashboardLayout>
  );
}

// ── Transfer Page ─────────────────────────────────────────────────
export function TransferPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', pin: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { accountAPI.getProfile().then(r => setAccounts(r.data.data?.accounts || [])); }, []);

  const calcFee = (amt) => { const a = Number(amt); if (!a) return { fee: 0, rate: 0 }; const rate = a < 10000 ? 2.5 : 5; return { fee: (a * rate) / 100, rate }; };
  const { fee, rate } = calcFee(form.amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.fromAccount === form.toAccount) return toast.error('Cannot transfer to same account');
    setLoading(true);
    try {
      const r = await txnAPI.transfer({ ...form, amount: Number(form.amount) });
      setResult(r.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Transfer failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout sidebar={<CustomerSidebar />}>
      <PageHeader title="Transfer Funds" subtitle="Send money to another account" />
      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <AccountPicker accounts={accounts} value={form.fromAccount} label="From Account" onChange={v => setForm({ ...form, fromAccount: v })} />
              <div className="form-group">
                <label className="form-label">To Account Number</label>
                <input className="form-input font-mono" placeholder="e.g. SB100000000002"
                  value={form.toAccount} onChange={e => setForm({ ...form, toAccount: e.target.value })} required />
                <span className="form-hint">Enter recipient's account number</span>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                  <input className="form-input" type="number" min="1" step="0.01" placeholder="0.00"
                    style={{ paddingLeft: 32 }} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>
              {form.amount > 0 && (
                <div style={{ background: 'rgba(26,107,204,0.05)', border: '1px solid rgba(26,107,204,0.15)', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14 }}>
                  <div className="flex-between"><span style={{ color: 'var(--text-muted)' }}>Fee ({rate}%)</span><span className="fw-600">- {fmt(fee)}</span></div>
                  <div className="flex-between" style={{ marginTop: 8 }}><span style={{ color: 'var(--text-muted)' }}>Total Debited</span><span className="fw-700" style={{ color: 'var(--rose)' }}>{fmt(Number(form.amount) + fee)}</span></div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">4-Digit PIN</label>
                <input className="form-input" type="password" placeholder="••••" maxLength={4}
                  value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input className="form-input" placeholder="e.g. Rent payment"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : '⇄ Transfer Now'}
              </button>
            </form>
          </div>
        </div>
        <div className="alert alert-warning" style={{ marginTop: 16 }}>
          ⚠️ New recipients (added within 24 hrs) have a transfer limit of ₹1,00,000.
        </div>
      </div>
      {result && <Receipt data={result} onClose={() => { setResult(null); setForm({ fromAccount: '', toAccount: '', pin: '', amount: '', description: '' }); }} />}
    </DashboardLayout>
  );
}

// ── History Page ──────────────────────────────────────────────────
export function HistoryPage() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { accountAPI.getProfile().then(r => { const acc = r.data.data?.accounts || []; setAccounts(acc); if (acc[0]) setSelected(acc[0].accountNumber); }); }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    Promise.all([
      txnAPI.getHistory(selected, page, 10),
      txnAPI.getRemaining(selected),
    ]).then(([h, r]) => {
      setHistory(h.data.data?.content || []);
      setTotalPages(h.data.data?.totalPages || 0);
      setRemaining(r.data.data);
    }).catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [selected, page]);

  return (
    <DashboardLayout sidebar={<CustomerSidebar />}>
      <PageHeader title="Transaction History" subtitle="View all your transactions" />
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 'auto', minWidth: 280 }} value={selected} onChange={e => { setSelected(e.target.value); setPage(0); }}>
          {accounts.map(a => <option key={a.accountNumber} value={a.accountNumber}>{a.accountNumber} — {a.accountType}</option>)}
        </select>
        {remaining && (
          <div style={{ background: 'white', borderRadius: 10, padding: '10px 18px', border: '1px solid var(--card-border)', fontSize: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>Today's remaining: </span>
            <span className="fw-700" style={{ color: remaining.remainingToday < 5 ? 'var(--rose)' : 'var(--mint)' }}>
              {remaining.remainingToday}/{remaining.dailyLimit}
            </span>
          </div>
        )}
      </div>
      <div className="card">
        {loading ? <LoadingPage /> : history.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">≡</div><p>No transactions found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Reference</th><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Fee</th><th>Balance After</th><th>Date</th>
              </tr></thead>
              <tbody>
                {history.map(t => (
                  <tr key={t.transactionRef}>
                    <td><span className="font-mono text-sm">{t.transactionRef}</span></td>
                    <td><StatusBadge status={t.transactionType} /></td>
                    <td className="font-mono text-xs text-muted">{t.fromAccount || '—'}</td>
                    <td className="font-mono text-xs text-muted">{t.toAccount || '—'}</td>
                    <td><Amount value={t.amount} size="sm" positive={t.transactionType === 'DEPOSIT'} negative={t.transactionType !== 'DEPOSIT'} /></td>
                    <td className="text-sm text-muted">{t.feeAmount > 0 ? fmt(t.feeAmount) : '—'}</td>
                    <td className="fw-600">{fmt(t.balanceAfter)}</td>
                    <td className="text-muted text-sm">{fmtDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--slate-mid)' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="text-muted text-sm">Page {page + 1} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
