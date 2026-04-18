import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { StageBadge, StatusBadge } from '../components/StatusBadge';
import UpdateModal from '../components/UpdateModal';
import type { Field } from '../types';
import { ArrowLeft, FileText } from 'lucide-react';

export default function FieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchField = useCallback(() => {
    setLoading(true);
    api.get<Field>(`/fields/${id}`)
      .then((res) => setField(res.data))
      .catch(() => setError('Field not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchField(); }, [fetchField]);

  const handleUpdateSaved = () => {
    setShowUpdateModal(false);
    fetchField();
  };

  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1100 },
    backBtn: {
      background: 'none', border: 'none', color: theme.textSub,
      fontSize: '0.875rem', padding: 0, cursor: 'pointer', marginBottom: '1rem',
      display: 'flex', alignItems: 'center',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem',
    },
    headerTitle: { fontSize: '1.6rem', fontWeight: 700, color: theme.text },
    headerSub: { color: theme.textSub, fontSize: '0.9rem', marginTop: '0.25rem' },
    badges: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' },
    card: {
      background: theme.cardBg, borderRadius: 12, padding: '1.25rem',
      boxShadow: theme.cardShadow, border: `1px solid ${theme.cardBorder}`,
    },
    cardTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: theme.textSub },
    infoGrid: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', marginBottom: '1rem' },
    infoItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.4rem 0', borderBottom: `1px solid ${theme.dividerColor}`,
    },
    infoLabel: { fontSize: '0.8rem', color: theme.textMuted, fontWeight: 500 },
    infoValue: { fontSize: '0.875rem', color: theme.textSub },
    updateBtn: {
      width: '100%', padding: '0.65rem',
      background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    count: { color: theme.textMuted, fontWeight: 400, fontSize: '0.85rem' },
    timeline: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
    timelineItem: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
    dot: {
      width: 10, height: 10, background: '#2d8a45', borderRadius: '50%',
      marginTop: '0.35rem', flexShrink: 0,
    },
    timelineContent: { flex: 1 },
    timelineHeader: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' },
    timelineAgent: { fontSize: '0.8rem', color: theme.textSub },
    timelineDate: { fontSize: '0.75rem', color: theme.textMuted, marginLeft: 'auto' },
    stageChange: { fontSize: '0.8rem', color: theme.textSub, marginBottom: '0.2rem' },
    notes: { fontSize: '0.85rem', color: theme.textSub, fontStyle: 'italic' as const },
    empty: { color: theme.textMuted, fontSize: '0.875rem' },
    loading: { textAlign: 'center' as const, padding: '3rem', color: theme.textSub },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 8 },
  };

  if (loading) return <div style={S.loading}>Loading...</div>;
  if (error) return <div style={S.errorBox}>{error}</div>;
  if (!field) return null;

  const canUpdate = user?.role === 'admin' || field.assignedAgentId === user?.id;

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate('/fields')}>
        <ArrowLeft size={15} style={{ marginRight: '0.3rem' }} />
        Back to Fields
      </button>

      <div style={S.header}>
        <div>
          <h1 style={S.headerTitle}>{field.name}</h1>
          <p style={S.headerSub}>{field.cropType}{field.location ? ` • ${field.location}` : ''}</p>
        </div>
        <div style={S.badges}>
          <StatusBadge status={field.status} />
          <StageBadge stage={field.stage} />
        </div>
      </div>

      <div style={S.grid}>
        {/* Field Info */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Field Details</h3>
          <div style={S.infoGrid}>
            {[
              { label: 'Crop Type', value: field.cropType },
              { label: 'Planting Date', value: new Date(field.plantingDate).toLocaleDateString() },
              { label: 'Location', value: field.location ?? null },
              { label: 'Size', value: field.sizeHectares ? `${field.sizeHectares} hectares` : null },
              { label: 'Assigned Agent', value: field.assignedAgent?.name ?? '—' },
              { label: 'Last Observed', value: field.lastObservationDate ? new Date(field.lastObservationDate).toLocaleDateString() : null },
            ].filter((item) => item.value !== null).map(({ label, value }) => (
              <div key={label} style={S.infoItem}>
                <span style={S.infoLabel}>{label}</span>
                <span style={S.infoValue}>{value as string}</span>
              </div>
            ))}
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Stage</span>
              <StageBadge stage={field.stage} />
            </div>
            <div style={S.infoItem}>
              <span style={S.infoLabel}>Status</span>
              <StatusBadge status={field.status} />
            </div>
          </div>
          {canUpdate && (
            <button style={S.updateBtn} onClick={() => setShowUpdateModal(true)}>
              <FileText size={15} style={{ marginRight: '0.375rem' }} />
              Post Update
            </button>
          )}
        </div>

        {/* Update History */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>
            Update History{' '}
            <span style={S.count}>({field.updates?.length ?? 0})</span>
          </h3>
          {field.updates && field.updates.length > 0 ? (
            <div style={S.timeline}>
              {field.updates.map((u) => (
                <div key={u.id} style={S.timelineItem}>
                  <div style={S.dot} />
                  <div style={S.timelineContent}>
                    <div style={S.timelineHeader}>
                      <StageBadge stage={u.newStage} />
                      <span style={S.timelineAgent}>{u.agent?.name}</span>
                      <span style={S.timelineDate}>{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    {u.previousStage && (
                      <div style={S.stageChange}>
                        Stage: <strong>{u.previousStage}</strong> → <strong>{u.newStage}</strong>
                      </div>
                    )}
                    {u.notes && <div style={S.notes}>{u.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={S.empty}>No updates yet.</p>
          )}
        </div>
      </div>

      {showUpdateModal && (
        <UpdateModal
          field={field}
          onClose={() => setShowUpdateModal(false)}
          onSaved={handleUpdateSaved}
        />
      )}
    </div>
  );
}
