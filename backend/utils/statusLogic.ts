import type { Stage, FieldStatus } from '../types/models';

interface FieldStatusInput {
  stage: Stage;
  plantingDate: string | Date;
  lastObservationDate: Date | null | undefined;
}

/**
 * Field Status Logic
 *
 * Completed: Stage is Harvested
 * At Risk:   Stage is Planted and planting date was >90 days ago
 *            OR no observation ever logged and field is >7 days old
 *            OR last observation was >14 days ago
 * Active:    Everything else
 */
export const computeFieldStatus = (field: FieldStatusInput): FieldStatus => {
  const { stage, plantingDate, lastObservationDate } = field;

  if (stage === 'Harvested') return 'Completed';

  const now = new Date();
  const planting = new Date(plantingDate);
  const daysSincePlanting = Math.floor((now.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));

  if (stage === 'Planted' && daysSincePlanting > 90) return 'At Risk';

  if (lastObservationDate) {
    const lastObs = new Date(lastObservationDate);
    const daysSinceObservation = Math.floor(
      (now.getTime() - lastObs.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceObservation > 14) return 'At Risk';
  } else {
    if (daysSincePlanting > 7) return 'At Risk';
  }

  return 'Active';
};
