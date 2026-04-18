export type Stage = 'Planted' | 'Growing' | 'Ready' | 'Harvested';
export type FieldStatus = 'Active' | 'At Risk' | 'Completed';
export type UserRole = 'admin' | 'agent';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AgentUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UpdateRecord {
  id: number;
  fieldId: number;
  agentId: number;
  previousStage: string | null;
  newStage: Stage;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  agent?: { id: number; name: string } | null;
  field?: { id: number; name: string; cropType: string } | null;
}

export interface Field {
  id: number;
  name: string;
  cropType: string;
  plantingDate: string;
  stage: Stage;
  status: FieldStatus;
  riskReason?: string | null;
  location: string | null;
  sizeHectares: number | null;
  assignedAgentId: number | null;
  lastObservationDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: { id: number; name: string; email: string } | null;
  updates?: UpdateRecord[];
}

export interface AgentSummary {
  agentId: number;
  agentName: string;
  totalFields: number;
  atRisk: number;
}

export interface DashboardData {
  totalFields: number;
  statusBreakdown: Record<string, number>;
  stageBreakdown: Record<string, number>;
  atRiskFields: Field[];
  recentUpdates: UpdateRecord[];
  agentSummary: AgentSummary[] | null;
}
