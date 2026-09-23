import { useEffect, useMemo, useState } from 'react';
import { Bluetooth, Gauge, Radio, Thermometer, Timer, Wifi } from 'lucide-react';
import {
  calculateHealth,
  type Condition,
  type HealthResult,
} from '../lib/health';

type TyrePosition = 'FL' | 'FR' | 'RL' | 'RR';
type PressureStatus = 'NORMAL' | 'LOW' | 'HIGH';

interface TyreTelemetry extends HealthResult {
  position: TyrePosition;
  label: string;
  pressureStatus: PressureStatus;
}

interface FourTyreMonitorProps {
  condition: Condition;
}

const tyreSeeds: Record<TyrePosition, { pressure: number; temperature: number; aging: number; offset: number }> = {
  FL: { pressure: 32.4, temperature: 31.2, aging: 10, offset: 0 },
  FR: { pressure: 32.1, temperature: 31.8, aging: 11, offset: 0.9 },
  RL: { pressure: 31.8, temperature: 30.4, aging: 12, offset: 1.8 },
  RR: { pressure: 32.0, temperature: 30.9, aging: 10, offset: 2.7 },
};

const tyreOrder: TyrePosition[] = ['FL', 'FR', 'RL', 'RR'];
const tyreLabels: Record<TyrePosition, string> = {
  FL: 'FRONT LEFT',
  FR: 'FRONT RIGHT',
  RL: 'REAR LEFT',
  RR: 'REAR RIGHT',
};

function conditionOffset(condition: Condition) {
  if (condition === 'normal') return { pressure: -1.2, temperature: 11, aging: 34 };
  if (condition === 'old') return { pressure: -5, temperature: 29, aging: 70 };
  return { pressure: 0, temperature: 0, aging: 0 };
}

function pressureStatus(pressure: number): PressureStatus {
  if (pressure < 30) return 'LOW';
  if (pressure > 35) return 'HIGH';
  return 'NORMAL';
}

function overallStatus(health: number): HealthResult['status'] {
  if (health >= 80) return 'FRESH';
  if (health >= 50) return 'NORMAL';
  return 'WEAK';
}

function telemetryFor(condition: Condition, tick: number): TyreTelemetry[] {
  const offset = conditionOffset(condition);
  return tyreOrder.map((position) => {
    const seed = tyreSeeds[position];
    const wave = Math.sin(tick * 0.8 + seed.offset) * 0.24;
    const secondaryWave = Math.cos(tick * 0.53 + seed.offset) * 0.08;
    const readings = {
      pressure: Number((seed.pressure + offset.pressure + wave + secondaryWave).toFixed(1)),
      temperature: Number((seed.temperature + offset.temperature + Math.sin(tick * 0.45 + seed.offset) * 0.7).toFixed(1)),
      aging: Number(Math.min(100, Math.max(0, seed.aging + offset.aging + Math.sin(tick * 0.12 + seed.offset) * 0.4)).toFixed(1)),
    };
    return {
      ...readings,
      ...calculateHealth(readings),
      position,
      label: tyreLabels[position],
      pressureStatus: pressureStatus(readings.pressure),
    };
  });
}

export function FourTyreMonitor({ condition }: FourTyreMonitorProps) {
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('LIVE / 1.2 SEC');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
      setLastUpdate('LIVE / NOW');
      window.setTimeout(() => setLastUpdate('LIVE / 1.2 SEC'), 850);
    }, 1200);
    return () => window.clearInterval(interval);
  }, []);

  const tyres = useMemo(() => telemetryFor(condition, tick), [condition, tick]);
  const overallHealth = Math.round(tyres.reduce((sum, tyre) => sum + tyre.health, 0) / tyres.length);
  const overall = overallStatus(overallHealth);

  return (
    <div className="four-tyre-dashboard" data-testid="panel-four-tyre-monitor">
      <div className="four-tyre-topbar">
        <div>
          <span className="micro-label">Independent sensor network / TPMS-04</span>
          <h3>4-TYRE LIVE MONITORING</h3>
        </div>
        <div className="connection-cluster">
          <span className="live-indicator"><i /> LIVE SENSOR DATA</span>
          <span><Bluetooth size={13} /> BLUETOOTH</span>
          <span><Wifi size={13} /> WI-FI LINKED</span>
        </div>
      </div>

      <div className="four-tyre-content">
        <div className="tyre-telemetry-grid">
          {tyres.map((tyre) => (
            <article className={`tyre-telemetry-card ${tyre.pressureStatus.toLowerCase()}`} key={tyre.position} data-testid={`card-tyre-${tyre.position.toLowerCase()}`}>
              <div className="tyre-card-heading">
                <div><span className="tyre-position">{tyre.position}</span><strong>{tyre.label}</strong></div>
                <span className={`pressure-status ${tyre.pressureStatus.toLowerCase()}`}>{tyre.pressureStatus}</span>
              </div>
              <div className="tyre-pressure"><strong>{tyre.pressure.toFixed(1)}</strong><span>PSI</span></div>
              <div className="tyre-live-line"><i /> {lastUpdate} / SENSOR {tyre.position}</div>
              <dl className="tyre-metrics">
                <div><dt><Thermometer size={12} /> TEMP</dt><dd>{tyre.temperature.toFixed(1)}°C</dd></div>
                <div><dt><Timer size={12} /> AGING</dt><dd>{tyre.aging.toFixed(1)}%</dd></div>
                <div><dt><Gauge size={12} /> HEALTH</dt><dd>{tyre.health}%</dd></div>
              </dl>
            </article>
          ))}
        </div>

        <div className="top-view-stage" aria-label="Top view of vehicle with four independently monitored tyres">
          <div className="top-view-label"><Radio size={13} /> VEHICLE PLATFORM / TOP VIEW</div>
          <div className="top-view-car">
            <div className="top-view-windshield" />
            <div className="top-view-cabin"><span>SUBROS / A-01</span></div>
            <div className="top-view-hood" />
          </div>
          {tyreOrder.map((position) => {
            const tyre = tyres.find((item) => item.position === position)!;
            return <div className={`top-view-tyre ${position.toLowerCase()} ${tyre.pressureStatus.toLowerCase()}`} key={position}><i /><span>{position}</span></div>;
          })}
          <div className="top-view-legend"><span><i className="normal" /> NORMAL</span><span><i className="low" /> ATTENTION</span></div>
        </div>
      </div>

      <div className="four-tyre-summary">
        <div><span>OVERALL TYRE HEALTH</span><strong>{overallHealth}%</strong></div>
        <div className={`overall-status ${overall.toLowerCase()}`}><i /> {overall}</div>
        <div className="summary-note"><Radio size={14} /> Four sensors reporting independently</div>
      </div>
    </div>
  );
}