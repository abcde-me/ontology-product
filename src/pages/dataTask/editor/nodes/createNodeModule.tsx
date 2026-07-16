import React, { useCallback } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch
} from '@arco-design/web-react';
import {
  ALL_BLOCKS_WITHOUT_END,
  ALL_BLOCKS_WITHOUT_START,
  useNodeDataUpdate
} from '@ceai-front/workflow';
import type { NodeDefault } from '@ceai-front/workflow';
import type { DataTaskNodeMeta } from '../../constants/nodeTypes';
import { DataSourceNode, DataSourcePanel } from './DataSource';
import { InferenceAgentNode, InferenceAgentPanel } from './InferenceAgent';
import { ObjectTypeNode, ObjectTypePanel } from './ObjectType';
import StartNode from './StartEnd/StartEndNode';
import NodeIoFields from './_shared/NodeIoFields';
import panelStyles from './_shared/NodePanel.module.scss';
import {
  collectUsedVarSelectors,
  replaceUsedVarSelectors
} from './_shared/nodeIoUtils';
import { DATA_TASK_SOURCE_TYPE } from '../../constants/dataSourceTypes';
import { DataTaskNodeType } from '../../types';
import { INSTANCE_SYNC_SOURCE_TYPE } from '@/pages/ontologyScene/common/constants';
import { hasAnySourceMapping } from '@/pages/ontologyScene/modules/objectType/components/ObjectTypeFormUtils/attributeFields';

type PanelProps = {
  id: string;
  data: Record<string, unknown>;
};

const renderSummary = (
  data: Record<string, unknown>,
  fields: string[] = []
) => {
  const summary = fields
    .map((field) => data[field])
    .filter((value) => value !== undefined && value !== '')
    .join(' / ');

  return summary || '待配置';
};

