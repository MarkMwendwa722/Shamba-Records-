import type { Stage, FieldStatus } from '../types/models';

// Crop-specific growth profiles.
// maxDaysPlanted: how long a field can remain in "Planted" before being flagged At Risk.
// maxDaysSinceObservation: observation gap (days) that triggers At Risk for this crop.
const CROP_PROFILES: Record<string, { maxDaysPlanted: number; maxDaysSinceObservation: number }> = {
  maize:     { maxDaysPlanted: 90,  maxDaysSinceObservation: 14 },
  wheat:     { maxDaysPlanted: 150, maxDaysSinceObservation: 21 },
  tomatoes:  { maxDaysPlanted: 70,  maxDaysSinceObservation: 7  },
  potatoes:  { maxDaysPlanted: 100, maxDaysSinceObservation: 14 },
  beans:     { maxDaysPlanted: 60,  maxDaysSinceObservation: 10 },
  sorghum:   { maxDaysPlanted: 120, maxDaysSinceObservation: 14 },
};
const DEFAULT_PROFILE = { maxDaysPlanted: 90, maxDaysSinceObservation: 14 };

const getProfile = (cropType?: string) =>
  (cropType ? (CROP_PROFILES[cropType.toLowerCase()] ?? DEFAULT_PROFILE) : DEFAULT_PROFILE);

interface FieldStatusInput {
  stage: Stage;
  cropType?: string;
  plantingDate: string | Date;
  lastObservationDate: Date | null | undefined;
}

export interface FieldStatusResult {
  status: FieldStatus;
  /** Human-readable explanation for why the field is At Risk; null when not At Risk. */
  reason: string | null;
}

/**
 * Field Status Logic (crop-aware)
 *
 * Completed: stage is Harvested
 * At Risk (checked in order):
 *   1. Stage is Planted and planting date exceeds crop-specific maxDaysPlanted
 *   2. No observation ever logged and field is older than 7 days
 *   3. Last observation gap exceeds crop-specific maxDaysSinceObservation
 * Active: everything else
 */
export const computeFieldStatus = (field: FieldStatusInput): FieldStatusResult => {
  const { stage, cropType, plantingDate, lastObservationDate } = field;

  if (stage === 'Harvested') return { status: 'Completed', reason: null };

  const profile = getProfile(cropType);
  const now = new Date();
  const planting = new Date(plantingDate);
  const daysSincePlanting = Math.floor((now.getTime() - planting.getTime()) / 86400000);

  if (stage === 'Planted' && daysSincePlanting > profile.maxDaysPlanted) {
    return {
      status: 'At Risk',
      reason: `Stuck in Planted for ${daysSincePlanting} days (benchmark: ${profile.maxDaysPlanted} days for ${cropType ?? 'this crop'})`,
    };
  }

  if (lastObservationDate) {
    const daysSinceObservation = Math.floor(
      (now.getTime() - new Date(lastObservationDate).getTime()) / 86400000,
    );
    if (daysSinceObservation > profile.maxDaysSinceObservation) {
      return {
        status: 'At Risk',
        reason: `No observation in ${daysSinceObservation} days (expected every ${profile.maxDaysSinceObservation} days for ${cropType ?? 'this crop'})`,
      };
    }
  } else {
    if (daysSincePlanting > 7) {
      return {
        status: 'At Risk',
        reason: `No observations logged since planting ${daysSincePlanting} days ago`,
      };
    }
  }

  return { status: 'Active', reason: null };
};
