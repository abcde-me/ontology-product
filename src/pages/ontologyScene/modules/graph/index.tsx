import React from 'react';
import { AIWorflow, AIWorkflowProvider } from '@ceai-front/workflow';
import '@ceai-front/workflow/dist/es/ai-workflow.css';
import { getWorkflow, createWorkflow, updateWorkflow } from './demo/api';
import {
  MyNode,
  MyNodePanel,
  MyNodeDefault,
  MyNodeControlPanel
} from './demo/nodes';
import {
  IconApps,
  IconSettings,
  IconLink,
  IconThunderbolt,
  IconCode,
  IconFile
} from '@arco-design/web-react/icon';
import styles from './index.module.scss';

// 本体图谱
export default function OntologySceneGraph() {
  return (
    <AIWorkflowProvider
      api={{
        workflowNotExistedMarks: ['ResourceNotFound', '资源不存在'],
        getWorkflow,
        createWorkflow,
        updateWorkflow
      }}
      headerHeight={0}
    >
      <AIWorflow className={styles['ai-workflow']} />
    </AIWorkflowProvider>
  );
}
