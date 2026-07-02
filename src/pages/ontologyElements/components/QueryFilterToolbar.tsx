import React from 'react';
import pageStyles from '../index.module.scss';

interface QueryFilterToolbarProps {
  actions: React.ReactNode;
  children: React.ReactNode;
}

export const QueryFilterToolbar: React.FC<QueryFilterToolbarProps> = ({
  actions,
  children
}) => (
  <div
    className={pageStyles['elements-query-toolbar']}
    data-query-toolbar="true"
  >
    <div className={pageStyles['elements-query-row']}>
      <div className={pageStyles['elements-query-fields']}>{children}</div>
      <div className={pageStyles['elements-query-actions']}>{actions}</div>
    </div>
  </div>
);
