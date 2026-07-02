import React, { useCallback, useEffect, useState } from 'react';
import { Button, Message } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import { useHistory, useParams } from 'react-router-dom';
import ResizableLayout from '@/pages/aiOntologyWorkbench/components/ResizableLayout';
import ScenarioRulePanel from './components/ScenarioRulePanel';
import ScenarioAssistant from './components/ScenarioAssistant';
import ScenarioGraphSection from './components/ScenarioGraphSection';
import WorkspaceLeftPanel from './components/WorkspaceLeftPanel';
import type { ApplicationScenario, ApplicationScenarioRule } from './types';
import {
  getApplicationScenario,
  listApplicationScenarioRules,
  updateApplicationScenario
} from './services/storage';
import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/sceneCenter/applicationScene';

export default function ApplicationSceneDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const [scenario, setScenario] = useState<ApplicationScenario | null>(null);
  const [rules, setRules] = useState<ApplicationScenarioRule[]>([]);

  const loadDetail = useCallback(() => {
    const detail = getApplicationScenario(id);
    if (!detail) {
      Message.error('应用场景不存在');
      history.replace(LIST_PATH);
      return;
    }

    setScenario(detail);
    setRules(listApplicationScenarioRules(id));
  }, [history, id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleGraphChange = (sceneId?: number) => {
    if (!scenario) {
      return;
    }

    const next = updateApplicationScenario(scenario.id, {
      ontologySceneId: sceneId
    });
    setScenario(next);
    Message.success(sceneId ? '图谱已关联' : '已取消图谱关联');
  };

  const refreshRules = () => {
    setRules(listApplicationScenarioRules(id));
    const detail = getApplicationScenario(id);
    if (detail) {
      setScenario(detail);
    }
  };

  if (!scenario) {
    return null;
  }

  return (
    <div className={styles['detail-page']}>
      <div className={styles['detail-header-wrap']}>
        <div className={styles['detail-header-card']}>
          <div className={styles['detail-header-main']}>
            <div className={styles['detail-title']}>{scenario.name}</div>
            <div className={styles['detail-meta']}>
              {scenario.description || '暂无描述'}
            </div>
          </div>
          <Button
            type="text"
            size="small"
            icon={<IconLeft />}
            className={styles['detail-back-btn']}
            onClick={() => history.push(LIST_PATH)}
          >
            返回列表
          </Button>
        </div>
      </div>

      <div className={styles['detail-workspace']}>
        <ResizableLayout
          defaultLeftWidth={680}
          minLeftWidth={480}
          maxLeftWidth={1200}
          rightWidthScale={0.5625}
          leftContent={
            <WorkspaceLeftPanel
              graph={
                <ScenarioGraphSection
                  sceneId={scenario.ontologySceneId}
                  onSceneChange={handleGraphChange}
                />
              }
              rules={
                <ScenarioRulePanel
                  scenarioId={scenario.id}
                  rules={rules}
                  onChange={refreshRules}
                />
              }
            />
          }
          rightContent={
            <ScenarioAssistant
              scenarioId={scenario.id}
              ontologySceneId={scenario.ontologySceneId}
              rules={rules}
              onRulesChange={refreshRules}
            />
          }
        />
      </div>
    </div>
  );
}
