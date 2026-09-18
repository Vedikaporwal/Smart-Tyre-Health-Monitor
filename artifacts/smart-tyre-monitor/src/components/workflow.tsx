import { motion } from 'framer-motion';

const steps = [
  ['01', 'TYRE SENSORS', 'Temperature + pressure + aging'],
  ['02', 'INPUT DATA', 'Sensor readings collected'],
  ['03', 'ARDUINO UNO', 'Processing and threshold logic'],
  ['04', 'HEALTH CALCULATION', 'Condition evaluation'],
  ['05', 'LIVE DATA', 'Real-time parameter display'],
  ['06', 'HEALTH RESULT', 'Overall tyre health'],
];

export function Workflow() {
  return (
    <div className="flow-list" data-testid="workflow-list">
      {steps.map(([number, title, description], index) => (
        <motion.div className="flow-step" key={number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08, duration: .4 }}>
          <span className="flow-no">{number}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </motion.div>
      ))}
    </div>
  );
}