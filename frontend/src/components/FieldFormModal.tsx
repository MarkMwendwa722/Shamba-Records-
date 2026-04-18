import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import type { Field, Stage } from '../types';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STAGES: Stage[] = ['Planted', 'Growing', 'Ready', 'Harvested'];

interface Agent { id: number; name: string; email: string }

interface Props {
  field: Field | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  cropType: string;
  plantingDate: string;
  stage: Stage;
  location: string;
  sizeHectares: string;
  assignedAgentId: string;
}

export default function FieldFormModal({ field, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState<FormState>({
    name: field?.name ?? '',
    cropType: field?.cropType ?? '',
    plantingDate: field?.plantingDate ?? '',
    stage: field?.stage ?? 'Planted',
    location: field?.location ?? '',
    sizeHectares: field?.sizeHectares?.toString() ?? '',
    assignedAgentId: field?.assignedAgentId?.toString() ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Agent[]>('/users/agents').then((res) => setAgents(res.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        sizeHectares: form.sizeHectares ? parseFloat(form.sizeHectares) : null,
        assignedAgentId: form.assignedAgentId ? parseInt(form.assignedAgentId, 10) : null,
      };
      if (field) {
        await api.put(`/fields/${field.id}`, payload);
      } else {
        await api.post('/fields', payload);
      }
      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save field';
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? msg);
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
      width: '100%', maxWidth: 520,
      maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
    title: { fontSize: '1.15rem', fontWeight: 700, color: theme.text },
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
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
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
          <h2 style={S.title}>{field ? 'Edit Field' : 'Add New Field'}</h2>
          <button style={S.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div style={S.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={S.fieldGroup}>
            <label style={S.label}>Field Name *</label>
            <input style={S.input} name="name" value={form.name} onChange={handleChange} required placeholder="e.g. North Paddock" />
          </div>
          <div style={S.row}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Crop Type *</label>
              <input style={S.input} name="cropType" value={form.cropType} onChange={handleChange} required placeholder="e.g. Maize" />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Stage</label>
              <select style={S.input} name="stage" value={form.stage} onChange={handleChange}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={S.row}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Planting Date *</label>
              <input style={S.input} name="plantingDate" type="date" value={form.plantingDate} onChange={handleChange} required />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Size (hectares)</label>
              <input style={S.input} name="sizeHectares" type="number" step="0.1" value={form.sizeHectares} onChange={handleChange} placeholder="e.g. 2.5" />
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Location</label>
            <input style={S.input} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Block A, Eastern Region" />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Assign to Agent</label>
            <select style={S.input} name="assignedAgentId" value={form.assignedAgentId} onChange={handleChange}>
              <option value="">Unassigned</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
            </select>
          </div>
          <div style={S.actions}>
            <button type="button" style={S.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={S.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : field ? 'Save Changes' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
