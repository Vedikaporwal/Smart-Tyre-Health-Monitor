import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Condition } from '../lib/health';

interface VehicleVisualProps {
  condition: Condition;
  processing: boolean;
}

export function VehicleVisual({ condition, processing }: VehicleVisualProps) {
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const pointerStart = useRef<number | null>(null);

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    pointerStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    setAngle((value) => Math.max(-7, Math.min(7, value + delta * 0.035)));
    pointerStart.current = event.clientX;
  };
  const onPointerUp = () => { pointerStart.current = null; };
  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setZoom((value) => Math.max(.88, Math.min(1.12, value - event.deltaY * .0005)));
  };

  const treadOpacity = condition === 'new' ? .9 : condition === 'normal' ? .58 : .28;
  const treadWidth = condition === 'new' ? 3 : condition === 'normal' ? 2.25 : 1.6;
  return (
    <>
    <svg
      className={`vehicle-svg ${condition} ${processing ? 'processing' : ''}`}
      viewBox="0 0 720 380"
      role="img"
      aria-label={`Automotive tyre demonstration vehicle, ${condition} tyre condition`}
      style={{ transform: `perspective(900px) rotateY(${angle}deg) scale(${zoom})` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <defs>
        <linearGradient id="bodyPaint" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ef5350" />
          <stop offset=".35" stopColor="#d71920" />
          <stop offset=".8" stopColor="#a90f16" />
          <stop offset="1" stopColor="#740c12" />
        </linearGradient>
        <linearGradient id="glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <pattern id="tread" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
          <path d="M0 0L0 12" stroke="#64748b" strokeWidth="3" opacity={treadOpacity} />
        </pattern>
      </defs>
      <ellipse cx="365" cy="319" rx="276" ry="26" fill="#0f172a" opacity=".12" />
      <path d="M118 265C132 214 187 183 236 167L292 103C309 84 340 74 376 74H464C499 74 518 94 543 122L593 179C624 190 649 219 654 265Z" fill="url(#bodyPaint)" stroke="#8e1017" strokeWidth="3" />
      <path d="M282 164L315 111C328 92 349 88 377 88H446C473 89 490 105 513 135L536 164Z" fill="url(#glass)" stroke="#7b8794" strokeWidth="2" />
      <path d="M378 90V164M450 90L474 164" stroke="#a7b2bf" strokeWidth="3" opacity=".6" />
      <path d="M171 214H595" stroke="#fa8b88" strokeWidth="2" opacity=".7" />
      <path d="M133 259H180M565 259H625" stroke="#f7b2b0" strokeWidth="5" strokeLinecap="round" />
      <path d="M204 179L174 218M566 178L596 218" stroke="#6f0c12" strokeWidth="6" opacity=".7" />
      <g className={`wheel wheel-front ${processing ? 'spinning' : ''}`} style={{ transformOrigin: '560px 267px' }}>
        <circle cx="560" cy="267" r="48" fill="#1c2732" stroke="#0f172a" strokeWidth="5" />
        <circle cx="560" cy="267" r="33" fill="#94a3b8" stroke="#334155" strokeWidth="4" />
        <circle cx="560" cy="267" r="11" fill="#e2e8f0" />
        <path d="M560 229V305M522 267H598M533 240L587 294M587 240L533 294" stroke="#475569" strokeWidth="4" />
        <circle cx="560" cy="267" r="44" fill="url(#tread)" opacity={treadOpacity} />
        <circle cx="560" cy="267" r="46" fill="none" stroke="#0f172a" strokeWidth={treadWidth} opacity=".65" strokeDasharray={condition === 'new' ? '6 5' : condition === 'normal' ? '8 8' : '12 10'} />
      </g>
      <g className={`wheel wheel-back ${processing ? 'spinning' : ''}`} style={{ transformOrigin: '205px 267px' }}>
        <circle cx="205" cy="267" r="48" fill="#1c2732" stroke="#0f172a" strokeWidth="5" />
        <circle cx="205" cy="267" r="33" fill="#94a3b8" stroke="#334155" strokeWidth="4" />
        <circle cx="205" cy="267" r="11" fill="#e2e8f0" />
        <path d="M205 229V305M167 267H243M178 240L232 294M232 240L178 294" stroke="#475569" strokeWidth="4" />
        <circle cx="205" cy="267" r="44" fill="url(#tread)" opacity={treadOpacity} />
        <circle cx="205" cy="267" r="46" fill="none" stroke="#0f172a" strokeWidth={treadWidth} opacity=".65" strokeDasharray={condition === 'new' ? '6 5' : condition === 'normal' ? '8 8' : '12 10'} />
      </g>
      <path d="M118 264H652" stroke="#0f172a" strokeWidth="3" opacity=".12" />
      <g fill="#f8fafc" opacity=".78">
        <circle cx="144" cy="240" r="4" /><circle cx="640" cy="240" r="4" />
      </g>
      <text x="360" y="346" fill="#64748b" fontFamily="IBM Plex Mono, monospace" fontSize="9" textAnchor="middle" letterSpacing="2">TPMS / VEHICLE PLATFORM / LIVE VIEW</text>
    </svg>
    <div className="vehicle-controls">
      <button className="icon-btn" onClick={() => setZoom((value) => Math.min(1.12, value + .04))} aria-label="Zoom in on vehicle" data-testid="button-zoom-in">
        <ZoomIn size={14} />
      </button>
      <button className="icon-btn" onClick={() => { setAngle(0); setZoom(1); }} aria-label="Reset vehicle view" data-testid="button-reset-vehicle-view">
        <RotateCcw size={14} />
      </button>
      <button className="icon-btn" onClick={() => setZoom((value) => Math.max(.88, value - .04))} aria-label="Zoom out of vehicle" data-testid="button-zoom-out">
        <ZoomOut size={14} />
      </button>
    </div>
    </>
  );
}