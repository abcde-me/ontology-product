import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Message,
  Spin,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import { IconExpand, IconShrink } from '@arco-design/web-react/icon';
import type { InstanceQueryRow } from '../types';
import {
  getInstanceDisplayFields,
  resolveInstanceId
} from '../utils/instanceRow';
import {
  getInstanceNameFieldNames,
  resolveInstanceDisplayName
} from '../utils/instanceDisplayName';
import { buildInstanceOntologyGraphData } from '../utils/buildInstanceOntologyGraph';
import type { FieldCommentMap } from '../utils/fieldDisplayLabel';
import {
  listAttachedRelationsForInstance,
  removeAttachedRelation,
  type AttachedImplicitRelation
} from '@/pages/exploreAnalysis/implicitRelation/services/attachedRelationStore';
import { buildInstanceRelationGraph } from '@/pages/exploreAnalysis/implicitRelation/services/buildInstanceGraph';
import { buildInstanceNodeKey } from '@/pages/exploreAnalysis/implicitRelation/services/scopeInstances';
import type {
  RelationGraphEdge,
  RelationGraphNode
} from '@/pages/exploreAnalysis/relationInsight/types';
import { InstanceOntologyGraph } from './InstanceOntologyGraph';
import { InstanceImplicitRelationList } from './InstanceImplicitRelationList';
import styles from './InstanceDetailDrawer.module.scss';

interface InstanceDetailDrawerProps {
  visible: boolean;
  record: InstanceQueryRow | null;
  sceneId?: number;
  objectTypeId?: number;
  fieldCommentMap?: FieldCommentMap;
  vectorFieldNames?: Set<string>;
  instanceNameFieldNames?: string[];
  onClose: () => void;
}

