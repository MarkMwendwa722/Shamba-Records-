import React from 'react';
import type { Stage, FieldStatus } from '../types';

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.2rem 0.65rem',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const colors: Record<string, React.CSSProperties> = {
  green:  { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
  blue:   { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
  yellow: { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' },
  red:    { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  gray:   { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
};

const stageColor: Record<Stage, string> = {
  Planted:   'blue',
  Growing:   'green',
  Ready:     'yellow',
  Harvested: 'gray',
};

const statusColor: Record<FieldStatus, string> = {
  Active:    'green',
  'At Risk': 'red',
  Completed: 'gray',
};

export function StageBadge({ stage }: { stage: Stage }) {
  const c = stageColor[stage] ?? 'gray';
  return <span style={{ ...base, ...colors[c] }}>{stage}</span>;
}

export function StatusBadge({ status }: { status: FieldStatus }) {
  const c = statusColor[status] ?? 'gray';
  return <span style={{ ...base, ...colors[c] }}>{status}</span>;
}
