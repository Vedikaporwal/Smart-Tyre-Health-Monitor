import { useState } from 'react';
import { Bluetooth, CheckCircle2, QrCode, Smartphone, Wifi } from 'lucide-react';
import type { HealthResult } from '../lib/health';

interface PhoneMonitorProps {
  result: HealthResult;
}

const qrPattern = [
  '111111100101101111111',
  '100000101110101000001',
  '101110100100101011101',
  '101110101011101011101',
  '101110100111001011101',
  '100000101010101000001',
  '111111101010101111111',
  '000000001101100000000',
  '110101111011011101101',
  '001110001100110001110',
  '101011101011101110101',
  '011100010110001000111',
  '110111111001111101101',
  '000000001110100000000',
  '111111101011101111111',
  '100000101100101000001',
  '101110100111101011101',
  '101110101000101011101',
  '101110100110101011101',
  '100000101101101000001',
  '111111101010101111111',
];

export function PhoneMonitor({ result }: PhoneMonitorProps) {
  const [connected, setConnected] = useState(false);

  return (
    <section className="phone-monitor" id="phone">
      <div className="wrap">
        <div className="phone-monitor-head">
          <div>
            <span className="section-kicker phone-kicker">04 / Companion monitoring</span>
            <h2>Monitor from your phone.</h2>
          </div>
          <p>
            Pair the control station with a companion view so the same tyre
            readings and alerts stay available outside the vehicle.
          </p>
        </div>

        <div className="phone-monitor-card">
          <div className="phone-monitor-copy">
            <div className="phone-step">
              <span>01</span>
              <div><strong>Scan to pair</strong><small>Use the companion app camera.</small></div>
            </div>
            <div className="phone-step">
              <span>02</span>
              <div><strong>Choose the vehicle</strong><small>Connect to vehicle platform A-01.</small></div>
            </div>
            <div className="phone-step">
              <span>03</span>
              <div><strong>Keep the driver informed</strong><small>Live health and alerts follow the tyre.</small></div>
            </div>

            <div className="phone-signal-note">
              <Bluetooth size={15} />
              <span>{connected ? 'SECURE LINK ACTIVE' : 'BLUETOOTH / WI-FI READY'}</span>
            </div>
          </div>

          <div className="pairing-panel">
            <div className="qr-card">
              <div className="qr-code" aria-label="Demo pairing QR code">
                {qrPattern.map((row, rowIndex) =>
                  row.split('').map((cell, cellIndex) => (
                    <i
                      className={cell === '1' ? 'on' : ''}
                      key={`${rowIndex}-${cellIndex}`}
                    />
                  )),
                )}
              </div>
              <span>SCAN TO PAIR</span>
            </div>

            <div className={`phone-preview ${connected ? 'connected' : ''}`}>
              <div className="phone-camera" />
              <div className="phone-screen">
                <div className="phone-screen-top">
                  <span>TYRE HEALTH</span>
                  <Wifi size={12} />
                </div>
                <span className="phone-connection">
                  {connected ? 'DEVICE CONNECTED' : 'NOT CONNECTED'}
                </span>
                {connected ? (
                  <div className="phone-live-result">
                    <strong>{result.health}%</strong>
                    <span>{result.status} / LIVE</span>
                    <small>{result.temperature.toFixed(1)}°C · {result.pressure.toFixed(1)} PSI</small>
                  </div>
                ) : (
                  <div className="phone-empty">
                    <Smartphone size={18} />
                    <span>Pair a device<br />to see live data here</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`pair-status ${connected ? 'connected' : ''}`}>
              <i />
              {connected ? 'Device connected · live readings synced' : 'Device not paired'}
            </div>

            <button
              className={`connect-button ${connected ? 'connected' : ''}`}
              onClick={() => setConnected((value) => !value)}
              aria-pressed={connected}
              data-testid="button-connect-device"
            >
              {connected ? <CheckCircle2 size={15} /> : <QrCode size={15} />}
              {connected ? 'DISCONNECT DEVICE' : 'CONNECT DEVICE'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}