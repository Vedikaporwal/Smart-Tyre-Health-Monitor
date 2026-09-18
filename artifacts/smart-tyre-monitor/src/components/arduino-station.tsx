interface ArduinoStationProps {
  processing: boolean;
  status: string;
}

export function ArduinoStation({ processing, status }: ArduinoStationProps) {
  return (
    <article className="arduino-card" data-testid="panel-arduino-station">
      <span className="demo-tag"><i /> DEMO DATA / HARDWARE READY</span>
      <h3>Arduino control station</h3>
      <p>Sensor readings are routed through an Arduino Uno threshold model. This is a transparent simulation until physical hardware is connected.</p>
      <div className={`board-scene ${processing ? 'active' : ''}`} aria-label={`Arduino station ${status}`}>
        <div className="board"><div className="board-lines">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div></div>
        <div className="breadboard" />
        <div className="sensor-chip"><i /><i /><i /></div>
        <div className="wire one" /><div className="wire two" /><div className="wire three" />
        <div className="signal-dot one" /><div className="signal-dot two" /><div className="signal-dot three" />
      </div>
      <div className="control-row">
        <span className={`status-pill ${processing ? 'processing' : status === 'ANALYSIS COMPLETE' ? 'complete' : ''}`}><i /> {status}</span>
        <span className="micro-label">ANALYSIS CORE / UNO-R3</span>
      </div>
    </article>
  );
}