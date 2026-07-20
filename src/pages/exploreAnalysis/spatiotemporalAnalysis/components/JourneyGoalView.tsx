import React from 'react';
import { IconArrowRight } from '@arco-design/web-react/icon';
import type { UsageScenario } from '../types';
import styles from '../index.module.scss';

interface JourneyGoalViewProps {
  scenarios: UsageScenario[];
  activeScenarioId?: string;
  onSelect: (scenario: UsageScenario) => void;
}

export const JourneyGoalView: React.FC<JourneyGoalViewProps> = ({
  scenarios,
  activeScenarioId,
  onSelect
}) => (
  <div className={styles.journeyGoalGrid}>
    {scenarios.map((scenario) => (
      <button
        key={scenario.id}
        type="button"
        className={`${styles.journeyGoalCard} ${
          activeScenarioId === scenario.id ? styles.journeyGoalCardActive : ''
        }`}
        onClick={() => onSelect(scenario)}
      >
        <div className={styles.journeyGoalQuestion}>
          {scenario.goalQuestion}
        </div>
        <div className={styles.journeyGoalTitle}>{scenario.title}</div>
        <div className={styles.journeyGoalDesc}>{scenario.description}</div>
        <div className={styles.journeyGoalOutcome}>
          <span>你将得到：</span>
          {scenario.expectedOutcome}
        </div>
        <div className={styles.journeyGoalAction}>
          一键分析
          <IconArrowRight />
        </div>
      </button>
    ))}
  </div>
);
