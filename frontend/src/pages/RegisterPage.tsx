import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' as UserRole });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const S: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a5c2a 0%, #2d8a45 50%, #4caf6f 100%)',
      padding: '1rem',
    },
    card: {
      background: '#fff', borderRadius: 16, padding: '2.5rem',
      width: '100%', maxWidth: 420,
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    },
    logo: { textAlign: 'center', marginBottom: '1.5rem' },
    logoTitle: { fontSize: '1.8rem', fontWeight: 700, color: '#1a5c2a', letterSpacing: '-0.5px', margin: '0.25rem 0 0' },
    logoSub: { fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' },
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
    },
    btn: {
      width: '100%', padding: '0.75rem',
      background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem',
      opacity: loading ? 0.6 : 1,
    },
    switchLink: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#6b7280' },
    switchAnchor: { color: '#2d8a45', fontWeight: 600 },
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={28} color="#16a34a" />
            </div>
          </div>
          <h1 style={S.logoTitle}>SmartSeason</h1>
          <p style={S.logoSub}>Field Monitoring System</p>
        </div>
        <h2 style={S.heading}>Create Account</h2>
        {error && <div style={S.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Full Name</label>
            <input style={S.input} name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your name" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Email</label>
            <input style={S.input} name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Password</label>
            <input style={S.input} name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" minLength={6} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Role</label>
            <select style={S.input} name="role" value={form.role} onChange={handleChange}>
              <option value="agent">Field Agent</option>
              <option value="admin">Admin (Coordinator)</option>
            </select>
          </div>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={S.switchLink}>
          Already have an account?{' '}
          <Link to="/login" style={S.switchAnchor}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
