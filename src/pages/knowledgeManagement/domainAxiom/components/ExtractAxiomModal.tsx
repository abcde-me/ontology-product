import React, { useEffect, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space,
  Upload
} from '@arco-design/web-react';
import { IconDelete, IconUpload } from '@arco-design/web-react/icon';
import type { UploadItem } from '@arco-design/web-react/es/Upload';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { listApplicationScenarios } from '@/pages/applicationScene/services/storage';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { DEFAULT_DOMAIN_OPTIONS, EXTRACT_ACCEPT } from '../constants';
import type { CreateDomainAxiomInput, DomainAxiomCandidate } from '../types';
import {
  extractAxiomsFromText,
  readFileAsText
} from '../services/axiomExtract';
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

interface ExtractAxiomModalProps {
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateDomainAxiomInput[]) => void;
}

export default function ExtractAxiomModal({
  visible,
  saving,
  onCancel,
  onSubmit
}: ExtractAxiomModalProps) {
  const [fileList, setFileList] = useState<UploadItem[]>([]);
  const [fileName, setFileName] = useState<string>();
  const [extracting, setExtracting] = useState(false);
  const [candidates, setCandidates] = useState<DomainAxiomCandidate[]>([]);
  const [defaultDomain, setDefaultDomain] = useState<string>();
  const [ontologySceneId, setOntologySceneId] = useState<number>();
  const [applicationScenarioId, setApplicationScenarioId] = useState<string>();
  const [scenesLoading, setScenesLoading] = useState(false);
  const [sceneOptions, setSceneOptions] = useState<SceneOption[]>([]);
  const [appScenarioOptions, setAppScenarioOptions] = useState<
    ApplicationScenarioOption[]
  >([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setFileList([]);
    setFileName(undefined);
    setCandidates([]);
    setDefaultDomain(undefined);
    setOntologySceneId(undefined);
    setApplicationScenarioId(undefined);
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

  const handleExtract = async (file: File) => {
    setExtracting(true);
    try {
      const text = await readFileAsText(file);
      const extracted = extractAxiomsFromText(text, file.name);
      if (!extracted.length) {
        Message.warning('未从文件中识别到可用公理，请检查内容格式');
        setCandidates([]);
        return;
      }
      setCandidates(extracted);
      setFileName(file.name);
      Message.success(`已提取 ${extracted.length} 条公理候选，请确认后入库`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '文件提取失败');
    } finally {
      setExtracting(false);
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
      Message.warning('请先上传文件并提取公理');
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
        sourceType: 'file' as const,
        sourceFileName: fileName,
        enabled: true
      }))
    );
  };

  return (
    <Modal
      title="文件提取领域公理"
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
          label="上传文件"
          required
          extra="支持 txt / md / csv / json / yml。每行「名称:表达式」，或 JSON 数组字段 name/expression"
        >
          <Upload
            accept={EXTRACT_ACCEPT}
            fileList={fileList}
            showUploadList
            autoUpload={false}
            beforeUpload={(file) => {
              setFileList([
                {
                  uid: String(file.uid || Date.now()),
                  name: file.name,
                  originFile: file
                }
              ]);
              void handleExtract(file);
              return false;
            }}
            onRemove={() => {
              setFileList([]);
              setFileName(undefined);
              setCandidates([]);
            }}
          >
            <Button icon={<IconUpload />} loading={extracting}>
              选择文件并提取
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item label="默认所属领域" extra="未单独填写领域的候选将使用该值">
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

        <Form.Item label="应用场景" extra="选填，批量绑定到同一应用场景">
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

        <Form.Item label="关联本体场景" extra="选填，批量绑定到同一场景">
          <Select
            placeholder="请选择本体场景（可选）"
            allowClear
            showSearch
            loading={scenesLoading}
            value={ontologySceneId}
            onChange={setOntologySceneId}
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
      </Form>

      <div className={styles.candidateSection}>
        <div className={styles.candidateTitle}>
          提取结果预览
          {candidates.length ? `（${candidates.length}）` : ''}
        </div>
        {!candidates.length ? (
          <Empty description="上传文件后将在此展示可入库的公理" />
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
