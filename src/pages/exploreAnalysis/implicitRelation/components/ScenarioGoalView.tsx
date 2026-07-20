import React from 'react';
import { IconArrowRight } from '@arco-design/web-react/icon';
import type { ImplicitRelationUsageScenario } from '../types';
import styles from '../index.module.scss';

interface ScenarioGoalViewProps {
  scenarios: ImplicitRelationUsageScenario[];
  loadingScenarioId?: string;
  onSelect: (scenario: ImplicitRelationUsageScenario) => void;
}

export default function ScenarioGoalView({
  scenarios,
  loadingScenarioId,
  onSelect
}: ScenarioGoalViewProps) {
  return (
    <div className={styles.scenarioGoalGrid}>
      {scenarios.map((scenario) => {
        const loading = loadingScenarioId === scenario.id;
        const disabled = Boolean(loadingScenarioId);

        return (
          <button
            key={scenario.id}
            type="button"
            disabled={disabled}
            className={`${styles.scenarioGoalCard} ${
              loading ? styles.scenarioGoalCardActive : ''
            }`}
            onClick={() => onSelect(scenario)}
          >
            <div className={styles.scenarioGoalCardHeader}>
              <div className={styles.scenarioGoalTitle}>{scenario.title}</div>
              <span className={styles.scenarioGoalAction}>
                {loading ? '正在进入...' : '进入配置'}
                {!loading ? <IconArrowRight /> : null}
              </span>
            </div>
            <div className={styles.scenarioGoalDesc}>
              {scenario.description}
            </div>
            <div className={styles.scenarioGoalOutcome}>
              <span>你将得到：</span>
              {scenario.expectedOutcome}
            </div>
          </button>
        );
      })}
    </div>
  );
}
