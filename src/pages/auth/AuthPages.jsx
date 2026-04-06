import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/shared.jsx';
import toast from 'react-hot-toast';

// ── Auth Layout wrapper ───────────────────────────────────────────
function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/"><Logo /></Link>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginTop: 20, color: 'var(--text-primary)' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>{subtitle}</p>
        </div>
        <div className="card">
          <div className="card-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────
export function Login() {
  const [form, setForm] = useState({ customerId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const data = res.data.data;
      loginUser({ customerId: data.customerId, fullName: data.fullName, accounts: data.accounts }, 'CUSTOMER', data.accessToken);
      toast.success(`Welcome back, ${data.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Aegis Capital account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Customer ID</label>
          <input className="form-input" placeholder="e.g. CUS000000001" value={form.customerId}
            onChange={e => setForm({ ...form, customerId: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Your password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>
      <div className="divider">or</div>
      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
        New to SecureBank? <Link to="/register" style={{ color: 'var(--sky)', fontWeight: 600 }}>Open an account</Link>
      </p>
    </AuthLayout>
  );
}

// ── Register Page ─────────────────────────────────────────────────
export function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', dob: '', aadhaarNumber: '', panNumber: '',
    email: '', phoneNumber: '', address: '', password: '', accountType: 'SAVINGS',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.registerInit(form);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.registerVerifyOtp({ email: form.email, otp });
      toast.success(`Account created! Your Customer ID: ${res.data.data.customerId}`);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  const up = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f0fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/"><Logo /></Link>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, marginTop: 20 }}>
            {step === 1 ? 'Open your account' : 'Verify your email'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>
            {step === 1 ? 'Fill in your details to get started' : `We sent an OTP to ${form.email}`}
          </p>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: step >= s ? 'var(--sky)' : 'var(--slate-mid)', color: step >= s ? 'white' : 'var(--text-muted)' }}>{s}</div>
                {s < 2 && <div style={{ width: 60, height: 2, background: step > s ? 'var(--sky)' : 'var(--slate-mid)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {step === 1 ? (
              <form onSubmit={handleInit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="Sanjith Krishna" value={form.fullName} onChange={e => up('fullName', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-input" type="date" value={form.dob} onChange={e => up('dob', e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Aadhaar Number</label>
                    <input className="form-input" placeholder="12-digit Aadhaar" maxLength={12} value={form.aadhaarNumber} onChange={e => up('aadhaarNumber', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PAN Number</label>
                    <input className="form-input" placeholder="ABCDE1234F" maxLength={10} value={form.panNumber} onChange={e => up('panNumber', e.target.value.toUpperCase())} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" placeholder="sanju@gmail.com" value={form.email} onChange={e => up('email', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="9876543210" maxLength={10} value={form.phoneNumber} onChange={e => up('phoneNumber', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" placeholder="12, MG Road, Bangalore - 560001" value={form.address} onChange={e => up('address', e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Account Type</label>
                    <select className="form-select" value={form.accountType} onChange={e => up('accountType', e.target.value)}>
                      <option value="SAVINGS">Savings Account</option>
                      <option value="CURRENT">Current Account</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => up('password', e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? <span className="spinner" /> : 'Send OTP & Continue →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>
                    Enter the 6-digit OTP sent to <strong>{form.email}</strong>
                  </p>
                  <input className="form-input" placeholder="Enter 6-digit OTP" maxLength={6}
                    style={{ textAlign: 'center', fontSize: 24, letterSpacing: 16, fontFamily: 'monospace' }}
                    value={otp} onChange={e => setOtp(e.target.value)} required />
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 24 }}>
                    {loading ? <span className="spinner" /> : 'Verify & Create Account'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)} style={{ marginTop: 8 }}>
                    ← Back
                  </button>
                </div>
              </form>
            )}
          </div>
          {step === 1 && (
            <div className="card-footer" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--sky)', fontWeight: 600 }}>Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
