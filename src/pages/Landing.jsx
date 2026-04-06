import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar, Logo } from '../components/shared.jsx';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <PublicNavbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #112240 50%, #1e3a5f 100%)',
        padding: '96px 32px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(45,139,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,184,148,0.06)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(45,139,255,0.15)', border: '1px solid rgba(45,139,255,0.3)', borderRadius: 100, padding: '6px 18px', marginBottom: 28 }}>
            <span style={{ color: '#7dc0ff', fontSize: 13, fontWeight: 600 }}>🔒 Secure · Fast · Reliable</span>
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 58, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
            Banking built for<br /><span style={{ color: '#2d8bff' }}>the modern era</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 40, lineHeight: 1.7 }}>
            Open a savings or current account in minutes. Deposit, withdraw, transfer — all in one place with real-time audit trails.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Open Account Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Portal cards */}
      <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, textAlign: 'center', marginBottom: 48 }}>Choose your portal</h2>
        <div className="grid-3">
          {[
            {
              title: 'Customer Portal', icon: '◎', color: '#1a6bcc', bg: 'rgba(26,107,204,0.06)',
              desc: 'Manage accounts, transfer funds, view transaction history and audit reports.',
              links: [{ to: '/register', label: 'Open Account', primary: true }, { to: '/login', label: 'Sign In' }],
            },
            {
              title: 'Compliance Portal', icon: '◈', color: '#00b894', bg: 'rgba(0,184,148,0.06)',
              desc: 'Monitor user accounts, freeze accounts, review audit trails for compliance.',
              links: [{ to: '/compliance/register', label: 'Apply Now', primary: true }, { to: '/compliance/login', label: 'Sign In' }],
            },
            {
              title: 'Admin Portal', icon: '⊡', color: '#c9a84c', bg: 'rgba(201,168,76,0.06)',
              desc: 'Manage compliance officers, approve registrations, oversee all system activity.',
              links: [{ to: '/admin/login', label: 'Admin Login', primary: true }],
            },
          ].map(card => (
            <div key={card.title} style={{ background: card.bg, border: `1px solid ${card.color}22`, borderRadius: 20, padding: 32 }}>
              <div style={{ fontSize: 32, color: card.color, marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{card.desc}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {card.links.map(l => (
                  <Link key={l.to} to={l.to}
                    className={l.primary ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    style={l.primary ? { background: card.color, boxShadow: `0 4px 14px ${card.color}40` } : { borderColor: card.color, color: card.color }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', padding: '64px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, textAlign: 'center', marginBottom: 48 }}>Everything you need</h2>
          <div className="grid-4">
            {[
              { icon: '⚡', title: 'Instant Transfers', desc: 'Move money between accounts in seconds with real-time balance updates.' },
              { icon: '🔒', title: 'PIN Security', desc: 'Every withdrawal and transfer requires PIN verification for maximum safety.' },
              { icon: '📊', title: 'Audit Reports', desc: 'View complete transaction history with date-range filtering and summaries.' },
              { icon: '🛡️', title: 'Compliance Ready', desc: 'Built-in compliance officer portal with account freeze and lock capabilities.' },
            ].map(f => (
              <div key={f.title} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{f.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0a1628', padding: '40px 32px', textAlign: 'center' }}>
        <Logo size="sm" />
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 16 }}>
          © 2026 AegisCapital. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
