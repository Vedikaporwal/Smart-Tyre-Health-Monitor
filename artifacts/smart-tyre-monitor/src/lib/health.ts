export type Condition = 'new' | 'normal' | 'old';

export interface SensorReadings {
  temperature: number;
  pressure: number;
  aging: number;
}

export interface HealthResult extends SensorReadings {
  health: number;
  status: 'FRESH' | 'NORMAL' | 'WEAK';
  explanation: string;
}

export interface ConditionPreset extends SensorReadings {
  id: Condition;
  label: string;
  shortLabel: string;
  health: number;
}

export const CONDITION_PRESETS: Record<Condition, ConditionPreset> = {
  new: { id: 'new', label: 'NEW TYRE', shortLabel: 'NEW', temperature: 25, pressure: 34, aging: 10, health: 95 },
  normal: { id: 'normal', label: 'NORMAL TYRE', shortLabel: 'NORMAL', temperature: 42, pressure: 31, aging: 45, health: 70 },
  old: { id: 'old', label: 'OLD TYRE', shortLabel: 'OLD', temperature: 60, pressure: 27, aging: 80, health: 25 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function statusForHealth(health: number): HealthResult['status'] {
  if (health >= 80) return 'FRESH';
  if (health >= 50) return 'NORMAL';
  return 'WEAK';
}

/**
 * Deterministic engineering-demo model:
 * aging establishes the base wear curve, then temperature and pressure
 * deviations from the nearest operating profile make small, explainable
 * adjustments. The coefficients are intentionally centralized for future
 * calibration against real sensor readings.
 */
export function calculateHealth(readings: SensorReadings): HealthResult {
  const { temperature, pressure, aging } = readings;
  const agingBase =
    aging <= 10 ? 95 :
      aging <= 45 ? 95 - ((aging - 10) / 35) * 25 :
        70 - ((clamp(aging, 45, 80) - 45) / 35) * 45;
  const profile: SensorReadings =
    aging < 30 ? CONDITION_PRESETS.new :
      aging < 66 ? CONDITION_PRESETS.normal : CONDITION_PRESETS.old;
  const thermalPenalty = Math.abs(temperature - profile.temperature) * 0.12;
  const pressurePenalty = Math.abs(pressure - profile.pressure) * 0.9;
  const health = Math.round(clamp(agingBase - thermalPenalty - pressurePenalty, 0, 100));
  const status = statusForHealth(health);
  const explanation =
    status === 'FRESH'
      ? 'Tyre parameters are within the defined fresh-condition range.'
      : status === 'NORMAL'
        ? 'Tyre parameters indicate moderate wear and normal operating condition.'
        : 'Temperature, pressure and aging indicate a weak tyre condition.';
  return { ...readings, health, status, explanation };
}

export function presetResult(condition: Condition): HealthResult {
  const preset = CONDITION_PRESETS[condition];
  return { ...preset, ...calculateHealth(preset), health: preset.health };
}

export function conditionFromSlider(value: number): Condition {
  return value < 33 ? 'new' : value < 67 ? 'normal' : 'old';
}

export function sliderFromCondition(condition: Condition): number {
  return condition === 'new' ? 0 : condition === 'normal' ? 50 : 100;
}