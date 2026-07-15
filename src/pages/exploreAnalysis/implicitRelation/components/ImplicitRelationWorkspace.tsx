import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Message,
  Space,
  Tag,
  Tooltip,
  Typography
} from '@arco-design/web-react';
import {
  IconPlus,
  IconPlayArrow,
  IconRefresh,
  IconExpand,
  IconShrink
} from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  DiscoveredImplicitRelation,
  ImplicitRelationKnowledge,
  ImplicitRelationTask
} from '../types';
import { buildDiscoveryGraph } from '../services/buildDiscoveryGraph';
import { runImplicitRelationDiscovery } from '../services/discoverImplicitRelations';
import { saveDiscoveryResult } from '../services/implicitRelationStore';
import { resolveSummaryItems } from '../services/summarizeDiscovery';
import ImplicitRelationCanvas from './ImplicitRelationCanvas';
import EvidenceDrawer from './EvidenceDrawer';
import AddToInstanceModal from './AddToInstanceModal';
import styles from './ImplicitRelationWorkspace.module.scss';

interface ImplicitRelationWorkspaceProps {
  task: ImplicitRelationTask;
  knowledge: ImplicitRelationKnowledge;
  onKnowledgeChange: (knowledge: ImplicitRelationKnowledge) => void;
}

export default function ImplicitRelationWorkspace({
  task,
  knowledge,
  onKnowledgeChange
}: ImplicitRelationWorkspaceProps) {
  const [running, setRunning] = useState(false);
  const [selectedDiscoveryId, setSelectedDiscoveryId] = useState<string>();
  const [checkedDiscoveryIds, setCheckedDiscoveryIds] = useState<string[]>([]);
  const [evidenceVisible, setEvidenceVisible] = useState(false);
  const [addToInstanceVisible, setAddToInstanceVisible] = useState(false);
  const [graphRevision, setGraphRevision] = useState(0);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasFullscreen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCanvasFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canvasFullscreen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => window.clearTimeout(timer);
  }, [canvasFullscreen]);

  const graph = useMemo(
    () =>
      buildDiscoveryGraph(knowledge.result, {
        highlightDiscoveryId: selectedDiscoveryId
      }),
    [knowledge.result, selectedDiscoveryId]
  );

  useEffect(() => {
    if (knowledge.result) {
      setGraphRevision((revision) => revision + 1);
    }
  }, [knowledge.result?.ranAt]);

  const selectedDiscovery = useMemo(
    () =>
      knowledge.result?.discoveries.find(
        (item) => item.id === selectedDiscoveryId
      ) ?? null,
    [knowledge.result?.discoveries, selectedDiscoveryId]
  );

  const runDiscovery = useCallback(async () => {
    if (!task.scope?.ontologySceneId || !task.scope.objectTypes.length) {
      Message.warning('请先配置本体图谱与对象类型');
      return;
    }
    if (
      task.scope.instanceMode === 'selected' &&
      !task.scope.instances.length
    ) {
      Message.warning('请选择至少一个实例');
      return;
    }

    setRunning(true);
    try {
      const result = await runImplicitRelationDiscovery({
        scope: task.scope,
        algorithm: task.algorithm
      });
      saveDiscoveryResult(task.id, result);
      onKnowledgeChange({ result });
      setSelectedDiscoveryId(undefined);
      setCheckedDiscoveryIds([]);
      setEvidenceVisible(false);
      Message.success(
        `发现完成：节点 ${result.nodes?.length ?? 0}，显性关系 ${result.confirmedEdges.length} 条，隐性关系 ${result.discoveries.length} 条`
      );
      if (
        (result.nodes?.length ?? 0) > 0 &&
        result.confirmedEdges.length === 0 &&
        result.discoveries.length === 0
      ) {
        Message.warning(
          '未从本体图谱解析到实例关系。请确认所选对象类型在本体中配置了链接，且链接/实例数据已同步'
        );
      }
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '发现失败');
    } finally {
      setRunning(false);
    }
  }, [onKnowledgeChange, task.algorithm, task.id, task.scope]);

  const handleSelectDiscovery = (discoveryId: string | null) => {
    if (!discoveryId) {
      setSelectedDiscoveryId(undefined);
      setEvidenceVisible(false);
      return;
    }
    setSelectedDiscoveryId(discoveryId);
    setEvidenceVisible(true);
  };

  const handleListClick = (item: DiscoveredImplicitRelation) => {
    setSelectedDiscoveryId(item.id);
    setEvidenceVisible(true);
  };

  const result = knowledge.result;

  const handleToggleCheck = (
    discoveryId: string,
    checked: boolean,
    event: Event
  ) => {
    event.stopPropagation();
    setCheckedDiscoveryIds((prev) => {
      if (checked) {
        return prev.includes(discoveryId) ? prev : [...prev, discoveryId];
      }
      return prev.filter((id) => id !== discoveryId);
    });
  };

  const allDiscoveryIds = result?.discoveries.map((item) => item.id) || [];
  const allChecked =
    allDiscoveryIds.length > 0 &&
    allDiscoveryIds.every((id) => checkedDiscoveryIds.includes(id));
  const indeterminate =
    checkedDiscoveryIds.length > 0 &&
    checkedDiscoveryIds.length < allDiscoveryIds.length;

  const checkedDiscoveries = useMemo(
    () =>
      (result?.discoveries || []).filter((item) =>
        checkedDiscoveryIds.includes(item.id)
      ),
    [checkedDiscoveryIds, result?.discoveries]
  );

  const handleOpenAddToInstance = () => {
    if (!checkedDiscoveries.length) {
      Message.warning('请先勾选要添加的关系');
      return;
    }
    setAddToInstanceVisible(true);
  };

  return (
    <div className={styles.workspace}>
      <div className={styles.toolbar}>
        <div className={styles.sectionTitle}>关系发现</div>
        <Button
          type="primary"
          icon={result ? <IconRefresh /> : <IconPlayArrow />}
          loading={running}
          onClick={() => void runDiscovery()}
        >
          {result ? '重新执行' : '执行发现'}
        </Button>
      </div>

      <div className={styles.main}>
        <div
          className={`${styles.canvasPane} ${
            canvasFullscreen ? styles.canvasPaneFullscreen : ''
          }`}
        >
          <div className={styles.canvasHeader}>
            <div className={styles.canvasTitleRow}>
              <div className={styles.canvasTitle}>关系图谱</div>
              {result?.ranAt ? (
                <span className={styles.canvasMeta}>
                  发现时间 {dayjs(result.ranAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              ) : null}
            </div>
            <div className={styles.canvasHeaderRight}>
              {result ? (
                <span className={styles.canvasMeta}>
                  最近发现 节点 {result.nodes?.length ?? graph.nodes.length} /
                  显性 {result.confirmedEdges.length} / 隐性{' '}
                  {result.discoveries.length}
                </span>
              ) : null}
              <div className={styles.legend}>
                <span className={styles.legendSolid} />
                显性关系
                <span className={styles.legendDash} />
                隐性关系
              </div>
              <Tooltip content={canvasFullscreen ? '退出全屏' : '全屏'}>
                <Button
                  type="text"
                  size="small"
                  className={styles.fullscreenBtn}
                  icon={canvasFullscreen ? <IconShrink /> : <IconExpand />}
                  onClick={() => setCanvasFullscreen((prev) => !prev)}
                />
              </Tooltip>
            </div>
          </div>
          <div className={styles.canvasBody}>
            <ImplicitRelationCanvas
              loading={running}
              nodes={graph.nodes}
              edges={graph.edges}
              graphRevision={graphRevision}
              selectedDiscoveryId={selectedDiscoveryId}
              onSelectDiscovery={handleSelectDiscovery}
            />
          </div>
        </div>

        <div className={styles.sidePane}>
          <div className={styles.summaryCard}>
            <div className={styles.sideTitle}>
              发现总结
              {result ? (
                <Tag
                  size="small"
                  color={result.summarySource === 'llm' ? 'arcoblue' : 'gray'}
                >
                  {result.summarySource === 'llm' ? '大模型' : '本地'}
                </Tag>
              ) : null}
            </div>
            <div className={styles.summaryBody}>
              {result ? (
                <>
                  <ul className={styles.summaryList}>
                    {resolveSummaryItems(result).map((item, index) => (
                      <li
                        key={`${index}-${item.slice(0, 12)}`}
                        className={styles.summaryItem}
                      >
                        <span className={styles.summaryIndex}>{index + 1}</span>
                        <span className={styles.summaryItemText}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.statRow}>
                    <span>
                      算法：{DISCOVERY_ALGORITHM_LABEL[result.algorithm]}
                    </span>
                    <span>
                      节点 {result.nodes?.length ?? graph.nodes.length}
                    </span>
                    <span>显性 {result.confirmedEdges.length}</span>
                    <span>隐性 {result.discoveries.length}</span>
                  </div>
                </>
              ) : (
                <Typography.Paragraph className={styles.summaryText}>
                  完善配置后点击「执行发现」，完成后将在此分条展示总结要点。
                </Typography.Paragraph>
              )}
            </div>
          </div>

          <div className={styles.listCard}>
            <div className={styles.sideTitle}>
              <span>发现的关系</span>
              <Space size={8}>
                {result && result.discoveries.length > 0 ? (
                  <Checkbox
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onChange={(checked) => {
                      setCheckedDiscoveryIds(
                        checked ? result.discoveries.map((item) => item.id) : []
                      );
                    }}
                  >
                    全选
                  </Checkbox>
                ) : null}
                <Button
                  type="text"
                  size="mini"
                  icon={<IconPlus />}
                  disabled={!checkedDiscoveries.length}
                  onClick={handleOpenAddToInstance}
                >
                  添加到实例
                </Button>
              </Space>
            </div>
            <div className={styles.discoveryList}>
              {result?.discoveries.length ? (
                result.discoveries.map((item) => (
                  <div
                    key={item.id}
                    className={[
                      styles.discoveryItem,
                      selectedDiscoveryId === item.id
                        ? styles.discoveryItemActive
                        : '',
                      checkedDiscoveryIds.includes(item.id)
                        ? styles.discoveryItemChecked
                        : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleListClick(item)}
                  >
                    <div className={styles.discoveryItemHeader}>
                      <Checkbox
                        checked={checkedDiscoveryIds.includes(item.id)}
                        onChange={(checked, event) =>
                          handleToggleCheck(item.id, checked, event)
                        }
                      />
                      <div className={styles.discoveryPair}>
                        {item.sourceNodeName}
                        <span className={styles.discoveryArrow}>→</span>
                        {item.targetNodeName}
                      </div>
                    </div>
                    <div className={styles.discoveryMeta}>
                      <span>{item.suggestedName}</span>
                      <span>置信度 {(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyList}>
                  {running ? '正在挖掘关系...' : '暂无发现结果'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EvidenceDrawer
        visible={evidenceVisible}
        discovery={selectedDiscovery}
        onClose={() => setEvidenceVisible(false)}
      />
      <AddToInstanceModal
        visible={addToInstanceVisible}
        task={task}
        discoveries={checkedDiscoveries}
        onCancel={() => setAddToInstanceVisible(false)}
        onSuccess={() => {
          setAddToInstanceVisible(false);
          setCheckedDiscoveryIds([]);
        }}
      />
    </div>
  );
}
