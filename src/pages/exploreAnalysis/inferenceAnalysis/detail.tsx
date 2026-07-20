import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Empty,
  Message,
  Table,
  Tag
} from '@arco-design/web-react';
import { IconLeft, IconRight } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import dayjs from 'dayjs';
import { useHistory, useParams } from 'react-router-dom';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { listDomainAxioms } from '@/pages/knowledgeManagement/domainAxiom/services/axiomStorage';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import SemanticMappingsPreviewModal from './components/SemanticMappingsPreviewModal';
import InferenceResultContent from './components/InferenceResultContent';
import {
  INFERENCE_NODE_TYPE_COLOR,
  INFERENCE_NODE_TYPE_LABEL,
  INFERENCE_STATUS_COLOR,
  INFERENCE_STATUS_LABEL,
  resolveInferenceTypeLabel
} from './constants';
import type { InferenceAnalysisTask, InferenceRelatedNode } from './types';
import { getInferenceAnalysisTask } from './services/taskStorage';
import { formatNameList } from './utils';
import styles from './index.module.scss';

const LIST_PATH = '/tenant/compute/onto/exploreAnalysis/inferenceAnalysis';

export default function InferenceAnalysisDetail() {
  const history = useHistory();
  const { id = '' } = useParams<{ id: string }>();
  const [task, setTask] = useState<InferenceAnalysisTask | null>(null);
  const [sceneNames, setSceneNames] = useState<string[]>([]);
  const [semanticMappingCount, setSemanticMappingCount] = useState(0);
  const [domainAxiomNames, setDomainAxiomNames] = useState<string[]>([]);
  const [semanticMappingModalVisible, setSemanticMappingModalVisible] =
    useState(false);

  const loadTask = useCallback(() => {
    const detail = getInferenceAnalysisTask(id);
    if (!detail) {
      Message.error('推理分析任务不存在');
      history.replace(LIST_PATH);
      return null;
    }
    setTask(detail);
    return detail;
  }, [history, id]);

  useEffect(() => {
    const detail = loadTask();
    if (!detail) {
      return;
    }

    const mappingIds = detail.semanticMappingIds || [];
    setSemanticMappingCount(mappingIds.length);

    const axiomNameMap: Record<string, string> = {};
    listDomainAxioms().forEach((item) => {
      axiomNameMap[item.id] = item.name;
    });
    setDomainAxiomNames(
      (detail.domainAxiomIds || []).map(
        (axiomId) => axiomNameMap[axiomId] || axiomId
      )
    );

    if (!detail.ontologySceneIds?.length) {
      setSceneNames([]);
      return;
    }

    listOntologyModel({
      pageNo: 1,
      pageSize: 100,
      order: 'desc',
      orderBy: 'create_time'
    })
      .then((res) => {
        if (isOntologyApiSuccess(res) && res.data?.result) {
          const nameMap: Record<number, string> = {};
          res.data.result.forEach((item) => {
            if (item.id != null) {
              nameMap[item.id] = item.name || `场景 #${item.id}`;
            }
          });
          setSceneNames(
            detail.ontologySceneIds.map(
              (sceneId) => nameMap[sceneId] || `场景 #${sceneId}`
            )
          );
          return;
        }
        setSceneNames(
          detail.ontologySceneIds.map((sceneId) => `场景 #${sceneId}`)
        );
      })
      .catch(() => {
        setSceneNames(
          detail.ontologySceneIds.map((sceneId) => `场景 #${sceneId}`)
        );
      });
  }, [loadTask]);

  const taskDescriptionData = useMemo(() => {
    if (!task) {
      return [];
    }
    return [
      {
        label: '推理任务名称',
        value: task.name
      },
      {
        label: '推理类型',
        value: resolveInferenceTypeLabel(task.inferenceType)
      },
      {
        label: '任务状态',
        value: (
          <Tag color={INFERENCE_STATUS_COLOR[task.status]}>
            {INFERENCE_STATUS_LABEL[task.status]}
          </Tag>
        )
      },
      {
        label: '本体场景',
        value: formatNameList(sceneNames)
      },
      {
        label: '语义映射',
        value: semanticMappingCount ? (
          <Button
            type="text"
            size="small"
            className="p-0"
            onClick={() => setSemanticMappingModalVisible(true)}
          >
            查看（{semanticMappingCount}）
          </Button>
        ) : (
          '-'
        )
      },
      {
        label: '领域公理',
        value: formatNameList(domainAxiomNames)
      },
      {
        label: '创建人',
        value: task.creator || '-'
      },
      {
        label: '创建时间',
        value: dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        label: '任务描述',
        value: (
          <span className={styles.detailTableMultiline}>
            {task.description || '暂无描述'}
          </span>
        ),
        span: 2
      }
    ];
  }, [domainAxiomNames, sceneNames, semanticMappingCount, task]);

  const relatedNodeColumns: ColumnProps<InferenceRelatedNode>[] = useMemo(
    () => [
      {
        title: '节点名称',
        dataIndex: 'name',
        width: 160,
        ellipsis: true
      },
      {
        title: '节点类型',
        dataIndex: 'nodeType',
        width: 120,
        render: (value: InferenceRelatedNode['nodeType']) => (
          <Tag color={INFERENCE_NODE_TYPE_COLOR[value] || 'gray'}>
            {INFERENCE_NODE_TYPE_LABEL[value] || value}
          </Tag>
        )
      },
      {
        title: '路径角色',
        dataIndex: 'role',
        width: 120,
        ellipsis: true
      },
      {
        title: '节点结论',
        dataIndex: 'conclusion',
        ellipsis: true,
        render: (value?: string) => (
          <span className={styles.detailTableMultiline}>{value || '-'}</span>
        )
      },
      {
        title: '支撑证据',
        dataIndex: 'evidence',
        width: 220,
        ellipsis: true,
        render: (value?: string) => value || '-'
      }
    ],
    []
  );

  if (!task) {
    return null;
  }

  const inferencePath = task.inferencePath || [];
  const relatedNodes = task.relatedNodes || [];

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderWrap}>
        <div className={styles.detailHeaderCard}>
          <div className={styles.detailHeaderMain}>
            <div className={styles.detailTitle}>{task.name}</div>
            <div className={styles.detailMeta}>
              {task.description || '暂无描述'}
            </div>
          </div>
          <div className={styles.detailHeaderActions}>
            <Button
              type="outline"
              size="small"
              icon={<IconLeft />}
              className={styles.detailBackBtn}
              onClick={() => history.push(LIST_PATH)}
            >
              返回列表
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.detailSectionTitle}>推理任务描述</div>
        <Descriptions
          className={styles.detailDescriptions}
          column={2}
          border
          tableLayoutFixed
          labelStyle={{ width: 120 }}
          data={taskDescriptionData}
        />

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>推理结果内容</div>
          <InferenceResultContent content={task.resultContent} />
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>推理路径</div>
          {inferencePath.length ? (
            <div className={styles.pathList}>
              {inferencePath.map((step, index) => (
                <div key={step.id} className={styles.pathStep}>
                  <div className={styles.pathStepIndex}>{step.order}</div>
                  <div className={styles.pathStepBody}>
                    <div className={styles.pathStepTitle}>{step.title}</div>
                    {(step.fromNode || step.toNode) && (
                      <div className={styles.pathStepFlow}>
                        <span className={styles.pathNode}>
                          {step.fromNode || '-'}
                        </span>
                        <IconRight className={styles.pathArrow} />
                        <span className={styles.pathNode}>
                          {step.toNode || '-'}
                        </span>
                        {step.relation ? (
                          <Tag size="small" color="arcoblue">
                            {step.relation}
                          </Tag>
                        ) : null}
                      </div>
                    )}
                    {step.description ? (
                      <div className={styles.pathStepDesc}>
                        {step.description}
                      </div>
                    ) : null}
                  </div>
                  {index < inferencePath.length - 1 ? (
                    <div className={styles.pathConnector} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <Empty description="暂无推理路径" />
          )}
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>关联节点结论</div>
          {relatedNodes.length ? (
            <Table
              rowKey="id"
              columns={relatedNodeColumns}
              data={relatedNodes}
              pagination={false}
              border
              scroll={{ x: 900 }}
            />
          ) : (
            <Empty description="暂无关联节点结论" />
          )}
        </div>
      </div>

      <SemanticMappingsPreviewModal
        visible={semanticMappingModalVisible}
        mappingIds={task.semanticMappingIds}
        taskName={task.name}
        onCancel={() => setSemanticMappingModalVisible(false)}
      />
    </div>
  );
}
