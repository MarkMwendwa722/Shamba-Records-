export type Stage = 'Planted' | 'Growing' | 'Ready' | 'Harvested';
export type FieldStatus = 'Active' | 'At Risk' | 'Completed';
export type UserRole = 'admin' | 'agent';

export interface UserJSON {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateJSON {
  id: number;
  fieldId: number;
  agentId: number;
  previousStage: string | null;
  newStage: Stage;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  agent?: { id: number; name: string } | null;
  field?: { id: number; name: string; cropType: string } | null;
}

export interface FieldJSON {
  id: number;
  name: string;
  cropType: string;
  plantingDate: string;
  stage: Stage;
  status?: FieldStatus;
  riskReason?: string | null;
  location: string | null;
  sizeHectares: number | null;
  assignedAgentId: number | null;
  lastObservationDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  assignedAgent?: { id: number; name: string; email: string } | null;
  updates?: UpdateJSON[];
}

export interface DashboardResponse {
  totalFields: number;
  statusBreakdown: Record<string, number>;
  stageBreakdown: Record<string, number>;
  atRiskFields: FieldJSON[];
  recentUpdates: UpdateJSON[];
  agentSummary: AgentSummary[] | null;
}

export interface AgentSummary {
  agentId: number;
  agentName: string;
  totalFields: number;
  atRisk: number;
}
