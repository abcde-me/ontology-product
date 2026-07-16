import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Message, Select, Typography } from '@arco-design/web-react';
import { useNodeDataUpdate } from '@ceai-front/workflow';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { InferenceAgentNodeConfig } from '@/pages/dataTask/types';
import type { OntologScene } from '@/types/ontologySceneApi';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import styles from './InferenceAgentPanel.module.scss';

const { Text } = Typography;

const normalizeNodeData = (
  data: Record<string, unknown>
): InferenceAgentNodeConfig => ({
  ontologyModelID:
    typeof data.ontologyModelID === 'number' ? data.ontologyModelID : undefined,
  ontologyModelName: String(data.ontologyModelName ?? ''),
  agentAppId: String(data.agentAppId ?? ''),
  agentName: String(data.agentName ?? ''),
  triggerMode: 'on_data_update'
});

interface InferenceAgentPanelProps {
  id: string;
  data: Record<string, unknown>;
}

export default function InferenceAgentPanel({
  id,
  data
}: InferenceAgentPanelProps) {
  const { handleNodeDataUpdate } = useNodeDataUpdate();
  const [form] = Form.useForm();
  const nodeData = useMemo(() => normalizeNodeData(data), [data]);

  const [agents, setAgents] = useState<OntologScene[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  const patchNodeData = useCallback(
    (patch: Partial<InferenceAgentNodeConfig>) => {
      handleNodeDataUpdate({
        id,
        data: {
          ...data,
          ...patch,
          triggerMode: 'on_data_update'
        }
      });
    },
    [data, handleNodeDataUpdate, id]
  );

  useEffect(() => {
    form.setFieldsValue({
      ontologyModelID: nodeData.ontologyModelID
    });
  }, [form, nodeData]);

  useEffect(() => {
    const loadAgents = async () => {
      setAgentsLoading(true);
      try {
        const res = await listOntologyModel({
          pageNo: -1,
          pageSize: -1,
          order: 'desc'
        });
        if (isOntologyApiSuccess(res) && res.data?.result) {
          setAgents(res.data.result.filter((scene) => scene.id != null));
        } else {
          setAgents([]);
        }
      } catch (error) {
        console.error('加载 AGENT 列表失败:', error);
        Message.error('加载 AGENT 列表失败');
        setAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    };

    void loadAgents();
  }, []);

  const handleAgentChange = (sceneId: number | undefined) => {
    const scene = agents.find((item) => item.id === sceneId);
    patchNodeData({
      ontologyModelID: sceneId,
      ontologyModelName: scene?.name || '',
      agentAppId: scene?.appID || '',
      agentName: scene?.name || ''
    });
  };

  const selectedAgent = agents.find(
    (item) => item.id === nodeData.ontologyModelID
  );

  return (
    <div className={styles['inference-agent-panel']}>
      <div className={styles['panel-header']}>
        <div className={styles['panel-header-title']}>推理 AGENT 配置</div>
      </div>

      <div className={styles['trigger-hint']}>
        <Text type="secondary">
          触发逻辑：上游数据更新时，自动触发所选 AGENT
          重新推理，并将结果写入本节点输出字段，供下游复用。
        </Text>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item label="AGENT" required>
          <Select
            allowClear
            showSearch
            loading={agentsLoading}
            placeholder="请选择推理 AGENT"
            value={nodeData.ontologyModelID}
            filterOption={(inputValue, option) => {
              const label = String(
                option?.props?.extra ?? option?.props?.children ?? ''
              );
              return label.toLowerCase().includes(inputValue.toLowerCase());
            }}
            onChange={handleAgentChange}
          >
            {agents.map((scene) => {
              const name = scene.name || `AGENT #${scene.id}`;
              return (
                <Select.Option key={scene.id} value={scene.id!} extra={name}>
                  {name}
                  {scene.appID ? '（已就绪）' : '（未创建）'}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item label="触发方式">
          <div className="text-[13px] text-[var(--color-text-2)]">
            数据更新触发
          </div>
        </Form.Item>

        {selectedAgent && (
          <Form.Item label="Agent ID">
            <div className="text-[13px] text-[var(--color-text-3)]">
              {selectedAgent.appID || '尚未绑定 Agent，保存后可按需创建'}
            </div>
          </Form.Item>
        )}
      </Form>

      <div className={styles['ai-assist-placeholder']}>
        <div className={styles['ai-assist-title']}>说明</div>
        <div className={styles['ai-assist-desc']}>
          请在下方「输入字段」中引用上游数据字段；在「输出字段」中定义推理结果字段（如
          inference_result），供后续节点使用。
        </div>
      </div>
    </div>
  );
}
