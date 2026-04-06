import React, { useState, useEffect } from 'react';
import { accountAPI, auditAPI } from '../../services/api';
import { DashboardLayout, CustomerSidebar, PageHeader, StatusBadge, LoadingPage } from '../../components/shared.jsx';
import toast from 'react-hot-toast';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };

export default function AuditPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountNumber: '', from: firstOfMonth(), to: today() });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    accountAPI.getProfile().then(r => {
      const acc = r.data.data?.accounts || [];
      setAccounts(acc);
      if (acc[0]) setForm(p => ({ ...p, accountNumber: acc[0].accountNumber }));
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.accountNumber) return toast.error('Select an account');
    setLoading(true);
    try {
      const [txnRes, sumRes] = await Promise.all([
        auditAPI.myTransactions(form.accountNumber, form.from, form.to),
        auditAPI.mySummary(form.accountNumber, form.from, form.to),
      ]);
      setTransactions(txnRes.data.data || []);
      setSummary(sumRes.data.data);
      setSearched(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch audit data');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout sidebar={<CustomerSidebar />}>
      <PageHeader title="Audit Trail" subtitle="View your transactions by date range" />

      {/* Filter form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0, flex: 2, minWidth: 200 }}>
              <label className="form-label">Account</label>
              <select className="form-select" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })}>
                {accounts.map(a => <option key={a.accountNumber} value={a.accountNumber}>{a.accountNumber} — {a.accountType}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
              <label className="form-label">From Date</label>
              <input className="form-input" type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
              <label className="form-label">To Date</label>
              <input className="form-input" type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: 0 }}>
              {loading ? <span className="spinner" /> : '◉ Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Transactions', value: summary.totalTransactions, color: 'var(--sky)' },
            { label: 'Total Credit', value: fmt(summary.totalCredit), color: 'var(--mint)', sub: `${summary.creditCount} transaction(s)` },
            { label: 'Total Debit', value: fmt(summary.totalDebit), color: 'var(--rose)', sub: `${summary.debitCount} transaction(s)` },
            { label: 'Net Flow', value: fmt(summary.netFlow), color: summary.netFlow >= 0 ? 'var(--mint)' : 'var(--rose)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <p className="stat-label">{s.label}</p>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: s.color, margin: '8px 0 2px' }}>{s.value}</p>
              {s.sub && <p className="text-muted text-xs">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Transactions table */}
      {searched && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Transactions</h3>
            <span className="badge badge-info">{transactions.length} records</span>
          </div>
          {loading ? <LoadingPage /> : transactions.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">◉</div><p>No transactions in this date range</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Reference</th><th>Type</th><th>Direction</th><th>Amount</th><th>Fee</th><th>Balance After</th><th>Description</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.transactionRef}>
                      <td><span className="font-mono text-sm">{t.transactionRef}</span></td>
                      <td><StatusBadge status={t.transactionType} /></td>
                      <td><StatusBadge status={t.flowDirection || t.transactionType} /></td>
                      <td><span className="fw-600" style={{ color: t.flowDirection === 'CREDIT' || t.transactionType === 'DEPOSIT' ? 'var(--mint)' : 'var(--rose)' }}>{fmt(t.amount)}</span></td>
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
