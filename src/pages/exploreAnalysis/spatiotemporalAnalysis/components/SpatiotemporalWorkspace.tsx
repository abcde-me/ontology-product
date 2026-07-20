import React, { useCallback, useEffect, useState } from 'react';
import { Button, Collapse, Message, Select } from '@arco-design/web-react';
import AnalysisScopeFields from '@/pages/exploreAnalysis/implicitRelation/components/AnalysisScopeFields';
import type { ImplicitAnalysisScope } from '@/pages/exploreAnalysis/implicitRelation/types';
import {
  toAnalysisScope,
  validateAnalysisScope
} from '@/pages/exploreAnalysis/implicitRelation/services/scopeInstances';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { ensureSpatiotemporalDemoOntology } from '@/services/spatiotemporalOntologyBootstrap';
import {
  DEFAULT_ANALYSIS_PARAMS,
  SPATIOTEMPORAL_ANALYSIS_MODES,
  USAGE_SCENARIOS
} from '../constants';
import {
  applyUsageScenario,
  loadSpatiotemporalDataset,
  runSpatiotemporalAnalysis
} from '../services';
import type {
  JourneyStep,
  SpatiotemporalAnalysisMode,
  SpatiotemporalAnalysisParams,
  SpatiotemporalAnalysisResult,
  SpatiotemporalDataset,
  UsageScenario
} from '../types';
import { JourneyGoalView } from './JourneyGoalView';
import { JourneyRunningView } from './JourneyRunningView';
import { JourneyResultPanel } from './JourneyResultPanel';
import { ModeParamsPanel } from './ModeParamsPanel';
import styles from '../index.module.scss';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const buildCustomScenario = (
  mode: SpatiotemporalAnalysisMode
): UsageScenario => {
  const modeMeta = SPATIOTEMPORAL_ANALYSIS_MODES.find(
    (item) => item.key === mode
  );
  return {
    id: 'custom',
    goalQuestion: modeMeta?.usageHint || '自定义时空分析',
    title: modeMeta?.label || '自定义分析',
    description: modeMeta?.description || '',
    expectedOutcome: '基于所选范围与参数的分析结论',
    mode,
    tip: '',
    objectTypeCodes: [],
    nextSteps: USAGE_SCENARIOS.filter((item) => item.mode !== mode)
      .slice(0, 3)
      .map((item) => item.goalQuestion)
  };
};

