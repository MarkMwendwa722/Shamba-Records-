import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { StageBadge, StatusBadge } from '../components/StatusBadge';
import FieldFormModal from '../components/FieldFormModal';
import type { Field, FieldStatus, Stage } from '../types';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

export default function FieldsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [filterStatus, setFilterStatus] = useState<FieldStatus | ''>('');
  const [filterStage, setFilterStage] = useState<Stage | ''>('');
  const [search, setSearch] = useState('');

  const fetchFields = useCallback(() => {
    setLoading(true);
    api.get<Field[]>('/fields')
      .then((res) => setFields(res.data))
      .catch(() => setError('Failed to load fields'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchFields(); }, [fetchFields]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this field?')) return;
    await api.delete(`/fields/${id}`);
    fetchFields();
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingField(null);
    fetchFields();
  };

  const filtered = fields.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.cropType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || f.status === filterStatus;
    const matchStage = !filterStage || f.stage === filterStage;
    return matchSearch && matchStatus && matchStage;
  });

  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1100 },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
    pageTitle: { fontSize: '1.6rem', fontWeight: 700, color: theme.text },
    pageSub: { color: theme.textSub, fontSize: '0.9rem', marginTop: '0.25rem' },
    addBtn: {
      display: 'flex', alignItems: 'center',
      padding: '0.6rem 1.25rem',
      background: '#16a34a',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '0.9rem', fontWeight: 600, flexShrink: 0,
    },
    filters: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' as const },
    searchInput: {
      flex: 1, minWidth: 200, padding: '0.6rem 0.875rem',
      border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8,
      fontSize: '0.9rem', background: theme.inputBg, color: theme.text,
    },
    filterSelect: {
      padding: '0.6rem 0.875rem',
      border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8,
      fontSize: '0.9rem', background: theme.inputBg, color: theme.text,
    },
    count: { fontSize: '0.8rem', color: theme.textSub, marginBottom: '0.75rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' },
    card: {
      background: theme.cardBg, borderRadius: 12,
      boxShadow: theme.cardShadow, border: `1px solid ${theme.cardBorder}`,
      overflow: 'hidden',
    },
    cardHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '1rem 1rem 0.5rem',
    },
    fieldName: {
      fontWeight: 700, fontSize: '1rem', color: '#1a5c2a',
      textDecoration: 'none', display: 'block',
    },
    cropType: { fontSize: '0.8rem', color: theme.textSub, marginTop: '0.15rem' },
    cardBody: { padding: '0.5rem 1rem 0.75rem' },
    detail: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: `1px solid ${theme.dividerColor}` },
    detailLabel: { fontSize: '0.78rem', color: theme.textMuted },
    cardActions: {
      display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
      background: theme.isDark ? '#1a1a1a' : '#fafafa',
      borderTop: `1px solid ${theme.dividerColor}`,
    },
    viewBtn: {
      flex: 1, textAlign: 'center' as const, padding: '0.5rem',
      background: theme.isDark ? '#14532d' : '#f0fdf4',
      color: theme.isDark ? '#4ade80' : '#1a5c2a',
      textDecoration: 'none', borderRadius: 6, fontSize: '0.825rem', fontWeight: 500,
    },
    editBtn: {
      padding: '0.5rem 0.875rem', background: theme.btnSecBg, color: theme.btnSecColor,
      border: 'none', borderRadius: 6, fontSize: '0.825rem',
    },
    deleteBtn: {
      padding: '0.5rem 0.875rem', background: '#fee2e2', color: '#dc2626',
      border: 'none', borderRadius: 6, fontSize: '0.825rem',
    },
    loading: { textAlign: 'center' as const, padding: '3rem', color: theme.textSub },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 8 },
    empty: { color: theme.textMuted, fontSize: '0.875rem', padding: '2rem', textAlign: 'center' as const, gridColumn: '1 / -1' },
  };

  return (
    <div style={S.page}>
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Fields</h1>
          <p style={S.pageSub}>{user?.role === 'admin' ? 'Manage all fields' : 'Your assigned fields'}</p>
        </div>
        {user?.role === 'admin' && (
          <button style={S.addBtn} onClick={() => { setEditingField(null); setShowModal(true); }}>
            <Plus size={15} style={{ marginRight: '0.25rem' }} />
            Add Field
          </button>
        )}
      </div>

      <div style={S.filters}>
        <input
          style={S.searchInput}
          placeholder="Search by name or crop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={S.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FieldStatus | '')}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>
        <select style={S.filterSelect} value={filterStage} onChange={(e) => setFilterStage(e.target.value as Stage | '')}>
          <option value="">All Stages</option>
          <option value="Planted">Planted</option>
          <option value="Growing">Growing</option>
          <option value="Ready">Ready</option>
          <option value="Harvested">Harvested</option>
        </select>
      </div>

      {loading && <div style={S.loading}>Loading fields...</div>}
      {error && <div style={S.errorBox}>{error}</div>}

      {!loading && (
        <>
          <div style={S.count}>{filtered.length} field{filtered.length !== 1 ? 's' : ''} found</div>
          <div style={S.grid}>
            {filtered.map((field) => (
              <div key={field.id} style={S.card}>
                <div style={S.cardHeader}>
                  <div>
                    <Link to={`/fields/${field.id}`} style={S.fieldName}>{field.name}</Link>
                    <div style={S.cropType}>{field.cropType}</div>
                  </div>
                  <StatusBadge status={field.status} />
                </div>
                <div style={S.cardBody}>
                  <div style={S.detail}>
                    <span style={S.detailLabel}>Stage</span>
                    <StageBadge stage={field.stage} />
                  </div>
                  <div style={S.detail}>
                    <span style={S.detailLabel}>Planted</span>
                    <span style={{ fontSize: '0.85rem', color: theme.textSub }}>{new Date(field.plantingDate).toLocaleDateString()}</span>
                  </div>
                  {field.location && (
                    <div style={S.detail}>
                      <span style={S.detailLabel}>Location</span>
                      <span style={{ fontSize: '0.85rem', color: theme.textSub }}>{field.location}</span>
                    </div>
                  )}
                  {field.sizeHectares && (
                    <div style={S.detail}>
                      <span style={S.detailLabel}>Size</span>
                      <span style={{ fontSize: '0.85rem', color: theme.textSub }}>{field.sizeHectares} ha</span>
                    </div>
                  )}
                  <div style={S.detail}>
                    <span style={S.detailLabel}>Agent</span>
                    <span style={{ fontSize: '0.85rem', color: theme.textSub }}>{field.assignedAgent?.name ?? <em>Unassigned</em>}</span>
                  </div>
                </div>
                <div style={S.cardActions}>
                  <Link to={`/fields/${field.id}`} style={S.viewBtn}>View Details</Link>
                  {user?.role === 'admin' && (
                    <>
                      <button style={S.editBtn} onClick={() => { setEditingField(field); setShowModal(true); }}>Edit</button>
                      <button style={S.deleteBtn} onClick={() => handleDelete(field.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={S.empty}>No fields match your filters.</div>
            )}
          </div>
        </>
      )}

      {showModal && (
        <FieldFormModal
          field={editingField}
          onClose={() => { setShowModal(false); setEditingField(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
