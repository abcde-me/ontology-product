import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Space,
  Tag
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { useAIWorkbenchStore } from '../../store';
import {
  addSystemPromptVersion,
  deleteSystemPromptVersion,
  setActiveSystemPromptVersion,
  updateSystemPromptVersion
} from '../../services/systemPromptStorage';
import type { SystemPromptVersion } from '../../types/systemPrompt';
import styles from './index.module.scss';

const TextArea = Input.TextArea;

export interface SystemPromptSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const SystemPromptSettings: React.FC<SystemPromptSettingsProps> = ({
  visible,
  onClose
}) => {
  const {
    currentOntology,
    systemPromptStore,
    loadSystemPromptForOntology,
    setSystemPromptStore
  } = useAIWorkbenchStore();

  const ontologyModelId = currentOntology?.id;
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [versionName, setVersionName] = useState('');
  const [versionContent, setVersionContent] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedVersion = useMemo(
    () =>
      systemPromptStore?.versions.find((item) => item.id === selectedVersionId),
    [selectedVersionId, systemPromptStore?.versions]
  );

  useEffect(() => {
    if (!visible || !ontologyModelId) {
      return;
    }

    loadSystemPromptForOntology(ontologyModelId);
  }, [visible, ontologyModelId, loadSystemPromptForOntology]);

  useEffect(() => {
    if (!visible || !systemPromptStore) {
      return;
    }

    const initialId =
      systemPromptStore.activeVersionId || systemPromptStore.versions[0]?.id;

    if (!initialId) {
      return;
    }

    const version =
      systemPromptStore.versions.find((item) => item.id === initialId) ||
      systemPromptStore.versions[0];

    setSelectedVersionId(version.id);
    setVersionName(version.name);
    setVersionContent(version.content);
  }, [visible, systemPromptStore]);

  const syncEditorFromVersion = (version: SystemPromptVersion) => {
    setSelectedVersionId(version.id);
    setVersionName(version.name);
    setVersionContent(version.content);
  };

  const handleSelectVersion = (versionId: string) => {
    const version = systemPromptStore?.versions.find(
      (item) => item.id === versionId
    );

    if (!version) {
      return;
    }

    syncEditorFromVersion(version);
  };

  const handleSaveVersion = () => {
    if (!ontologyModelId || !systemPromptStore || !selectedVersionId) {
      return;
    }

    if (!versionName.trim()) {
      Message.warning('请输入版本名称');
      return;
    }

    setSaving(true);
    try {
      const next = updateSystemPromptVersion(
        ontologyModelId,
        systemPromptStore,
        selectedVersionId,
        {
          name: versionName.trim(),
          content: versionContent
        }
      );
      setSystemPromptStore(next);
      Message.success('版本已保存');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVersion = () => {
    if (!ontologyModelId || !systemPromptStore) {
      return;
    }

    const index = systemPromptStore.versions.length + 1;
    const next = addSystemPromptVersion(ontologyModelId, systemPromptStore, {
      name: `版本 ${index}`,
      content: versionContent || selectedVersion?.content || ''
    });

    setSystemPromptStore(next);
    const created = next.versions[0];
    syncEditorFromVersion(created);
    Message.success('已创建新版本');
  };

  const handleActivateVersion = () => {
    if (!ontologyModelId || !systemPromptStore || !selectedVersionId) {
      return;
    }

    if (!versionName.trim()) {
      Message.warning('请输入版本名称');
      return;
    }

    setSaving(true);
    try {
      const saved = updateSystemPromptVersion(
        ontologyModelId,
        systemPromptStore,
        selectedVersionId,
        {
          name: versionName.trim(),
          content: versionContent
        }
      );
      const next = setActiveSystemPromptVersion(
        ontologyModelId,
        saved,
        selectedVersionId
      );
      setSystemPromptStore(next);
      Message.success('已设为当前生效版本');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVersion = () => {
    if (!ontologyModelId || !systemPromptStore || !selectedVersionId) {
      return;
    }

    Modal.confirm({
      title: '确认删除该版本？',
      content: '删除后不可恢复',
      onOk: () => {
        const next = deleteSystemPromptVersion(
          ontologyModelId,
          systemPromptStore,
          selectedVersionId
        );

        if (!next) {
          Message.warning('至少保留一个版本');
          return;
        }

        setSystemPromptStore(next);
        const fallback =
          next.versions.find((item) => item.id === next.activeVersionId) ||
          next.versions[0];
        syncEditorFromVersion(fallback);
        Message.success('版本已删除');
      }
    });
  };

  return (
    <Drawer
      className={styles.drawer}
      width={720}
      title="系统提示词设置"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      {!ontologyModelId ? (
        <div className={styles.footerTip}>请先选择本体场景库</div>
      ) : (
        <div className={styles.body}>
          <div className={styles.versionList}>
            <div className={styles.versionListHeader}>
              <span>版本列表</span>
              <Button
                type="text"
                size="mini"
                icon={<IconPlus />}
                onClick={handleCreateVersion}
              >
                新建
              </Button>
            </div>
            <Radio.Group
              className={styles.versionItems}
              value={selectedVersionId}
              onChange={handleSelectVersion}
              direction="vertical"
            >
              {systemPromptStore?.versions.map((version) => (
                <div
                  key={version.id}
                  className={`${styles.versionItem} ${
                    version.id === selectedVersionId
                      ? styles.versionItemActive
                      : ''
                  }`}
                  onClick={() => handleSelectVersion(version.id)}
                >
                  <Radio value={version.id} />
                  <div className={styles.versionMeta}>
                    <div className={styles.versionName}>{version.name}</div>
                    <div className={styles.versionTime}>
                      {dayjs(version.updatedAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                    {systemPromptStore?.activeVersionId === version.id && (
                      <Tag
                        size="small"
                        color="arcoblue"
                        className={styles.activeTag}
                      >
                        生效中
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
            </Radio.Group>
          </div>

          <div className={styles.editorPane}>
            <Form layout="vertical">
              <Form.Item label="版本名称" required>
                <Input
                  value={versionName}
                  placeholder="请输入版本名称"
                  maxLength={50}
                  onChange={setVersionName}
                />
              </Form.Item>
              <Form.Item label="系统提示词内容" required>
                <TextArea
                  value={versionContent}
                  placeholder="请输入系统提示词"
                  autoSize={{ minRows: 14, maxRows: 20 }}
                  onChange={setVersionContent}
                />
              </Form.Item>
            </Form>

            <div className={styles.editorActions}>
              <Button
                type="text"
                status="danger"
                icon={<IconDelete />}
                disabled={(systemPromptStore?.versions.length || 0) <= 1}
                onClick={handleDeleteVersion}
              >
                删除版本
              </Button>
              <Space>
                <Button onClick={onClose}>关闭</Button>
                <Button loading={saving} onClick={handleSaveVersion}>
                  保存版本
                </Button>
                <Button
                  type="primary"
                  loading={saving}
                  disabled={
                    systemPromptStore?.activeVersionId === selectedVersionId
                  }
                  onClick={handleActivateVersion}
                >
                  设为生效
                </Button>
              </Space>
            </div>

            <div className={styles.footerTip}>
              当前生效版本会在对话请求中作为系统提示词发送。修改内容后请先保存，再点击「设为生效」。
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default SystemPromptSettings;
