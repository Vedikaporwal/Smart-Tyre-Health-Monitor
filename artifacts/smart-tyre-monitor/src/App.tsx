import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowRight, Gauge, Menu, Play, RotateCcw, Thermometer, Timer, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArduinoStation } from './components/arduino-station';
import { HealthRing } from './components/health-ring';
import { SensorCard } from './components/sensor-card';
import { TechnicalExplanation } from './components/technical-explanation';
import { VehicleVisual } from './components/vehicle-visual';
import { Workflow } from './components/workflow';
import {
  calculateHealth,
  CONDITION_PRESETS,
  conditionFromSlider,
  type Condition,
  type SensorReadings,
  sliderFromCondition,
} from './lib/health';

const queryClient = new QueryClient();
const stageLabels = [
  'SYSTEM READY',
  'INITIALIZING SENSORS...',
  'READING SENSOR INPUT...',
  'TRANSMITTING DATA TO ARDUINO...',
  'PROCESSING THRESHOLD LOGIC...',
  'CALCULATING TYRE HEALTH...',
  'ANALYSIS COMPLETE',
];
const navItems = [
  ['HOME', 'home'],
  ['SYSTEM', 'system'],
  ['LIVE DATA', 'live-data'],
  ['WORKFLOW', 'workflow'],
  ['TECHNICAL', 'technical'],
];

function Header({ onDemo }: { onDemo: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="brand-lockup" href="#home" onClick={() => setMenuOpen(false)} data-testid="link-home">
          <img className="brand-logo" src="/assets/subros-logo.png" alt="Subros" />
          <span className="brand-context"><strong>ACADEMIA</strong><span>SKILL OLYMPIAD 2026</span></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map(([label, id]) => <a href={`#${id}`} key={id} onClick={() => navigate(id)} data-testid={`link-nav-${id}`}>{label}</a>)}
        </nav>
        <button className="header-demo" onClick={onDemo} data-testid="button-header-start">START DEMO</button>
        <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} data-testid="button-mobile-menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        {navItems.map(([label, id]) => <a href={`#${id}`} key={id} onClick={() => navigate(id)}>{label}</a>)}
      </nav>
    </header>
  );
}

