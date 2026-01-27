import React from 'react';
import styles from './index.module.scss';
import { StructuredWorkflowList } from '@/pages/workflowList/structuredWorkflowList';

export default function WorkflowList() {
  return (
    <div className={styles['workflow']}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>工作流</h1>
      <StructuredWorkflowList />
    </div>
  );
}
