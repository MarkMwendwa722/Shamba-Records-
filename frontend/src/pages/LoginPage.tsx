import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function LoginPage() {
  const { login } = useAuth();
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