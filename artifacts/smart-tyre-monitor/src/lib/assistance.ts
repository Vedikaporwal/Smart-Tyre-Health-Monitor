export type AssistanceSeverity = 'none' | 'recommended' | 'emergency';
export type TyrePosition = 'Front Left' | 'Front Right' | 'Rear Left' | 'Rear Right';

export interface AssistanceDecision {
  severity: AssistanceSeverity;
  title: string;
  reason: string;
  message: string;
  tyreLabel: TyrePosition;
  pressureDelta: number;
  temperature: number;
  statusText: 'ASSISTANCE RECOMMENDED' | 'EMERGENCY ASSISTANCE';
  key: string;
}

export interface AssistedMechanic {
  name: string;
  distance: string;
  eta: string;
  rating: number;
  status: 'Open' | 'Closed';
  services: string[];
  phone: string;
  location: string;
}

export const ASSISTANCE_THRESHOLDS = {
  rapidPressureDrop: 5,
  continuousPressureLossDrop: 1.2,
  consecutivePressureReads: 3,
  warningHealth: 60,
  criticalHealth: 35,
} as const;

export const TYRE_POSITIONS: TyrePosition[] = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right'];

export function getTyreAssistanceTarget(seed: number): TyrePosition {
  return TYRE_POSITIONS[Math.abs(seed) % TYRE_POSITIONS.length];
}

export const DEMO_MECHANICS: AssistedMechanic[] = [
  {
    name: 'AutoCare Tyre Centre',
    distance: '1.2 km',
    eta: '8 min',
    rating: 4.7,
    status: 'Open',
    services: ['Puncture Repair', 'Tyre Inflation', 'Wheel Service'],
    phone: '+91-90000-00000',
    location: 'Demo Location, Sector 18',
  },
  {
    name: 'Roadside Rescue Pro',
    distance: '2.1 km',
    eta: '12 min',
    rating: 4.8,
    status: 'Open',
    services: ['Emergency Air', 'Valve Fix', 'Tyre Inspection'],
    phone: '+91-90000-00001',
    location: 'Demo Location, Market Road',
  },
  {
    name: 'Rapid Tyre Fix',
    distance: '3.4 km',
    eta: '16 min',
    rating: 4.5,
    status: 'Open',
    services: ['Puncture Repair', 'Battery Jump', 'On-Site Help'],
    phone: '+91-90000-00002',
    location: 'Demo Location, Highway Link',
  },
];

export function buildDirectionsUrl(mechanic: AssistedMechanic): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mechanic.location)}`;
}

export function evaluateAssistance({
  currentPressure,
  previousPressure,
  currentTemperature,
  health,
  status,
  consecutivePressureDrops,
  tyreIndex,
}: {
  currentPressure: number;
  previousPressure: number | null;
  currentTemperature: number;
  health: number;
  status: 'FRESH' | 'NORMAL' | 'WEAK';
  consecutivePressureDrops: number;
  tyreIndex: number;
}): AssistanceDecision | null {
  const pressureDelta = previousPressure === null ? 0 : Math.max(0, previousPressure - currentPressure);
  const rapidDrop = previousPressure !== null && pressureDelta >= ASSISTANCE_THRESHOLDS.rapidPressureDrop;
  const continuousLoss =
    previousPressure !== null &&
    consecutivePressureDrops >= ASSISTANCE_THRESHOLDS.consecutivePressureReads &&
    pressureDelta >= ASSISTANCE_THRESHOLDS.continuousPressureLossDrop;
  const tyreLabel = getTyreAssistanceTarget(tyreIndex);

  if (rapidDrop) {
    return {
      severity: 'emergency',
      title: 'TYRE EMERGENCY DETECTED',
      reason: 'POSSIBLE PUNCTURE',
      message: 'Front-left tyre pressure is dropping rapidly. Nearby tyre assistance is available.',
      tyreLabel,
      pressureDelta,
      temperature: currentTemperature,
      statusText: 'EMERGENCY ASSISTANCE',
      key: `puncture-${tyreLabel}-${pressureDelta.toFixed(1)}`,
    };
  }

  if (continuousLoss) {
    return {
      severity: 'emergency',
      title: 'TYRE EMERGENCY DETECTED',
      reason: 'CONTINUOUS PRESSURE LOSS',
      message: 'Pressure has been dropping over several monitoring updates. Nearby tyre assistance is available.',
      tyreLabel,
      pressureDelta,
      temperature: currentTemperature,
      statusText: 'EMERGENCY ASSISTANCE',
      key: `continuous-loss-${tyreLabel}-${consecutivePressureDrops}`,
    };
  }

  if (health <= ASSISTANCE_THRESHOLDS.criticalHealth || status === 'WEAK') {
    return {
      severity: 'emergency',
      title: 'CRITICAL TYRE CONDITION DETECTED',
      reason: 'CRITICAL / RED CONDITION',
      message: 'Critical tyre condition detected. Driving may be unsafe. Nearby assistance is available.',
      tyreLabel,
      pressureDelta,
      temperature: currentTemperature,
      statusText: 'EMERGENCY ASSISTANCE',
      key: `critical-health-${tyreLabel}-${health}`,
    };
  }

  if (health <= ASSISTANCE_THRESHOLDS.warningHealth || currentPressure < 28 || currentTemperature > 60) {
    return {
      severity: 'recommended',
      title: 'ASSISTANCE RECOMMENDED',
      reason: 'YELLOW WARNING CONDITION',
      message: 'Tyre condition requires attention. Nearby mechanics are available if assistance is needed.',
      tyreLabel,
      pressureDelta,
      temperature: currentTemperature,
      statusText: 'ASSISTANCE RECOMMENDED',
      key: `warning-${tyreLabel}-${health}`,
    };
  }

  return null;
}
