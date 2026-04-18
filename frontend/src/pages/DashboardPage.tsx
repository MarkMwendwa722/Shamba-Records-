import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { StageBadge, StatusBadge } from '../components/StatusBadge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardData, Field } from '../types';
import {
  Layers, CheckCircle2, AlertTriangle, Flag,
  Sprout, TrendingUp, Sun, Package,
  Plus, ChevronRight, ChevronDown, Users, Clock, Calendar,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = { Active: '#22c55e', 'At Risk': '#ef4444', Completed: '#9ca3af' };
const STAGE_COLORS: Record<string, string> = { Planted: '#3b82f6', Growing: '#10b981', Ready: '#f59e0b', Harvested: '#6b7280' };

function StatCard({ label, value, Icon, iconBg, iconColor }: {
  label: string; value: number | string;
  Icon: React.ElementType; iconBg: string; iconColor: string;
}) {
  const { theme } = useTheme();
  return (
    <div style={{ background: theme.cardBg, borderRadius: 12, padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem', boxShadow: theme.cardShadow, border: `1px solid ${theme.cardBorder}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: theme.textMuted, fontWeight: 500, marginBottom: '0.2rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<DashboardData>('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1200 },
    pageHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '0.75rem',
    },
    greeting: { fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: 0 },
    greetingSub: { fontSize: '0.875rem', color: theme.textMuted, marginTop: '0.3rem' },
    headerActions: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    monthlyBtn: {
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.5rem 0.875rem', border: `1.5px solid ${theme.inputBorder}`,
      borderRadius: 8, fontSize: '0.85rem', color: theme.textSub, background: theme.cardBg,
    },
    addBtn: {
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.5rem 1rem', background: '#16a34a',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '0.875rem', marginBottom: '1.25rem',
    },
    midGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem', marginBottom: '1.25rem',
    },
    bottomGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
    },
    card: {
      background: theme.cardBg, borderRadius: 12, padding: '1.25rem',
      boxShadow: theme.cardShadow, border: `1px solid ${theme.cardBorder}`,
    },
    cardHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1rem',
    },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: theme.text, margin: 0 },
    seeAll: { fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none', fontWeight: 500 },
    summaryRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.65rem 0', borderBottom: `1px solid ${theme.dividerColor}`,
    },
    summaryLabel: { display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: theme.textSub },
    summaryValue: { fontSize: '0.95rem', fontWeight: 600, color: theme.text },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: {
      textAlign: 'left' as const, padding: '0.5rem 0.75rem',
      fontSize: '0.72rem', color: theme.textMuted, fontWeight: 500,
      borderBottom: `1px solid ${theme.dividerColor}`,
      textTransform: 'uppercase' as const, letterSpacing: '0.04em',
    },
    td: {
      padding: '0.75rem', borderBottom: `1px solid ${theme.dividerColor}`,
      fontSize: '0.875rem', color: theme.textSub, verticalAlign: 'middle' as const,
    },
    fieldThumb: {
      width: 30, height: 30, borderRadius: 6,
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      flexShrink: 0, display: 'inline-block',
    },
    updateItem: {
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      padding: '0.65rem 0', borderBottom: `1px solid ${theme.dividerColor}`,
    },
    updateDot: {
      width: 8, height: 8, background: '#22c55e', borderRadius: '50%',
      marginTop: '0.35rem', flexShrink: 0,
    },
    updateField: { fontWeight: 600, fontSize: '0.875rem', color: theme.text },
    updateMeta: { fontSize: '0.75rem', color: theme.textMuted, marginTop: '0.2rem' },
    agentRow: {
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0', borderBottom: `1px solid ${theme.dividerColor}`,
    },
    agentAvatar: {
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
    },
    agentName: { fontSize: '0.875rem', fontWeight: 500, color: theme.text },
    agentCount: { fontSize: '0.75rem', color: theme.textMuted },
    atRiskPill: {
      marginLeft: 'auto', padding: '0.175rem 0.5rem', borderRadius: 20,
      background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 600,
    },
    empty: { color: theme.textMuted, fontSize: '0.875rem', padding: '1.5rem 0', textAlign: 'center' as const, margin: 0 },
    loading: { textAlign: 'center' as const, padding: '3rem', color: theme.textSub },
    errorBox: { background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 8 },
  };

  const legendDot = (c: string): React.CSSProperties => ({
    width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', marginRight: '0.4rem', flexShrink: 0,
  });

  if (loading) return <div style={S.loading}>Loading dashboard...</div>;
  if (error) return <div style={S.errorBox}>{error}</div>;
  if (!data) return null;

  const statusChartData = Object.entries(data.statusBreakdown).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const stageChartData = Object.entries(data.stageBreakdown).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  const conditionItems = [
    { label: 'Active Fields', value: data.statusBreakdown['Active'] ?? 0, Icon: CheckCircle2, color: '#22c55e' },
    { label: 'At Risk', value: data.statusBreakdown['At Risk'] ?? 0, Icon: AlertTriangle, color: '#ef4444' },
    { label: 'Completed', value: data.statusBreakdown['Completed'] ?? 0, Icon: Flag, color: '#9ca3af' },
    { label: 'Planted', value: data.stageBreakdown['Planted'] ?? 0, Icon: Sprout, color: '#3b82f6' },
    { label: 'Growing', value: data.stageBreakdown['Growing'] ?? 0, Icon: TrendingUp, color: '#10b981' },
  ];

  const stageList = [
    { label: 'Planted', value: data.stageBreakdown['Planted'] ?? 0, color: '#3b82f6' },
    { label: 'Growing', value: data.stageBreakdown['Growing'] ?? 0, color: '#10b981' },
    { label: 'Ready', value: data.stageBreakdown['Ready'] ?? 0, color: '#f59e0b' },
    { label: 'Harvested', value: data.stageBreakdown['Harvested'] ?? 0, color: '#6b7280' },
  ];

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.greeting}>Hey {user?.name}, welcome back!</h1>
          <p style={S.greetingSub}>Here's what's happening on your farm today.</p>
        </div>
        <div style={S.headerActions}>
          <button style={S.monthlyBtn}>
            <Calendar size={14} />
            Monthly
            <ChevronDown size={14} />
          </button>
          {user?.role === 'admin' && (
            <Link to="/fields" style={S.addBtn}>
              <Plus size={15} />
              Add Field
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid — 8 cards, 4 per row */}
      <div style={S.statsGrid}>
        <StatCard label="Total Fields" value={data.totalFields} Icon={Layers} iconBg="#eff6ff" iconColor="#3b82f6" />
        <StatCard label="Active" value={data.statusBreakdown['Active'] ?? 0} Icon={CheckCircle2} iconBg="#f0fdf4" iconColor="#16a34a" />
        <StatCard label="At Risk" value={data.statusBreakdown['At Risk'] ?? 0} Icon={AlertTriangle} iconBg="#fef2f2" iconColor="#ef4444" />
        <StatCard label="Completed" value={data.statusBreakdown['Completed'] ?? 0} Icon={Flag} iconBg="#f9fafb" iconColor="#6b7280" />
        <StatCard label="Planted" value={data.stageBreakdown['Planted'] ?? 0} Icon={Sprout} iconBg="#eff6ff" iconColor="#3b82f6" />
        <StatCard label="Growing" value={data.stageBreakdown['Growing'] ?? 0} Icon={TrendingUp} iconBg="#f0fdf4" iconColor="#10b981" />
        <StatCard label="Ready to Harvest" value={data.stageBreakdown['Ready'] ?? 0} Icon={Sun} iconBg="#fffbeb" iconColor="#f59e0b" />
        <StatCard label="Harvested" value={data.stageBreakdown['Harvested'] ?? 0} Icon={Package} iconBg="#f9fafb" iconColor="#6b7280" />
      </div>

      {/* Middle — 3 columns */}
      <div style={S.midGrid}>
        {/* Field Conditions */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Field Conditions</h3>
          </div>
          {conditionItems.map(({ label, value, Icon, color }) => (
            <div key={label} style={S.summaryRow}>
              <span style={S.summaryLabel}>
                <Icon size={16} color={color} />
                {label}
              </span>
              <span style={S.summaryValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* Crop Health Overview — donut */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Crop Health Overview</h3>
          </div>
          {statusChartData.some((d) => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '0.5rem' }}>
                {statusChartData.map(({ name, value }) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0' }}>
                    <span style={{ fontSize: '0.8rem', color: theme.textSub, display: 'flex', alignItems: 'center' }}>
                      <span style={legendDot(STATUS_COLORS[name] ?? '#ccc')} />{name}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.text }}>{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p style={S.empty}>No data yet</p>}
        </div>

        {/* Seasonal Stage Overview */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Seasonal Stage Overview</h3>
          </div>
          {stageList.map(({ label, value, color }) => (
            <div key={label} style={{ ...S.summaryRow }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: theme.textSub }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block', flexShrink: 0 }} />
                {label}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color }}>{value} fields</span>
            </div>
          ))}
          {stageChartData.some((d) => d.value > 0) && (
            <div style={{ marginTop: '0.875rem' }}>
              <ResponsiveContainer width="100%" height={90}>
                <PieChart>
                  <Pie data={stageChartData} cx="50%" cy="50%" outerRadius={42} dataKey="value" paddingAngle={2}>
                    {stageChartData.map((entry) => (
                      <Cell key={entry.name} fill={STAGE_COLORS[entry.name] ?? '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom — 2 columns */}
      <div style={S.bottomGrid}>
        {/* Fields Needing Attention */}
        <div style={{ ...S.card, borderLeft: '4px solid #ef4444' }}>
          <div style={S.cardHeader}>
            <h3 style={{ ...S.cardTitle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#ef4444" />
              Fields Needing Attention
            </h3>
            <Link to="/fields" style={S.seeAll}>See All</Link>
          </div>
          {data.atRiskFields.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Field', 'Crop', 'Stage', 'Status', 'Why'].map((h) => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.atRiskFields.map((field: Field) => (
                    <tr key={field.id}>
                      <td style={S.td}>
                        <Link to={`/fields/${field.id}`} style={{ fontWeight: 600, color: theme.text, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={S.fieldThumb} />
                          {field.name}
                        </Link>
                      </td>
                      <td style={S.td}>{field.cropType}</td>
                      <td style={S.td}><StageBadge stage={field.stage} /></td>
                      <td style={S.td}><StatusBadge status={field.status} /></td>
                      <td style={{ ...S.td, fontSize: '0.78rem', color: '#dc2626', maxWidth: 200 }}>
                        {field.riskReason ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={S.empty}>No fields need attention — all looking healthy!</p>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Recent Activity */}
          <div style={S.card}>
            <div style={S.cardHeader}>
              <h3 style={S.cardTitle}>Recent Activity</h3>
              <Clock size={16} color="#9ca3af" />
            </div>
            {data.recentUpdates.length > 0 ? (
              data.recentUpdates.slice(0, 4).map((u) => (
                <div key={u.id} style={S.updateItem}>
                  <div style={S.updateDot} />
                  <div style={{ flex: 1 }}>
                    <div style={S.updateField}>{u.field?.name}</div>
                    <div style={S.updateMeta}>
                      Stage: <strong>{u.newStage}</strong> · {u.agent?.name} · {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight size={14} color="#d1d5db" style={{ flexShrink: 0 }} />
                </div>
              ))
            ) : (
              <p style={S.empty}>No recent activity</p>
            )}
          </div>

          {/* Agent Summary (admin only) */}
          {user?.role === 'admin' && data.agentSummary && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h3 style={S.cardTitle}>Agent Summary</h3>
                <Users size={16} color="#9ca3af" />
              </div>
              {data.agentSummary.map((a) => (
                <div key={a.agentId} style={S.agentRow}>
                  <div style={S.agentAvatar}>{a.agentName.charAt(0)}</div>
                  <div>
                    <div style={S.agentName}>{a.agentName}</div>
                    <div style={S.agentCount}>{a.totalFields} field{a.totalFields !== 1 ? 's' : ''} assigned</div>
                  </div>
                  {a.atRisk > 0 && (
                    <span style={S.atRiskPill}>{a.atRisk} at risk</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

