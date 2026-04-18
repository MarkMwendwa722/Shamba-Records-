import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import type { AgentUser } from '../types';
import { UserPlus, Trash2, Users, X, Mail, CalendarDays, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface NewAgentForm {
  name: string;
  email: string;
  password: string;
}

export default function AgentsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewAgentForm>({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: 'name' | 'email' | 'createdAt') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    const va = a[sortKey]; const vb = b[sortKey];
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const fetchAgents = useCallback(() => {
    setLoading(true);
    api.get<AgentUser[]>('/users')
      .then((res) => setAgents(res.data.filter((u) => u.role === 'agent')))
      .catch(() => setError('Failed to load agents'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'agent' });
      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchAgents();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Failed to create agent');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to delete agent');
    } finally {
      setDeleteId(null);
    }
  };

  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: 900 },
    pageHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem',
    },
    pageTitle: { fontSize: '1.6rem', fontWeight: 700, color: theme.text, margin: 0 },
    pageSub: { color: theme.textSub, fontSize: '0.9rem', marginTop: '0.2rem' },
    addBtn: {
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.6rem 1.25rem', background: '#16a34a',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
    },
    tableWrap: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
    tableHeaderRow: {
      display: 'grid', gridTemplateColumns: '1.5fr 2fr 0.8fr 1.2fr 36px',
      padding: '0.25rem 1.25rem 0.5rem',
    },
    sortBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0,
      fontSize: '0.72rem', fontWeight: 700, color: theme.textMuted,
      textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    },
    agentCard: {
      display: 'grid', gridTemplateColumns: '1.5fr 2fr 0.8fr 1.2fr 36px',
      padding: '1rem 1.25rem',
      background: theme.cardBg, borderRadius: 10,
      border: `1px solid ${theme.cardBorder}`,
      boxShadow: theme.cardShadow, alignItems: 'center',
    },
    name: { fontWeight: 700, fontSize: '0.9rem', color: theme.text },
    emailCell: {
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '0.85rem', color: theme.textSub,
    },
    roleAgent: { fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' },
    roleAdmin: { fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' },
    dateCell: {
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      fontSize: '0.82rem', color: theme.textMuted,
    },
    deleteBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, padding: 0, background: '#fef2f2', border: 'none',
      borderRadius: 8, color: '#dc2626', cursor: 'pointer', flexShrink: 0,
    },
    empty: {
      textAlign: 'center' as const, padding: '3rem',
      color: theme.textMuted, fontSize: '0.9rem',
      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.5rem',
    },
    loading: { textAlign: 'center' as const, padding: '3rem', color: theme.textSub },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 8, marginBottom: '1rem' },
    // Modal
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    },
    modal: {
      background: theme.cardBg, borderRadius: 14, padding: '1.75rem',
      width: '100%', maxWidth: 440,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    },
    modalHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1.25rem',
    },
    modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: theme.text, fontFamily: "'Playfair Display', Georgia, serif" },
    closeBtn: {
      background: 'none', border: 'none', color: theme.textMuted,
      padding: '0.25rem', borderRadius: 4, display: 'flex', cursor: 'pointer',
    },
    fieldGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.textSub, marginBottom: '0.35rem' },
    input: {
      width: '100%', padding: '0.6rem 0.875rem',
      border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8,
      fontSize: '0.9rem', boxSizing: 'border-box' as const, outline: 'none',
      background: theme.inputBg, color: theme.text,
    },
    submitBtn: {
      width: '100%', padding: '0.7rem',
      background: '#16a34a', color: '#fff', border: 'none',
      borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
      marginTop: '0.5rem',
    },
    formError: { background: '#fee2e2', color: '#dc2626', padding: '0.625rem 0.875rem', borderRadius: 6, fontSize: '0.85rem', marginBottom: '0.75rem' },
    // Confirm delete modal
    confirmModal: {
      background: theme.cardBg, borderRadius: 14, padding: '1.75rem',
      width: '100%', maxWidth: 380,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      textAlign: 'center' as const,
    },
    confirmTitle: { fontSize: '1.05rem', fontWeight: 700, color: theme.text, marginBottom: '0.5rem', fontFamily: "'Playfair Display', Georgia, serif" },
    confirmSub: { fontSize: '0.875rem', color: theme.textSub, marginBottom: '1.25rem' },
    confirmBtns: { display: 'flex', gap: '0.75rem', justifyContent: 'center' },
    cancelBtn: {
      padding: '0.6rem 1.25rem', background: theme.btnSecBg, color: theme.btnSecColor,
      border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
    },
    confirmDeleteBtn: {
      padding: '0.6rem 1.25rem', background: '#dc2626', color: '#fff',
      border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
    },
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ ...S.empty, paddingTop: '4rem' }}>
        <Users size={40} color="#d1d5db" />
        <span>Only admins can manage agents.</span>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Field Agents</h1>
          <p style={S.pageSub}>Manage the agents who monitor fields</p>
        </div>
        <button style={S.addBtn} onClick={() => { setShowModal(true); setFormError(''); }}>
          <UserPlus size={16} />
          Add Agent
        </button>
      </div>

      {error && <div style={S.errorBox}>{error}</div>}

      {/* Table Header */}
      <div style={S.tableHeaderRow}>
        {(['name', 'email'] as const).map((key) => (
          <button key={key} style={S.sortBtn} onClick={() => toggleSort(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {sortKey === key
              ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
              : <ArrowUpDown size={12} />}
          </button>
        ))}
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</span>
        <button style={S.sortBtn} onClick={() => toggleSort('createdAt')}>
          Joined
          {sortKey === 'createdAt'
            ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
            : <ArrowUpDown size={12} />}
        </button>
        <span />
      </div>

      {/* Rows */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.loading}>Loading agents...</div>
        ) : agents.length === 0 ? (
          <div style={S.empty}>
            <Users size={36} color="#d1d5db" />
            <span>No field agents yet. Add one to get started.</span>
          </div>
        ) : (
          sortedAgents.map((agent) => (
            <div key={agent.id} style={S.agentCard}>
              <div style={S.name}>{agent.name}</div>
              <div style={S.emailCell}>
                <Mail size={13} />
                {agent.email}
              </div>
              <div style={agent.role === 'admin' ? S.roleAdmin : S.roleAgent}>
                {agent.role === 'admin' ? 'Admin' : 'Field Agent'}
              </div>
              <div style={S.dateCell}>
                <CalendarDays size={13} />
                {new Date(agent.createdAt).toLocaleDateString()}
              </div>
              <button
                style={S.deleteBtn}
                onClick={() => setDeleteId(agent.id)}
                title="Remove agent"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Agent Modal */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>Add Field Agent</span>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            {formError && <div style={S.formError}>{formError}</div>}
            <form onSubmit={handleAddAgent}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Full Name</label>
                <input style={S.input} name="name" type="text" value={form.name}
                  onChange={handleChange} required placeholder="Agent's full name" />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Email</label>
                <input style={S.input} name="email" type="email" value={form.email}
                  onChange={handleChange} required placeholder="agent@example.com" />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Password</label>
                <input style={S.input} name="password" type="password" value={form.password}
                  onChange={handleChange} required placeholder="Minimum 6 characters" minLength={6} />
              </div>
              <button type="submit" style={S.submitBtn} disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create Agent'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteId !== null && (
        <div style={S.overlay} onClick={() => setDeleteId(null)}>
          <div style={S.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={S.confirmTitle}>Remove Agent?</div>
            <div style={S.confirmSub}>
              This will permanently delete the agent's account. This action cannot be undone.
            </div>
            <div style={S.confirmBtns}>
              <button style={S.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={S.confirmDeleteBtn} onClick={() => handleDelete(deleteId)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
