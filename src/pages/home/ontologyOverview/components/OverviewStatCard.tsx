import React from 'react';
import classNames from 'classnames';
import styles from '../index.module.scss';

interface OverviewStatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<React.SVGAttributes<SVGElement>>;
  selected?: boolean;
  onClick?: () => void;
}

export const OverviewStatCard: React.FC<OverviewStatCardProps> = ({
  title,
  value,
  icon: Icon,
  selected = false,
  onClick
}) => {
  return (
    <div
      className={classNames(styles['stat-card'], {
        [styles['stat-card-selected']]: selected
      })}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className={styles['stat-card-icon']}>
        <Icon className={styles['stat-card-icon-svg']} />
      </div>
      <div className={styles['stat-card-content']}>
        <div className={styles['stat-card-title']} title={title}>
          {title}
        </div>
        <div className={styles['stat-card-value']}>{value}</div>
      </div>
    </div>
  );
};
