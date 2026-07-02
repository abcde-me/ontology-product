import React, { useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Message,
  Space,
  Switch
} from '@arco-design/web-react';
import { useAIWorkbenchStore } from '../../store';
import { updatePluginConfigStore } from '../../services/pluginConfigStorage';
import {
  PLUGIN_CONFIG_FIELD_LABELS,
  type WorkbenchPluginItem
} from '../../types/pluginConfig';
import styles from './index.module.scss';

export interface PluginSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const PluginSettings: React.FC<PluginSettingsProps> = ({
  visible,
  onClose
}) => {
  const {
    currentOntology,
    pluginConfigStore,
    loadPluginConfigForOntology,
    setPluginConfigStore
  } = useAIWorkbenchStore();

  const ontologyModelId = currentOntology?.id;
  const [draftPlugins, setDraftPlugins] = useState<WorkbenchPluginItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !ontologyModelId) {
      return;
    }

    loadPluginConfigForOntology(ontologyModelId);
  }, [visible, ontologyModelId, loadPluginConfigForOntology]);

  useEffect(() => {
    if (!visible || !pluginConfigStore) {
      return;
    }

    setDraftPlugins(
      pluginConfigStore.plugins.map((item) => ({
        ...item,
        config: { ...item.config }
      }))
    );
  }, [visible, pluginConfigStore]);

  const handleToggle = (
    type: WorkbenchPluginItem['type'],
    enabled: boolean
  ) => {
    setDraftPlugins((prev) =>
      prev.map((item) => (item.type === type ? { ...item, enabled } : item))
    );
  };

  const handleConfigChange = (
    type: WorkbenchPluginItem['type'],
    key: string,
    value: string
  ) => {
    setDraftPlugins((prev) =>
      prev.map((item) =>
        item.type === type
          ? {
              ...item,
              config: {
                ...item.config,
                [key]: value
              }
            }
          : item
      )
    );
  };

  const handleSave = () => {
    if (!ontologyModelId || !pluginConfigStore) {
      return;
    }

    setSaving(true);
    try {
      const next = updatePluginConfigStore(
        ontologyModelId,
        pluginConfigStore,
        draftPlugins
      );
      setPluginConfigStore(next);
      Message.success('插件配置已保存');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      className={styles.drawer}
      width={640}
      title="插件配置"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      {!ontologyModelId ? (
        <div className={styles.footerTip}>请先选择本体场景库</div>
      ) : (
        <div className={styles.body}>
          {draftPlugins.map((plugin) => {
            const fields = PLUGIN_CONFIG_FIELD_LABELS[plugin.type] || [];

            return (
              <div key={plugin.type} className={styles.pluginCard}>
                <div className={styles.pluginHeader}>
                  <div className={styles.pluginMeta}>
                    <div className={styles.pluginName}>
                      {plugin.name}
                      {plugin.required && (
                        <span className={styles.requiredTag}>必选</span>
                      )}
                    </div>
                    <div className={styles.pluginDesc}>
                      {plugin.description}
                    </div>
                  </div>
                  <Switch
                    checked={plugin.enabled}
                    disabled={plugin.required}
                    onChange={(checked) => handleToggle(plugin.type, checked)}
                  />
                </div>

                {plugin.enabled && fields.length > 0 && (
                  <div className={styles.pluginConfig}>
                    <Form layout="vertical">
                      {fields.map((field) => (
                        <Form.Item key={field.key} label={field.label}>
                          <Input
                            value={plugin.config[field.key] || ''}
                            placeholder={field.placeholder}
                            onChange={(value) =>
                              handleConfigChange(plugin.type, field.key, value)
                            }
                          />
                        </Form.Item>
                      ))}
                    </Form>
                  </div>
                )}
              </div>
            );
          })}

          <div className={styles.footer}>
            <div className={styles.footerTip}>
              已启用的插件会在 Agent 对话请求中一并下发，供助手调用。
            </div>
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" loading={saving} onClick={handleSave}>
                保存
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default PluginSettings;
