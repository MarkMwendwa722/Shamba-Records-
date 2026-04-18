import React, { useState } from 'react';
import api from '../api/axios';
import type { Field, Stage } from '../types';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STAGES: Stage[] = ['Planted', 'Growing', 'Ready', 'Harvested'];

interface Props {
  field: Field;
  onClose: () => void;
  onSaved: () => void;
}

export default function UpdateModal({ field, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ newStage: field.stage as Stage, notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/updates', { fieldId: field.id, newStage: form.newStage, notes: form.notes });
      onSaved();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to post update');
    } finally {
      setLoading(false);
    }
  };

  const S: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    },
    modal: {
      background: theme.cardBg, borderRadius: 16, padding: '1.75rem',
      width: '100%', maxWidth: 480,
      maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
    title: { fontSize: '1.1rem', fontWeight: 700, color: theme.text },
    closeBtn: { background: 'none', border: 'none', fontSize: '1rem', color: theme.textMuted, padding: '0.25rem 0.5rem', borderRadius: 4, display: 'flex', cursor: 'pointer' },
    error: {
      background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626',
      borderRadius: 8, padding: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem',
    },
    fieldGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: 500, color: theme.textSub, marginBottom: '0.35rem' },
    input: {
      width: '100%', padding: '0.6rem 0.875rem',
      border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8,
      fontSize: '0.9rem', background: theme.inputBg, color: theme.text,
    },
    textarea: {
      width: '100%', padding: '0.6rem 0.875rem',
      border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8,
      fontSize: '0.9rem', background: theme.inputBg, color: theme.text, resize: 'vertical',
    },
    actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
    cancelBtn: { padding: '0.6rem 1.25rem', background: theme.btnSecBg, color: theme.btnSecColor, border: 'none', borderRadius: 8, fontSize: '0.9rem' },
    saveBtn: {
      padding: '0.6rem 1.25rem',
      background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '0.9rem', fontWeight: 600,
      opacity: loading ? 0.6 : 1,
    },
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <h2 style={S.title}>Post Update — {field.name}</h2>
          <button style={S.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div style={S.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.fieldGroup}>
            <label style={S.label}>New Stage</label>
            <select style={S.input} name="newStage" value={form.newStage} onChange={handleChange}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Notes / Observations</label>
            <textarea
              style={S.textarea}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what you observed in the field..."
            />
          </div>
          <div style={S.actions}>
            <button type="button" style={S.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={S.saveBtn} disabled={loading}>
              {loading ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
