interface HealthRingProps {
  health: number;
  status: 'FRESH' | 'NORMAL' | 'WEAK';
}

export function HealthRing({ health, status }: HealthRingProps) {
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const color = status === 'FRESH' ? '#16a34a' : status === 'NORMAL' ? '#f59e0b' : '#dc2626';
  return (
    <div className="health-ring" data-testid="display-health-ring">
      <svg viewBox="0 0 150 150" aria-hidden="true">
        <circle className="health-ring-track" cx="75" cy="75" r={radius} />
        <circle className="health-ring-progress" cx="75" cy="75" r={radius} stroke={color} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - health / 100)} />
      </svg>
      <div className="health-ring-copy">
        <strong data-testid="text-health-score">{health}%</strong>
        <span>HEALTH INDEX</span>
      </div>
    </div>
  );
}