import React from 'react';
import styles from '../index.module.scss';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children
}) => {
  return (
    <section className={styles['form-section']}>
      <div className={styles['form-section-header']}>
        <div className={styles['form-section-title']}>{title}</div>
        {description && (
          <div className={styles['form-section-desc']}>{description}</div>
        )}
      </div>
      <div className={styles['form-section-body']}>{children}</div>
    </section>
  );
};