export default function SpatiotemporalWorkspace() {
  const [journeyStep, setJourneyStep] = useState<JourneyStep>('goal');
  const [activeScenario, setActiveScenario] = useState<UsageScenario>();
  const [customMode, setCustomMode] =
    useState<SpatiotemporalAnalysisMode>('trajectory');
  const [analysisParams, setAnalysisParams] =
    useState<SpatiotemporalAnalysisParams>(DEFAULT_ANALYSIS_PARAMS);
  const [runStep, setRunStep] = useState(0);
  const [dataset, setDataset] = useState<SpatiotemporalDataset>();
  const [result, setResult] = useState<SpatiotemporalAnalysisResult>();

  const [scenesLoading, setScenesLoading] = useState(false);
  const [scenes, setScenes] = useState<Array<{ id: number; name: string }>>([]);
  const [scopeDraft, setScopeDraft] = useState<Partial<ImplicitAnalysisScope>>(
    {}
  );
  const [customAnalyzing, setCustomAnalyzing] = useState(false);

  const loadScenes = useCallback(async () => {
    setScenesLoading(true);
    try {
      const res = await listOntologyModel({
        pageNo: 1,
        pageSize: 100,
        order: 'desc',
        orderBy: 'create_time'
      });
      if (isOntologyApiSuccess(res) && res.data?.result) {
        setScenes(
          res.data.result
            .filter((item) => item.id != null)
            .map((item) => ({
              id: item.id!,
              name: item.name || `场景 #${item.id}`
            }))
        );
      }
    } catch {
      // ignore — demo journey does not depend on scene list
    } finally {
      setScenesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScenes();
    void ensureSpatiotemporalDemoOntology().catch(() => {
      // demo bootstrap optional on mount
    });
  }, [loadScenes]);

  const runJourney = async (scenario: UsageScenario) => {
    const applied = applyUsageScenario(scenario);
    setActiveScenario(scenario);
    setAnalysisParams(applied.params);
    setJourneyStep('running');
    setRunStep(0);
    setDataset(undefined);
    setResult(undefined);

    try {
      setRunStep(0);
      const demo = await ensureSpatiotemporalDemoOntology();
      await sleep(350);

      setRunStep(1);
      const selectedTypes = demo.objectTypes.filter((item) =>
        scenario.objectTypeCodes.includes(item.code)
      );
      if (!selectedTypes.length) {
        throw new Error('演示场景对象类型未就绪，请刷新页面重试');
      }

      const scope: ImplicitAnalysisScope = {
        ontologySceneId: demo.sceneId,
        ontologySceneName: demo.sceneName,
        objectTypes: selectedTypes.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code
        })),
        instanceMode: 'all',
        instances: []
      };

      const nextDataset = await loadSpatiotemporalDataset(scope);
      await sleep(300);

      setRunStep(2);
      const nextResult = runSpatiotemporalAnalysis(
        applied.mode,
        nextDataset,
        applied.params
      );

      setDataset(nextDataset);
      setResult(nextResult);
      setJourneyStep('result');
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '分析失败');
      setJourneyStep('goal');
    }
  };

  const handleCustomAnalyze = async () => {
    const scopeError = validateAnalysisScope(scopeDraft);
    if (scopeError) {
      Message.warning(scopeError);
      return;
    }
    const scope = toAnalysisScope(scopeDraft);
    if (!scope) {
      return;
    }

    setCustomAnalyzing(true);
    setActiveScenario(undefined);
    try {
      const nextDataset = await loadSpatiotemporalDataset(scope);
      const mode = activeScenario?.mode ?? customMode;
      const nextResult = runSpatiotemporalAnalysis(
        mode,
        nextDataset,
        analysisParams
      );
      setDataset(nextDataset);
      setResult(nextResult);
      setJourneyStep('result');
      Message.success('自定义范围分析完成');
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '分析失败');
    } finally {
      setCustomAnalyzing(false);
    }
  };

  const handleBackToGoal = () => {
    setJourneyStep('goal');
    setActiveScenario(undefined);
    setCustomMode('trajectory');
    setDataset(undefined);
    setResult(undefined);
  };

  const resultScenario =
    activeScenario || (result ? buildCustomScenario(result.mode) : undefined);

  if (journeyStep === 'running' && activeScenario) {
    return <JourneyRunningView scenario={activeScenario} runStep={runStep} />;
  }

  if (journeyStep === 'result' && resultScenario && result && dataset) {
    return (
      <div className={styles.spatiotemporalWorkspace}>
        <JourneyResultPanel
          scenario={resultScenario}
          result={result}
          dataset={dataset}
          params={analysisParams}
          onBack={handleBackToGoal}
          onRetry={() =>
            activeScenario
              ? void runJourney(activeScenario)
              : void handleCustomAnalyze()
          }
        />

        <Collapse bordered={false} className={styles.advancedCollapse}>
          <Collapse.Item header="高级：自定义范围与参数" name="advanced">
            <div className={styles.advancedPanel}>
              <AnalysisScopeFields
                scenes={scenes}
                scenesLoading={scenesLoading}
                value={scopeDraft}
                onChange={setScopeDraft}
              />
              {!activeScenario ? (
                <div className={styles.paramRow}>
                  <div className={styles.paramLabelWrap}>
                    <div className={styles.paramLabel}>分析类型</div>
                  </div>
                  <div className={styles.paramControl}>
                    <Select
                      value={customMode}
                      onChange={(value) =>
                        setCustomMode(value as SpatiotemporalAnalysisMode)
                      }
                      options={SPATIOTEMPORAL_ANALYSIS_MODES.map((item) => ({
                        label: item.label,
                        value: item.key
                      }))}
                      style={{ width: 220 }}
                    />
                  </div>
                </div>
              ) : null}
              <ModeParamsPanel
                mode={resultScenario.mode}
                params={analysisParams}
                dataset={dataset}
                onChange={setAnalysisParams}
              />
              <Button
                type="primary"
                loading={customAnalyzing}
                onClick={() => void handleCustomAnalyze()}
              >
                按自定义范围重新分析
              </Button>
            </div>
          </Collapse.Item>
        </Collapse>
      </div>
    );
  }

  return (
    <div className={styles.spatiotemporalWorkspace}>
      <JourneyGoalView
        scenarios={USAGE_SCENARIOS}
        activeScenarioId={activeScenario?.id}
        onSelect={(scenario) => void runJourney(scenario)}
      />

      <Collapse bordered={false} className={styles.advancedCollapse}>
        <Collapse.Item header="使用自有数据？展开自定义分析" name="custom">
          <div className={styles.advancedPanel}>
            <div className={styles.metricHint} style={{ marginBottom: 12 }}>
              选择任意本体场景与对象类型（需实例含经纬度 +
              时间字段）。开发环境可使用「海峡时空态势演示」场景。
            </div>
            <AnalysisScopeFields
              scenes={scenes}
              scenesLoading={scenesLoading}
              value={scopeDraft}
              onChange={setScopeDraft}
            />
            <div className={styles.paramRow}>
              <div className={styles.paramLabelWrap}>
                <div className={styles.paramLabel}>分析类型</div>
              </div>
              <div className={styles.paramControl}>
                <Select
                  value={customMode}
                  onChange={(value) =>
                    setCustomMode(value as SpatiotemporalAnalysisMode)
                  }
                  options={SPATIOTEMPORAL_ANALYSIS_MODES.map((item) => ({
                    label: item.label,
                    value: item.key
                  }))}
                  style={{ width: 220 }}
                />
              </div>
            </div>
            <ModeParamsPanel
              mode={customMode}
              params={analysisParams}
              onChange={setAnalysisParams}
            />
            <Button
              type="outline"
              loading={customAnalyzing}
              onClick={() => void handleCustomAnalyze()}
            >
              开始自定义分析
            </Button>
          </div>
        </Collapse.Item>
      </Collapse>
    </div>
  );
}