export const InstanceDetailDrawer: React.FC<InstanceDetailDrawerProps> = ({
  visible,
  record,
  sceneId,
  objectTypeId,
  fieldCommentMap,
  vectorFieldNames,
  instanceNameFieldNames,
  onClose
}) => {
  const [attachedRelations, setAttachedRelations] = useState<
    AttachedImplicitRelation[]
  >([]);
  const [ontologyNodes, setOntologyNodes] = useState<RelationGraphNode[]>([]);
  const [ontologyEdges, setOntologyEdges] = useState<RelationGraphEdge[]>([]);
  const [ontologyGraphRevision, setOntologyGraphRevision] = useState(0);
  const [ontologyLoading, setOntologyLoading] = useState(false);
  const [graphFullscreen, setGraphFullscreen] = useState(false);
  const [graphLayoutKey, setGraphLayoutKey] = useState(0);
  const [implicitListFullscreen, setImplicitListFullscreen] = useState(false);

  const instanceId = record ? resolveInstanceId(record) : undefined;

  const instanceDisplayLabel = useMemo(() => {
    if (!record || instanceId == null || instanceId === '') {
      return '';
    }

    return resolveInstanceDisplayName(
      record,
      instanceNameFieldNames || [],
      String(instanceId)
    );
  }, [instanceId, instanceNameFieldNames, record]);

  const fields = useMemo(
    () =>
      record
        ? getInstanceDisplayFields(record, fieldCommentMap, vectorFieldNames)
        : [],
    [fieldCommentMap, record, vectorFieldNames]
  );

  const reloadAttached = () => {
    if (
      !visible ||
      sceneId == null ||
      objectTypeId == null ||
      instanceId == null ||
      instanceId === ''
    ) {
      setAttachedRelations([]);
      return;
    }
    setAttachedRelations(
      listAttachedRelationsForInstance({
        sceneId,
        objectTypeId,
        instanceId: String(instanceId)
      })
    );
  };

  useEffect(() => {
    reloadAttached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, sceneId, objectTypeId, instanceId]);

  useEffect(() => {
    if (
      !visible ||
      sceneId == null ||
      objectTypeId == null ||
      instanceId == null ||
      instanceId === '' ||
      !record
    ) {
      setOntologyNodes([]);
      setOntologyEdges([]);
      setOntologyGraphRevision(0);
      return;
    }

    let cancelled = false;
    const normalizedInstanceId = String(instanceId);

    const loadOntologyGraph = async () => {
      setOntologyLoading(true);
      try {
        const fieldNames =
          instanceNameFieldNames ??
          (await getInstanceNameFieldNames(sceneId, objectTypeId));
        const label = resolveInstanceDisplayName(
          record,
          fieldNames,
          normalizedInstanceId
        );

        if (cancelled) {
          return;
        }

        const graph = await buildInstanceRelationGraph({
          sceneId,
          instances: [
            {
              objectTypeId,
              instanceId: normalizedInstanceId,
              instanceLabel: label
            }
          ]
        });

        if (cancelled) {
          return;
        }

        const currentKey = buildInstanceNodeKey(
          objectTypeId,
          normalizedInstanceId
        );
        const graphData = buildInstanceOntologyGraphData(graph, currentKey);

        setOntologyNodes(graphData.nodes);
        setOntologyEdges(graphData.edges);
        setOntologyGraphRevision((revision) => revision + 1);
      } catch {
        if (!cancelled) {
          setOntologyNodes([]);
          setOntologyEdges([]);
          setOntologyGraphRevision(0);
        }
      } finally {
        if (!cancelled) {
          setOntologyLoading(false);
        }
      }
    };

    void loadOntologyGraph();

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    sceneId,
    objectTypeId,
    instanceId,
    record,
    instanceNameFieldNames
  ]);

  const handleRemove = (attachId: string) => {
    removeAttachedRelation(attachId);
    Message.success('已移除隐性关系');
    reloadAttached();
  };

  const exitGraphFullscreen = useCallback(() => {
    setGraphFullscreen(false);
    setGraphLayoutKey((key) => key + 1);
  }, []);

  const exitImplicitListFullscreen = useCallback(() => {
    setImplicitListFullscreen(false);
  }, []);

  const toggleGraphFullscreen = useCallback(() => {
    setGraphFullscreen((prev) => !prev);
    setGraphLayoutKey((key) => key + 1);
  }, []);

  const toggleImplicitListFullscreen = useCallback(() => {
    setImplicitListFullscreen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!visible) {
      setGraphFullscreen(false);
      setImplicitListFullscreen(false);
    }
  }, [visible]);

  useEffect(() => {
    const isFullscreenActive = graphFullscreen || implicitListFullscreen;
    if (!isFullscreenActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (implicitListFullscreen) {
          exitImplicitListFullscreen();
          return;
        }
        if (graphFullscreen) {
          exitGraphFullscreen();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    exitGraphFullscreen,
    exitImplicitListFullscreen,
    graphFullscreen,
    implicitListFullscreen
  ]);

  const hasOntologyGraph = ontologyEdges.length > 0;

  const renderGraph = (variant: 'embedded' | 'fullscreen') =>
    hasOntologyGraph && !ontologyLoading ? (
      <InstanceOntologyGraph
        key={`${objectTypeId}-${instanceId}-${ontologyGraphRevision}-${variant}`}
        nodes={ontologyNodes}
        edges={ontologyEdges}
        graphRevision={ontologyGraphRevision}
        layoutKey={graphLayoutKey}
        variant={variant}
      />
    ) : null;

  const fullscreenLayer =
    graphFullscreen && hasOntologyGraph && !ontologyLoading
      ? createPortal(
          <div className={styles.graphFullscreenLayer}>
            <div className={styles.graphFullscreenToolbar}>
              <div className={styles.graphFullscreenTitleWrap}>
                <span className={styles.graphFullscreenTitle}>实例图谱</span>
                {instanceDisplayLabel ? (
                  <span className={styles.graphFullscreenSubtitle}>
                    {instanceDisplayLabel}
                  </span>
                ) : null}
              </div>
              <Button
                type="text"
                size="small"
                className={styles.graphFullscreenExitBtn}
                icon={<IconShrink />}
                onClick={exitGraphFullscreen}
              >
                退出全屏
              </Button>
            </div>
            <div className={styles.graphFullscreenBody}>
              {renderGraph('fullscreen')}
            </div>
          </div>,
          document.body
        )
      : null;

  const implicitListFullscreenLayer =
    implicitListFullscreen && attachedRelations.length > 0
      ? createPortal(
          <div className={styles.graphFullscreenLayer}>
            <div className={styles.graphFullscreenToolbar}>
              <div className={styles.graphFullscreenTitleWrap}>
                <span className={styles.graphFullscreenTitle}>
                  隐性关系列表
                </span>
                {instanceDisplayLabel ? (
                  <span className={styles.graphFullscreenSubtitle}>
                    {instanceDisplayLabel}
                  </span>
                ) : null}
              </div>
              <Button
                type="text"
                size="small"
                className={styles.graphFullscreenExitBtn}
                icon={<IconShrink />}
                onClick={exitImplicitListFullscreen}
              >
                退出全屏
              </Button>
            </div>
            <div className={styles.implicitListFullscreenBody}>
              <InstanceImplicitRelationList
                data={attachedRelations}
                variant="fullscreen"
                onRemove={handleRemove}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <Drawer
        width={560}
        title="实例明细"
        visible={visible}
        onCancel={onClose}
        footer={null}
      >
        {fields.length > 0 ? (
          <Descriptions
            column={1}
            border
            data={fields.map((item) => ({
              label: item.label,
              value: item.value
            }))}
          />
        ) : (
          <div>暂无明细数据</div>
        )}

        <div className={styles.relationSection}>
          <div className={styles.relationTitle}>
            <div className={styles.relationTitleMain}>
              实例图谱
              <Tag size="small" color="arcoblue">
                {ontologyEdges.length}
              </Tag>
            </div>
            {hasOntologyGraph && !ontologyLoading ? (
              <Tooltip content={graphFullscreen ? '退出全屏' : '全屏'}>
                <Button
                  type="text"
                  size="mini"
                  className={styles.graphFullscreenBtn}
                  icon={graphFullscreen ? <IconShrink /> : <IconExpand />}
                  onClick={toggleGraphFullscreen}
                />
              </Tooltip>
            ) : null}
          </div>
          <div className={styles.graphWrap}>
            {ontologyLoading ? (
              <div className={styles.graphLoading}>
                <Spin />
              </div>
            ) : null}
            {!hasOntologyGraph && !ontologyLoading ? (
              <Empty description="暂无实例图谱关系（请确认该实例在本体图谱中已建立链接）" />
            ) : !graphFullscreen ? (
              renderGraph('embedded')
            ) : (
              <div className={styles.graphFullscreenPlaceholder} />
            )}
          </div>
        </div>

        <div className={styles.relationSection}>
          <div className={styles.relationTitle}>
            <div className={styles.relationTitleMain}>
              隐性关系列表
              <Tag size="small" color="orangered">
                {attachedRelations.length}
              </Tag>
            </div>
            {attachedRelations.length > 0 ? (
              <Tooltip content={implicitListFullscreen ? '退出全屏' : '全屏'}>
                <Button
                  type="text"
                  size="mini"
                  className={styles.graphFullscreenBtn}
                  icon={
                    implicitListFullscreen ? <IconShrink /> : <IconExpand />
                  }
                  onClick={toggleImplicitListFullscreen}
                />
              </Tooltip>
            ) : null}
          </div>
          {attachedRelations.length === 0 ? (
            <Empty description="暂无挂接的隐性关系（可在关系挖掘中勾选后「添加到实例」）" />
          ) : !implicitListFullscreen ? (
            <InstanceImplicitRelationList
              data={attachedRelations}
              variant="embedded"
              onRemove={handleRemove}
            />
          ) : (
            <div className={styles.graphFullscreenPlaceholder} />
          )}
        </div>
      </Drawer>
      {fullscreenLayer}
      {implicitListFullscreenLayer}
    </>
  );
};