function AppPage() {
  const [condition, setCondition] = useState<Condition>('new');
  const [slider, setSlider] = useState(0);
  const [readings, setReadings] = useState<SensorReadings>(CONDITION_PRESETS.new);
  const [stage, setStage] = useState(0);
  const [simulation, setSimulation] = useState(false);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const [compare, setCompare] = useState(false);
  const [manual, setManual] = useState({ temperature: '42', pressure: '31', aging: '45' });
  const [manualError, setManualError] = useState('');
  const [viewReset, setViewReset] = useState(0);
  const result = useMemo(() => calculateHealth(readings), [readings]);
  const processing = stage > 0 && stage < 6;
  const stageText = stageLabels[stage];

  useEffect(() => {
    if (!processing) return;
    const interval = window.setInterval(() => {
      setStage((current) => {
        if (current >= 5) {
          window.clearInterval(interval);
          return 6;
        }
        return current + 1;
      });
    }, 700);
    return () => window.clearInterval(interval);
  }, [processing]);

  useEffect(() => {
    if (!simulation || simulationPaused) return;
    const interval = window.setInterval(() => {
      setSimTick((tick) => tick + 1);
      setReadings((current) => {
        const preset = CONDITION_PRESETS[condition];
        const wave = Math.sin((simTick + 1) * 1.4);
        return {
          temperature: Number((preset.temperature + wave * .4).toFixed(1)),
          pressure: Number((preset.pressure + Math.cos((simTick + 1) * 1.2) * .12).toFixed(1)),
          aging: Number(Math.min(100, Math.max(0, preset.aging + Math.sin((simTick + 1) * .18) * .2)).toFixed(1)),
        };
      });
    }, 1350);
    return () => window.clearInterval(interval);
  }, [simulation, simulationPaused, condition, simTick]);

  const chooseCondition = (next: Condition) => {
    setCondition(next);
    setSlider(sliderFromCondition(next));
    const preset = CONDITION_PRESETS[next];
    setReadings({ temperature: preset.temperature, pressure: preset.pressure, aging: preset.aging });
    setStage(0);
  };

  const chooseSlider = (value: number) => {
    const next = conditionFromSlider(value);
    setSlider(value);
    setCondition(next);
    const preset = CONDITION_PRESETS[next];
    setReadings({ temperature: preset.temperature, pressure: preset.pressure, aging: preset.aging });
    setStage(0);
  };

  const resetSystem = () => {
    setCondition('new');
    setSlider(0);
    setReadings(CONDITION_PRESETS.new);
    setStage(0);
    setSimulation(false);
    setSimulationPaused(false);
    setCompare(false);
    setManualError('');
    setViewReset((value) => value + 1);
  };

  const calculateManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const temperature = Number(manual.temperature);
    const pressure = Number(manual.pressure);
    const aging = Number(manual.aging);
    if (![temperature, pressure, aging].every(Number.isFinite) || temperature < -40 || temperature > 120 || pressure < 0 || pressure > 80 || aging < 0 || aging > 100) {
      setManualError('Enter temperature −40–120 °C, pressure 0–80 PSI and aging 0–100%.');
      return;
    }
    setManualError('');
    setReadings({ temperature, pressure, aging });
    const next: Condition = aging < 30 ? 'new' : aging < 66 ? 'normal' : 'old';
    setCondition(next);
    setSlider(aging);
    setStage(6);
  };

  const startSystem = () => {
    if (processing) return;
    setStage(1);
  };

  return (
    <div className="app-shell">
      <Header onDemo={() => { startSystem(); document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' }); }} />
      <main>
        <section className="hero" id="home">
          <div className="wrap hero-grid">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
              <span className="eyebrow"><i /> 3rd SUBROS Academia Skill Olympiad 2026</span>
              <h1>SMART TYRE <em>HEALTH</em><br />MONITORING SYSTEM</h1>
              <p className="hero-copy">An intelligent tyre-health monitoring concept combining temperature, pressure and tyre-aging parameters to evaluate tyre condition and provide an overall health indication.</p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-explore-system">EXPLORE SYSTEM <ArrowRight size={15} /></button>
                <button className="btn btn-outline" onClick={startSystem} data-testid="button-start-demonstration"><Play size={14} /> START DEMONSTRATION</button>
              </div>
              <div className="hero-facts">
                <div className="hero-fact"><strong>TPMS</strong><span>sensor layer</span></div>
                <div className="hero-fact"><strong>UNO-R3</strong><span>processing core</span></div>
                <div className="hero-fact"><strong>0.7s</strong><span>analysis stages</span></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .15 }}>
              <div className="vehicle-stage" data-testid="vehicle-stage">
                <span className="stage-code">VEHICLE PLATFORM / A-01</span>
                <span className="stage-status"><i /> {processing ? 'LIVE ANALYSIS' : 'SYSTEM READY'}</span>
                <VehicleVisual key={viewReset} condition={condition} processing={processing} />
                <span className="stage-tag">DRAG TO ORBIT · SCROLL TO ZOOM</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section" id="system">
          <div className="wrap">
            <div className="section-head">
              <div><span className="section-kicker">01 / Interactive vehicle lab</span><h2>See the tyre. Read the system.</h2></div>
              <p>Select a tyre condition and watch the vehicle visualization, sensor values and health model move together.</p>
            </div>
            <div className="lab-layout">
              <div className="lab-card">
                <div className="selector-head"><span className="micro-label">Tyre condition selector</span><span className="condition-readout">{CONDITION_PRESETS[condition].label}</span></div>
                <div className="range-wrap">
                  <div className="range-track" /><div className="range-fill" style={{ width: `calc(${slider}% - 5px)` }} />
                  <input className="condition-range" type="range" min="0" max="100" value={slider} onChange={(event) => chooseSlider(Number(event.target.value))} aria-label="Tyre condition from new to old" data-testid="input-condition-slider" />
                  <div className="range-labels"><span>NEW</span><span>NORMAL</span><span>OLD</span></div>
                </div>
                <div className="condition-buttons">
                  {(Object.keys(CONDITION_PRESETS) as Condition[]).map((item) => <button key={item} className={`condition-button ${condition === item ? 'active' : ''}`} onClick={() => chooseCondition(item)} aria-pressed={condition === item} data-testid={`button-condition-${item}`}>{CONDITION_PRESETS[item].label}</button>)}
                </div>
                <div className="run-strip">
                  <span className={`status-pill ${processing ? 'processing' : stage === 6 ? 'complete' : ''}`}><i /> {stageText}</span>
                  <button className="btn btn-primary" onClick={startSystem} disabled={processing} data-testid="button-start-system"><Play size={14} /> {processing ? 'PROCESSING' : 'START SYSTEM'}</button>
                </div>
              </div>
              <article className="result-card" id="result" data-testid="panel-health-result">
                <div className="result-top">
                  <div><span className="micro-label">Live result / model output</span><h3>Tyre health result</h3><span className={`health-status ${result.status === 'NORMAL' ? 'normal' : result.status === 'WEAK' ? 'weak' : ''}`}>{result.status}</span><p className="result-explainer">{result.explanation}</p></div>
                  <HealthRing health={result.health} status={result.status} />
                </div>
                <div className="result-meta">
                  <div><span>CONDITION</span><strong>{CONDITION_PRESETS[condition].shortLabel}</strong></div>
                  <div><span>MODEL</span><strong>TH-2.6</strong></div>
                  <div><span>UPDATE</span><strong>{stage === 6 ? 'LIVE' : 'READY'}</strong></div>
                </div>
                <div className="control-row">
                  <button className="text-button" onClick={resetSystem} data-testid="button-reset-system"><RotateCcw size={13} /> RESET SYSTEM</button>
                  <span className="micro-label">{processing ? 'SIGNAL ACTIVE' : 'WAITING FOR RUN'}</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="live-data">
          <div className="wrap">
            <div className="section-head">
              <div><span className="section-kicker">02 / Sensor input</span><h2>Live tyre data</h2></div>
              <p>Three inputs, one readable health signal. Values are surfaced as instrumentation, not hidden in a dashboard.</p>
            </div>
            <div className="sensors-grid">
              <SensorCard title="TEMPERATURE" value={`${readings.temperature.toFixed(1)} °C`} description="Monitors tyre thermal condition." percentage={(readings.temperature / 75) * 100} icon={Thermometer} testId="temperature" />
              <SensorCard title="PRESSURE" value={`${readings.pressure.toFixed(1)} PSI`} description="Monitors tyre inflation condition." percentage={(readings.pressure / 40) * 100} icon={Gauge} testId="pressure" />
              <SensorCard title="TYRE AGING" value={`${readings.aging.toFixed(1)}%`} description="Represents tyre degradation condition." percentage={readings.aging} icon={Timer} testId="aging" />
            </div>
            <div className="input-lab" style={{ marginTop: 24 }}>
              <form className="manual-card" onSubmit={calculateManual}>
                <span className="section-kicker">Calibration panel</span>
                <h3>Manual sensor input</h3>
                <p>Test the threshold model with a custom sensor packet. Inputs are validated before the health index updates.</p>
                <div className="form-grid">
                  <div className="field"><label htmlFor="manual-temperature">TEMPERATURE °C</label><input id="manual-temperature" type="number" step=".1" value={manual.temperature} onChange={(event) => setManual({ ...manual, temperature: event.target.value })} data-testid="input-manual-temperature" /></div>
                  <div className="field"><label htmlFor="manual-pressure">PRESSURE PSI</label><input id="manual-pressure" type="number" step=".1" value={manual.pressure} onChange={(event) => setManual({ ...manual, pressure: event.target.value })} data-testid="input-manual-pressure" /></div>
                  <div className="field"><label htmlFor="manual-aging">AGING %</label><input id="manual-aging" type="number" step=".1" value={manual.aging} onChange={(event) => setManual({ ...manual, aging: event.target.value })} data-testid="input-manual-aging" /></div>
                </div>
                {manualError && <div className="error-text" role="alert">{manualError}</div>}
                <button className="btn btn-outline" type="submit" style={{ marginTop: 16 }} data-testid="button-calculate-health">CALCULATE HEALTH <Activity size={14} /></button>
              </form>
              <div className="manual-card">
                <span className="section-kicker">Runtime controls</span>
                <h3>Live simulation</h3>
                <p>Small deterministic sensor fluctuations demonstrate how a real stream would keep the model responsive.</p>
                <div className="mode-row"><div><span>SIMULATION MODE</span><small>{simulation ? (simulationPaused ? 'PAUSED / HOLDING LAST PACKET' : 'STREAMING DEMO VALUES') : 'OFF / PRESET VALUES'}</small></div><button className={`toggle ${simulation ? 'on' : ''}`} onClick={() => setSimulation((value) => !value)} aria-label="Toggle simulation mode" aria-pressed={simulation} data-testid="toggle-simulation" /></div>
                <div className="control-row"><button className="text-button" onClick={() => setSimulationPaused((value) => !value)} disabled={!simulation} data-testid="button-pause-simulation">{simulationPaused ? 'RESUME SIMULATION' : 'PAUSE SIMULATION'}</button><button className="text-button" onClick={() => { setSimulationPaused(false); setSimTick(0); setReadings(CONDITION_PRESETS[condition]); }} data-testid="button-reset-simulation">RESET STREAM</button></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="workflow">
          <div className="wrap">
            <div className="section-head"><div><span className="section-kicker">03 / Signal chain</span><h2>How the system works</h2></div><p>From a tyre-side reading to a judge-ready health indication in six observable stages.</p></div>
            <ArduinoStation processing={processing} status={stageText} />
            <Workflow />
          </div>
        </section>

        <section className="section section-alt" id="technical">
          <div className="wrap">
            <div className="section-head"><div><span className="section-kicker">04 / Technical clarity</span><h2>Built to be explained.</h2></div><p>The architecture is intentionally legible: every measurement has a reason, every output has a path.</p></div>
            <div className="architecture">
              <div className="arch-list">
                {[
                  ['01', 'TYRE', 'Physical condition under observation'],
                  ['02', 'SENSORS', 'Temperature, pressure and aging inputs'],
                  ['03', 'ARDUINO', 'Signal collection and threshold logic'],
                  ['04', 'DATA PROCESSING', 'Deterministic health calculation'],
                  ['05', 'USER INTERFACE', 'Live result for the operator'],
                ].map(([number, title, description]) => <div className="arch-item" key={number}><b>{number}</b><div><strong>{title}</strong><span>{description}</span></div></div>)}
              </div>
              <div><span className="section-kicker">Engineering notes</span><h3 style={{ margin: '10px 0 15px', fontSize: 26, letterSpacing: '-.04em' }}>Why these parameters matter</h3><TechnicalExplanation /></div>
            </div>
            <div className="control-row" style={{ marginTop: 30 }}><div><span className="section-kicker">Judge mode</span><h3 style={{ marginTop: 7, fontSize: 22 }}>Compare all three profiles</h3></div><button className={`btn ${compare ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCompare((value) => !value)} aria-expanded={compare} data-testid="button-compare-conditions">{compare ? 'HIDE COMPARISON' : 'COMPARE CONDITIONS'} <ArrowRight size={14} /></button></div>
            <AnimatePresence>
              {compare && <motion.div className="compare-panel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} data-testid="panel-comparison"><div className="compare-grid">{(Object.keys(CONDITION_PRESETS) as Condition[]).map((item) => { const preset = CONDITION_PRESETS[item]; const comparison = calculateHealth(preset); return <div className={`compare-item ${condition === item ? 'selected' : ''}`} key={item}><h4>{preset.label}</h4><dl><dt>TEMPERATURE</dt><dd>{preset.temperature} °C</dd><dt>PRESSURE</dt><dd>{preset.pressure} PSI</dd><dt>AGING</dt><dd>{preset.aging}%</dd><dt>HEALTH</dt><dd>{comparison.health}%</dd><dt>STATUS</dt><dd>{comparison.status}</dd></dl></div>; })}</div></motion.div>}
            </AnimatePresence>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap footer-inner"><div><strong>SMART TYRE HEALTH MONITORING SYSTEM</strong><span>3rd SUBROS Academia Skill Olympiad 2026</span></div><div className="footer-note">INTERACTIVE DIGITAL PROTOTYPE / LOCAL DEMO DATA</div></div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppPage />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;