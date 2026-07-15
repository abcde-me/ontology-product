import React, { useEffect, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space
} from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { fetchObjectTypeOptions } from '@/pages/exploreAnalysis/objectBrowse/services/semanticQuery2';
import { listApplicationScenarios } from '@/pages/applicationScene/services/storage';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { DEFAULT_DOMAIN_OPTIONS } from '../constants';
import type { CreateDomainAxiomInput, DomainAxiomCandidate } from '../types';
import { generateAxiomsFromOntologyGraph } from '../services/axiomGenerate';
import styles from '../index.module.scss';

const { TextArea } = Input;
const Option = Select.Option;

interface SceneOption {
  id: number;
  name: string;
}

interface ApplicationScenarioOption {
  id: string;
  name: string;
}

interface GenerateAxiomModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateDomainAxiomInput[]) => void;
}

export default function GenerateAxiomModal({
  visible,
  saving,
  onCancel,
  onSubmit
}: GenerateAxiomModalProps) {
  const [scenesLoading, setScenesLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneOption[]>([]);
  const [appScenarioOptions, setAppScenarioOptions] = useState<
    ApplicationScenarioOption[]
  >([]);
  const [ontologySceneId, setOntologySceneId] = useState<number>();
  const [applicationScenarioId, setApplicationScenarioId] = useState<string>();
  const [hint, setHint] = useState('');
  const [defaultDomain, setDefaultDomain] = useState<string>();
  const [candidates, setCandidates] = useState<DomainAxiomCandidate[]>([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setOntologySceneId(undefined);
    setApplicationScenarioId(undefined);
    setHint('');
    setDefaultDomain(undefined);
    setCandidates([]);
    setAppScenarioOptions(
      listApplicationScenarios().map((item) => ({
        id: item.id,
        name: item.name
      }))
    );
    setScenesLoading(true);

    listOntologyModel({
      pageNo: 1,
      pageSize: 100,
      order: 'desc',
      orderBy: 'create_time'
    })
      .then((res) => {
        if (isOntologyApiSuccess(res) && res.data?.result) {
          setSceneOptions(
            res.data.result
              .filter((scene) => scene.id != null)
              .map((scene) => ({
                id: scene.id as number,
                name: scene.name || `场景 #${scene.id}`
              }))
          );
        }
      })
      .catch(() => {
        Message.error('加载本体场景失败');
      })
      .finally(() => {
        setScenesLoading(false);
      });
  }, [visible]);

  const handleGenerate = async () => {
    if (ontologySceneId == null) {
      Message.warning('请先选择本体场景');
      return;
    }

    const scene = sceneOptions.find((item) => item.id === ontologySceneId);
    if (!scene) {
      Message.error('本体场景不存在');
      return;
    }

    setGenerating(true);
    try {
      const objectTypes = await fetchObjectTypeOptions(scene.id);
      const generated = await generateAxiomsFromOntologyGraph({
        sceneId: scene.id,
        sceneName: scene.name,
        objectTypes,
        hint
      });
      if (!generated.length) {
        Message.warning('未生成可用公理，请调整场景或提示后重试');
        setCandidates([]);
        return;
      }
      setCandidates(generated);
      Message.success(`已生成 ${generated.length} 条公理候选，请确认后入库`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const updateCandidate = (
    key: string,
    patch: Partial<DomainAxiomCandidate>
  ) => {
    setCandidates((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const removeCandidate = (key: string) => {
    setCandidates((prev) => prev.filter((item) => item.key !== key));
  };

  const handleOk = () => {
    if (!candidates.length) {
      Message.warning('请先根据本体图谱生成公理');
      return;
    }

    const invalid = candidates.find(
      (item) => !item.name.trim() || !item.expression.trim()
    );
    if (invalid) {
      Message.error('请完善每条公理的名称与表达式');
      return;
    }

    const scene = sceneOptions.find((item) => item.id === ontologySceneId);
    const appScenario = appScenarioOptions.find(
      (item) => item.id === applicationScenarioId
    );
    onSubmit(
      candidates.map((item) => ({
        name: item.name.trim(),
        expression: item.expression.trim(),
        description: item.description?.trim(),
        domain: item.domain?.trim() || defaultDomain,
        ontologySceneId,
        ontologySceneName: scene?.name,
        applicationScenarioId,
        applicationScenarioName: appScenario?.name,
        sourceType: 'llm' as const,
        enabled: true
      }))
    );
  };

  return (
    <Modal
      title="大模型根据本体图谱生成"
      visible={visible}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={handleOk}
      okText={candidates.length ? `保存（${candidates.length}）` : '保存'}
      okButtonProps={{ disabled: !candidates.length }}
      unmountOnExit
      style={{ width: 720 }}
    >
      <Form layout="vertical" className={styles.createModalForm}>
        <Form.Item
          label="本体场景"
          required
          extra="将读取该场景下对象类型构成的本体图谱，生成可推理引用的领域公理"
        >
          <Select
            placeholder="请选择本体场景"
            showSearch
            loading={scenesLoading}
            value={ontologySceneId}
            onChange={(value) => {
              setOntologySceneId(value);
              setCandidates([]);
            }}
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {sceneOptions.map((scene) => (
              <Option key={scene.id} value={scene.id}>
                {scene.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="生成提示"
          extra="选填，可补充希望强调的业务约束，将与图谱信息一并用于生成"
        >
          <TextArea
            placeholder="例如：突出跨域打击链路中平台与武器挂载的完整性约束"
            value={hint}
            onChange={setHint}
            autoSize={{ minRows: 2, maxRows: 4 }}
            maxLength={500}
            showWordLimit
          />
        </Form.Item>

        <Form.Item label="默认所属领域">
          <Select
            placeholder="选择或输入所属领域"
            allowClear
            allowCreate
            showSearch
            value={defaultDomain}
            onChange={setDefaultDomain}
          >
            {DEFAULT_DOMAIN_OPTIONS.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="应用场景" extra="选填，生成结果批量绑定到该应用场景">
          <Select
            placeholder="请选择应用场景（可选）"
            allowClear
            showSearch
            value={applicationScenarioId}
            onChange={setApplicationScenarioId}
            filterOption={(inputValue, option) =>
              String(option?.props?.children || '')
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          >
            {appScenarioOptions.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            loading={generating}
            disabled={ontologySceneId == null}
            onClick={() => void handleGenerate()}
          >
            根据本体图谱生成
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.candidateSection}>
        <div className={styles.candidateTitle}>
          生成结果预览
          {candidates.length ? `（${candidates.length}）` : ''}
        </div>
        {!candidates.length ? (
          <Empty description="选择场景并生成后，将在此展示可入库的公理" />
        ) : (
          <Space
            direction="vertical"
            size={12}
            className={styles.candidateList}
          >
            {candidates.map((item, index) => (
              <div key={item.key} className={styles.candidateCard}>
                <div className={styles.candidateCardHeader}>
                  <span>候选 {index + 1}</span>
                  <Button
                    type="text"
                    status="danger"
                    size="mini"
                    icon={<IconDelete />}
                    onClick={() => removeCandidate(item.key)}
                  />
                </div>
                <Input
                  className="mb-2"
                  value={item.name}
                  maxLength={64}
                  placeholder="公理名称"
                  onChange={(value) =>
                    updateCandidate(item.key, { name: value })
                  }
                />
                <TextArea
                  value={item.expression}
                  placeholder="公理表达式"
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  maxLength={2000}
                  onChange={(value) =>
                    updateCandidate(item.key, { expression: value })
                  }
                />
              </div>
            ))}
          </Space>
        )}
      </div>
    </Modal>
  );
}
