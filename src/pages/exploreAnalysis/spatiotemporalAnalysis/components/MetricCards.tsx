import React from 'react';
import styles from '../index.module.scss';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  hint
}) => (
  <div className={styles.metricCard}>
    <div className={styles.metricLabel}>{label}</div>
    <div className={styles.metricValue}>{value}</div>
    {hint ? <div className={styles.metricHint}>{hint}</div> : null}
  </div>
);

interface MetricGridProps {
  items: MetricCardProps[];
}

export const MetricGrid: React.FC<MetricGridProps> = ({ items }) => (
  <div className={styles.metricGrid}>
    {items.map((item) => (
      <MetricCard key={item.label} {...item} />
    ))}
  </div>
);
