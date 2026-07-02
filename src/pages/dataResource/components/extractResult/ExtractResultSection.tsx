import React from 'react';
import { Typography } from '@arco-design/web-react';
import styles from '../../index.module.scss';

type ExtractResultSectionContentVariant = 'task' | 'graph';

interface ExtractResultSectionProps {
  title: string;
  stats?: React.ReactNode;
  hint?: React.ReactNode;
  extra?: React.ReactNode;
  contentVariant?: ExtractResultSectionContentVariant;
  children: React.ReactNode;
}

export const ExtractResultSection: React.FC<ExtractResultSectionProps> = ({
  title,
  stats,
  hint,
  extra,
  contentVariant,
  children
}) => {
  return (
    <section className={styles['extract-result-section']}>
      <div className={styles['extract-result-section-header']}>
        <span className={styles['extract-result-section-heading']}>
          <Typography.Text
            bold
            className={styles['extract-result-section-title']}
          >
            {title}
          </Typography.Text>
          {stats ? (
            <span className={styles['extract-result-section-stats']}>
              {stats}
            </span>
          ) : null}
        </span>
        <span className={styles['extract-result-section-header-right']}>
          {hint ? (
            <span className={styles['extract-result-section-hint']}>
              {hint}
            </span>
          ) : null}
          {extra}
        </span>
      </div>
      <div className={styles['extract-result-section-body']}>
        {contentVariant ? (
          <div
            className={`${styles['extract-result-section-content']} ${styles[`extract-result-section-content--${contentVariant}`]}`}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};
