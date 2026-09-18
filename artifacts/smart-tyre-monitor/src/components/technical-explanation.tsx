import { useState } from 'react';
import { ChevronDown, Gauge, Thermometer, Timer } from 'lucide-react';

const items = [
  { title: 'Temperature', icon: Thermometer, short: 'An indicator of the tyre thermal operating condition.', body: 'Temperature trends can reveal whether the tyre is operating within a stable window. The demo uses the reading as one of three weighted inputs in the threshold model.' },
  { title: 'Pressure', icon: Gauge, short: 'Represents inflation condition at the tyre.', body: 'Inflation changes the contact patch and the way a tyre carries load. The pressure channel helps the model identify readings outside the defined fresh and normal bands.' },
  { title: 'Tyre aging', icon: Timer, short: 'Represents degradation over time and use.', body: 'Aging is the long-term wear input. It establishes the base health curve, while live temperature and pressure readings make the result respond to immediate conditions.' },
];

export function TechnicalExplanation() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="explain-grid">
      {items.map(({ title, icon: Icon, short, body }, index) => {
        const isOpen = open === index;
        return (
          <article className="explain-card" key={title}>
            <button className="explain-button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-expand-${title.toLowerCase().replace(' ', '-')}`}>
              <span className="explain-title"><i><Icon size={16} /></i>{title}</span>
              <ChevronDown size={17} style={{ transform: `rotate(${isOpen ? 180 : 0}deg)`, transition: 'transform .2s ease' }} />
            </button>
            {isOpen && <p>{body} {short}</p>}
          </article>
        );
      })}
    </div>
  );
}