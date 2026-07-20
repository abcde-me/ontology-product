import React, { useMemo } from 'react';
import { Button, Tag } from '@arco-design/web-react';
import { IconLeft, IconRefresh } from '@arco-design/web-react/icon';
import type {
  SpatiotemporalAnalysisParams,
  SpatiotemporalAnalysisResult,
  SpatiotemporalDataset,
  UsageScenario
} from '../types';
import { buildJourneyConclusion } from '../services/journeyConclusion';
import { AnalysisResultView } from './AnalysisResultView';
import { DataQualityBar } from './DataQualityBar';
import styles from '../index.module.scss';

interface JourneyResultPanelProps {
  scenario: UsageScenario;
  result: SpatiotemporalAnalysisResult;
  dataset: SpatiotemporalDataset;
  params: SpatiotemporalAnalysisParams;
  onBack: () => void;
  onRetry: () => void;
}

export const JourneyResultPanel: React.FC<JourneyResultPanelProps> = ({
  scenario,
  result,
  dataset,
  params,
  onBack,
  onRetry
}) => {
  const conclusion = useMemo(() => buildJourneyConclusion(result), [result]);

  const siblingScenarios = scenario.nextSteps;

  return (
    <div className={styles.journeyResult}>
      <div className={styles.journeyResultHeader}>
        <Button type="text" icon={<IconLeft />} onClick={onBack}>
          重新选择目标
        </Button>
        <Button icon={<IconRefresh />} onClick={onRetry}>
          重新分析
        </Button>
      </div>

      <div className={styles.conclusionCard}>
        <div className={styles.conclusionEyebrow}>
          {scenario.goalQuestion}
          <Tag color="arcoblue" style={{ marginLeft: 8 }}>
            {scenario.title}
          </Tag>
        </div>
        <div className={styles.conclusionHeadline}>{conclusion.headline}</div>
        <ul className={styles.conclusionList}>
          {conclusion.findings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {conclusion.recommendations.length > 0 ? (
          <div className={styles.recommendationBox}>
            <div className={styles.recommendationTitle}>建议下一步</div>
            <ul className={styles.recommendationList}>
              {conclusion.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <DataQualityBar dataset={dataset} />

      <AnalysisResultView result={result} dataset={dataset} params={params} />

      {siblingScenarios.length > 0 ? (
        <div className={styles.nextStepSection}>
          <div className={styles.nextStepTitle}>继续深入</div>
          <div className={styles.nextStepTags}>
            {siblingScenarios.map((step) => (
              <Tag key={step} color="arcoblue">
                {step}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
