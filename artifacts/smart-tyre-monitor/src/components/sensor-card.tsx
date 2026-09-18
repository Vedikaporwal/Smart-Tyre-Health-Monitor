import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SensorCardProps {
  title: string;
  value: string;
  description: string;
  percentage: number;
  icon: LucideIcon;
  testId: string;
}

export function SensorCard({ title, value, description, percentage, icon: Icon, testId }: SensorCardProps) {
  return (
    <motion.article className="sensor-card" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .45 }}>
      <div className="sensor-icon"><Icon size={17} /></div>
      <h3>{title}</h3>
      <div className="sensor-value" data-testid={`sensor-value-${testId}`}>{value}</div>
      <p>{description}</p>
      <div className="meter" aria-hidden="true"><span style={{ width: `${Math.max(3, Math.min(100, percentage))}%` }} /></div>
    </motion.article>
  );
}