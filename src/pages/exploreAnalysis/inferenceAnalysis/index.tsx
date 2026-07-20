import React, { useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { removeStaleArcoOverlays } from '@/utils/removeStaleArcoOverlays';
import TaskListTab from './components/TaskListTab';
import styles from './index.module.scss';

export default function InferenceAnalysis() {
  useEffect(() => {
    return () => {
      removeStaleArcoOverlays();
    };
  }, []);

  return (
    <div className={styles.listPage}>
      <PageHeader
        title="推理分析"
        subTitle="基于本体知识与规则进行推理分析与结论解释"
      />
      <TaskListTab />
    </div>
  );
}