const createPanelFields = (meta: DataTaskNodeMeta) => {
  if (
    meta.type === DataTaskNodeType.DATA_SOURCE ||
    meta.type === DataTaskNodeType.INFERENCE_AGENT ||
    meta.type === DataTaskNodeType.ONTOLOGY ||
    meta.type === DataTaskNodeType.START
  ) {
    return null;
  }

  switch (meta.type) {
    case DataTaskNodeType.FILE_PARSE:
      return (
        <>
          <Form.Item label="解析模式" field="parseMode">
            <Select
              options={[
                { label: '自动识别', value: 'auto' },
                { label: '按模板解析', value: 'template' }
              ]}
            />
          </Form.Item>
          <Form.Item label="输出格式" field="outputFormat">
            <Select
              options={[
                { label: 'JSON', value: 'json' },
                { label: '表格', value: 'table' }
              ]}
            />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.VIDEO_FRAME:
      return (
        <>
          <Form.Item label="抽帧间隔(秒)" field="frameInterval">
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item label="最大帧数" field="maxFrames">
            <InputNumber min={1} max={1000} />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.OCR:
      return (
        <>
          <Form.Item label="识别语言" field="language">
            <Select
              options={[
                { label: '中文', value: 'zh' },
                { label: '英文', value: 'en' }
              ]}
            />
          </Form.Item>
          <Form.Item
            label="版面分析"
            field="enableLayout"
            triggerPropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.AUDIO_TEXT:
      return (
        <>
          <Form.Item label="识别语言" field="language">
            <Select
              options={[
                { label: '中文', value: 'zh' },
                { label: '英文', value: 'en' }
              ]}
            />
          </Form.Item>
          <Form.Item
            label="自动标点"
            field="enablePunctuation"
            triggerPropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.SQL:
      return (
        <>
          <Form.Item label="SQL脚本ID" field="scriptId">
            <Input placeholder="请选择或输入 SQL 脚本" />
          </Form.Item>
          <Form.Item label="脚本版本" field="scriptVersion">
            <Input placeholder="请输入脚本版本" />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.JSON_PARSE:
      return (
        <>
          <Form.Item label="JSON Path" field="jsonPath">
            <Input placeholder="例如 $.data.items[*].name" />
          </Form.Item>
          <Form.Item label="输出字段" field="outputField">
            <Input placeholder="请输入输出字段名" />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.LOGIC:
      return (
        <>
          <Form.Item label="判断条件" field="condition">
            <Input.TextArea placeholder="请输入条件表达式" autoSize />
          </Form.Item>
          <Form.Item label="True 分支" field="trueBranch">
            <Input placeholder="满足条件时的分支标识" />
          </Form.Item>
          <Form.Item label="False 分支" field="falseBranch">
            <Input placeholder="不满足条件时的分支标识" />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.SCRIPT:
      return (
        <>
          <Form.Item label="脚本类型" field="scriptType">
            <Select
              options={[
                { label: 'Python', value: 'python' },
                { label: 'JavaScript', value: 'javascript' }
              ]}
            />
          </Form.Item>
          <Form.Item label="脚本内容" field="scriptContent">
            <Input.TextArea
              placeholder="请输入自定义脚本"
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </Form.Item>
        </>
      );
    case DataTaskNodeType.DESENSITIZE:
      return (
        <Form.Item label="脱敏规则" field="rules">
          <Select
            mode="multiple"
            allowCreate
            placeholder="输入脱敏字段后回车"
          />
        </Form.Item>
      );
    default:
      return null;
  }
};

const resolveIoVisibility = (meta: DataTaskNodeMeta) => ({
  showInputs: meta.showTargetHandle,
  showOutputs: true
});

const withNodeIoFields = (
  PanelComp: React.ComponentType<PanelProps>,
  meta: DataTaskNodeMeta
) => {
  const { showInputs, showOutputs } = resolveIoVisibility(meta);

  return ({ id, data }: PanelProps) => (
    <>
      <PanelComp id={id} data={data} />
      <div className="px-[16px] pb-[12px]">
        <NodeIoFields
          id={id}
          data={data}
          showInputs={showInputs}
          showOutputs={showOutputs}
        />
      </div>
    </>
  );
};

const createGenericPanel = (meta: DataTaskNodeMeta) => {
  const fields = createPanelFields(meta);
  const isStart = meta.type === DataTaskNodeType.START;

  return ({ id, data }: PanelProps) => {
    const { handleNodeDataUpdate } = useNodeDataUpdate();
    const [form] = Form.useForm();
    const { showInputs, showOutputs } = resolveIoVisibility(meta);

    const handleValuesChange = useCallback(
      (_: unknown, values: Record<string, unknown>) => {
        handleNodeDataUpdate({
          id,
          data: {
            ...data,
            ...values
          }
        });
      },
      [data, handleNodeDataUpdate, id]
    );

    return (
      <div className="px-[16px] pb-[12px] pt-[8px]">
        {isStart ? (
          <div className={panelStyles['section-block']}>
            <div className={panelStyles['section-title']}>
              {meta.title}节点配置
            </div>
          </div>
        ) : null}
        {fields ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={data}
            onValuesChange={handleValuesChange}
          >
            {fields}
          </Form>
        ) : null}
        <NodeIoFields
          id={id}
          data={data}
          showInputs={showInputs}
          showOutputs={showOutputs}
        />
        {!isStart && (
          <div className={panelStyles['ai-assist-placeholder']}>
            <div className={panelStyles['ai-assist-title']}>AI 辅助</div>
            <div className={panelStyles['ai-assist-desc']}>
              后续将支持根据上游数据自动生成节点配置
            </div>
          </div>
        )}
      </div>
    );
  };
};

const resolveNodeComponent = (meta: DataTaskNodeMeta) => {
  if (meta.type === DataTaskNodeType.DATA_SOURCE) {
    return DataSourceNode;
  }
  if (meta.type === DataTaskNodeType.INFERENCE_AGENT) {
    return InferenceAgentNode;
  }
  if (meta.type === DataTaskNodeType.ONTOLOGY) {
    return ObjectTypeNode;
  }
  if (meta.type === DataTaskNodeType.START) {
    return ({ data }: { data: Record<string, unknown> }) => (
      <StartNode data={data} />
    );
  }
  return ({ data }: { data: Record<string, unknown> }) => (
    <div className="px-[16px] pb-[16px]">
      <div className="text-[12px] leading-[20px] text-[var(--color-text-3)]">
        {renderSummary(data, meta.summaryFields)}
      </div>
    </div>
  );
};

const resolvePanelComponent = (meta: DataTaskNodeMeta) => {
  if (meta.type === DataTaskNodeType.DATA_SOURCE) {
    return withNodeIoFields(DataSourcePanel, meta);
  }
  if (meta.type === DataTaskNodeType.INFERENCE_AGENT) {
    return withNodeIoFields(InferenceAgentPanel, meta);
  }
  if (meta.type === DataTaskNodeType.ONTOLOGY) {
    return withNodeIoFields(ObjectTypePanel, meta);
  }
  return createGenericPanel(meta);
};

export const createDataTaskNodeModule = (meta: DataTaskNodeMeta) => {
  const Node = resolveNodeComponent(meta);
  const Panel = resolvePanelComponent(meta);

  const nodeDefault: NodeDefault<Record<string, unknown>> = {
    defaultValue: {
      _isSingleRun: true,
      variables: [],
      outputs: [],
      ...meta.defaultConfig,
      type: meta.type,
      title: meta.title,
      desc: meta.description
    },
    getAvailablePrevNodes() {
      if (
        meta.type === DataTaskNodeType.START ||
        meta.classification === 'input'
      ) {
        return [];
      }
      return ALL_BLOCKS_WITHOUT_END();
    },
    getAvailableNextNodes() {
      return ALL_BLOCKS_WITHOUT_START();
    },
    getUsedVars(payload) {
      return collectUsedVarSelectors(payload?.variables);
    },
    updateUsedVars(payload, oldSelector, newSelector) {
      if (!payload || typeof payload !== 'object') {
        return;
      }
      payload.variables = replaceUsedVarSelectors(
        payload.variables,
        oldSelector,
        newSelector
      );
    },
    checkValid(payload) {
      if (meta.type === DataTaskNodeType.DATA_SOURCE) {
        const sourceType =
          payload?.sourceType ?? DATA_TASK_SOURCE_TYPE.DATABASE;
        if (sourceType === DATA_TASK_SOURCE_TYPE.DOCUMENT) {
          const isValid = Boolean(payload?.documentFilePath?.trim());
          return {
            isValid,
            errorMessage: isValid ? '' : '请上传文档文件'
          };
        }
        if (sourceType === DATA_TASK_SOURCE_TYPE.DATABASE) {
          const sourceDataInfo = payload?.sourceDataInfo;
          const isValid = Boolean(
            sourceDataInfo?.connectorId &&
              (sourceDataInfo?.tableName?.trim() || sourceDataInfo?.sql?.trim())
          );
          return {
            isValid,
            errorMessage: isValid ? '' : '请完善数据库连接与表配置'
          };
        }
        if (sourceType === DATA_TASK_SOURCE_TYPE.MESSAGE_QUEUE) {
          const isValid = Boolean(
            payload?.messageQueueConnectorId &&
              payload?.messageQueueTopic?.trim()
          );
          return {
            isValid,
            errorMessage: isValid ? '' : '请选择消息队列连接与 Topic'
          };
        }
        if (sourceType === DATA_TASK_SOURCE_TYPE.API) {
          const isValid = Boolean(payload?.apiConnectorId);
          return {
            isValid,
            errorMessage: isValid ? '' : '请选择 API 连接'
          };
        }
      }

      if (meta.type === DataTaskNodeType.INFERENCE_AGENT) {
        if (!payload?.ontologyModelID) {
          return {
            isValid: false,
            errorMessage: '请选择 AGENT'
          };
        }
        return {
          isValid: true,
          errorMessage: ''
        };
      }

      if (meta.type === DataTaskNodeType.ONTOLOGY) {
        if (!payload?.ontologyModelID) {
          return {
            isValid: false,
            errorMessage: '请选择本体场景库'
          };
        }
        if (!payload?.objectTypeId) {
          return {
            isValid: false,
            errorMessage: '请选择本体对象类型'
          };
        }
        if (!payload?.conflictStrategy) {
          return {
            isValid: false,
            errorMessage: '请选择冲突策略'
          };
        }
        if (!payload?.exceptionStrategy) {
          return {
            isValid: false,
            errorMessage: '请选择异常策略'
          };
        }

        const mappingFields = Array.isArray(payload?.syncMappingFields)
          ? payload.syncMappingFields
          : [];
        const mappingSourceTypes = [INSTANCE_SYNC_SOURCE_TYPE.WORKFLOW];
        const hasMappedField = mappingFields.some((field) =>
          hasAnySourceMapping(field, mappingSourceTypes)
        );
        const primaryMapped = mappingFields.some(
          (field) =>
            field.isPrimary === 1 &&
            hasAnySourceMapping(field, mappingSourceTypes)
        );

        if (!hasMappedField) {
          return {
            isValid: false,
            errorMessage: '实例同步映射至少需要一个有效映射'
          };
        }
        if (!primaryMapped) {
          return {
            isValid: false,
            errorMessage: '对象类型主键需要映射到数据来源字段'
          };
        }

        return {
          isValid: true,
          errorMessage: ''
        };
      }

      const hasTitle = Boolean(payload?.title);
      return {
        isValid: hasTitle,
        errorMessage: hasTitle ? '' : '请完善节点配置'
      };
    }
  };

  return {
    Node: React.memo(Node),
    Panel,
    nodeDefault
  };
};
