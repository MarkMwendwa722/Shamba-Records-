import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


export default function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const S: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      padding: '1rem', position: 'relative',
    },
    overlay: {
      position: 'absolute', inset: 0,
      background: 'rgba(10, 40, 15, 0.55)',
    },
    card: {
      position: 'relative', zIndex: 1,
      background: 'rgba(255,255,255,0.66)', backdropFilter: 'blur(6px)',
      borderRadius: 16, padding: '2.5rem',
      width: '100%', maxWidth: 420,
      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    },
    logo: { textAlign: 'center' as const, marginBottom: '1.5rem' },
    heading: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: '#1a1a1a' },
    error: {
      background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626',
      borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1rem',
    },
    fieldGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' },
    input: {
      width: '100%', padding: '0.65rem 0.875rem',
      border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: '0.95rem', background: '#fff',
      boxSizing: 'border-box' as const,
    },
    btn: {
      width: '100%', padding: '0.75rem',
      background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', cursor: 'pointer',
      opacity: loading ? 0.6 : 1,
    },
    switchLink: { textAlign: 'center' as const, marginTop: '1.25rem', fontSize: '0.875rem', color: '#6b7280' },
    switchAnchor: { color: '#2d8a45', fontWeight: 600 },
    demoBox: {
      marginTop: '1.25rem', padding: '0.875rem',
      border: '1px solid #bbf7d0', borderRadius: 8,
      fontSize: '0.8rem', color: '#166534', lineHeight: 1.7,
    },
  };

  return (
    <div style={S.page}>
      <div style={S.overlay} />
      <div style={S.card}>
        <div style={S.logo}>
          <img src="/shamba.svg" alt="Shamba Records" style={{ height: 72, width: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 style={S.heading}>Sign In</h2>
        {error && <div style={S.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Email</label>
            <input style={S.input} name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Password</label>
            <input style={S.input} name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={S.switchLink}>
          Don't have an account?{' '}
          <Link to="/register" style={S.switchAnchor}>Register</Link>
        </p>
        <div style={S.demoBox}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Demo credentials:</strong>
          <span>Admin: admin@smartseason.com / admin123</span><br />
          <span>Agent: alice@smartseason.com / agent123</span>
        </div>
      </div>
    </div>
  );
}


function FarmScene() {
  return (
    <svg viewBox="0 0 480 520" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '75%' }}>
      {/* Sun glow */}
      <circle cx="380" cy="90" r="60" fill="rgba(255,235,100,0.15)" />
      <circle cx="380" cy="90" r="40" fill="rgba(255,235,100,0.2)" />
      <circle cx="380" cy="90" r="24" fill="rgba(255,230,80,0.45)" />
      {/* Distant hills */}
      <path d="M0,310 Q60,250 130,275 Q200,300 270,255 Q340,215 400,250 Q440,270 480,245 L480,520 L0,520 Z"
        fill="#145220" opacity="0.7" />
      {/* Mid hills */}
      <path d="M0,355 Q80,300 170,330 Q260,358 350,310 Q415,278 480,305 L480,520 L0,520 Z"
        fill="#1a6b2e" opacity="0.85" />
      {/* Foreground field */}
      <path d="M0,400 Q120,375 240,390 Q360,405 480,380 L480,520 L0,520 Z"
        fill="#22882f" />
      {/* Crop row lines */}
      {[0,1,2,3,4,5,6,7,8,9].map((i) => (
        <line key={i}
          x1={18 + i * 48} y1="412"
          x2={10 + i * 48} y2="520"
          stroke="#145220" strokeWidth="2.5" opacity="0.55" />
      ))}
      {/* Crop stalks */}
      {[0,1,2,3,4,5,6,7,8,9].map((i) => (
        <g key={`stalk-${i}`}>
          <line x1={22 + i * 48} y1="405" x2={22 + i * 48} y2="390"
            stroke="#2da83c" strokeWidth="2" />
          <ellipse cx={22 + i * 48} cy="386" rx="6" ry="9"
            fill="#3abf4a" opacity="0.8" />
        </g>
      ))}
      {/* Small farmhouse */}
      <rect x="170" y="305" width="50" height="35" fill="#c8a96e" />
      <polygon points="163,305 220,305 191,278" fill="#a07840" />
      <rect x="183" y="320" width="16" height="20" fill="#6b4f28" />
      <rect x="175" y="310" width="10" height="10" fill="#d4e8ff" opacity="0.8" />
      <rect x="203" y="310" width="10" height="10" fill="#d4e8ff" opacity="0.8" />
      {/* Silo */}
      <rect x="228" y="298" width="18" height="42" fill="#d4b483" />
      <ellipse cx="237" cy="298" rx="9" ry="5" fill="#b8965a" />
      {/* Tree clusters */}
      <circle cx="130" cy="315" r="16" fill="#1a6b2e" />
      <circle cx="118" cy="322" r="12" fill="#22882f" />
      <circle cx="142" cy="322" r="11" fill="#22882f" />
      <rect x="128" y="330" width="4" height="12" fill="#6b4f28" />
      <circle cx="310" cy="308" r="14" fill="#1a6b2e" />
      <circle cx="300" cy="315" r="10" fill="#22882f" />
      <circle cx="320" cy="315" r="10" fill="#22882f" />
      <rect x="308" y="324" width="4" height="11" fill="#6b4f28" />
      {/* Birds */}
      <path d="M90,160 Q95,155 100,160" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <path d="M108,148 Q113,143 118,148" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <path d="M70,175 Q75,170 80,175" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" />
      {/* Fence */}
      {[0,1,2,3,4,5,6,7,8].map((i) => (
        <rect key={`fence-${i}`} x={30 + i * 52} y="388" width="4" height="18"
          fill="#c8a96e" opacity="0.7" />
      ))}
      <line x1="30" y1="393" x2="446" y2="393" stroke="#c8a96e" strokeWidth="2" opacity="0.6" />
      <line x1="30" y1="400" x2="446" y2="400" stroke="#c8a96e" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}


