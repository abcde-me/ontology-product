import React from 'react';
import { Spin, Steps } from '@arco-design/web-react';
import type { UsageScenario } from '../types';
import styles from '../index.module.scss';

interface JourneyRunningViewProps {
  scenario: UsageScenario;
  runStep: number;
}

const RUN_STEPS = ['准备演示场景', '加载时空数据', '执行分析'];

export const JourneyRunningView: React.FC<JourneyRunningViewProps> = ({
  scenario,
  runStep
}) => (
  <div className={styles.journeyRunning}>
    <Spin size={32} />
    <div className={styles.journeyRunningTitle}>
      正在分析：{scenario.goalQuestion}
    </div>
    <div className={styles.journeyRunningSubtitle}>{scenario.title}</div>
    <Steps
      current={runStep + 1}
      style={{ width: 360, marginTop: 24 }}
      size="small"
    >
      {RUN_STEPS.map((label) => (
        <Steps.Step key={label} title={label} />
      ))}
    </Steps>
  </div>
);
