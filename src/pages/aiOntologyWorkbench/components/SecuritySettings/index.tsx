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
import { updateSecurityProtectionConfig } from '../../services/securityProtectionStorage';
import type { SecurityProtectionConfig } from '../../types/securityProtection';
import styles from './index.module.scss';

const TextArea = Input.TextArea;

export interface SecuritySettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  visible,
  onClose
}) => {
  const {
    currentOntology,
    securityProtectionConfig,
    loadSecurityProtectionForOntology,
    setSecurityProtectionConfig
  } = useAIWorkbenchStore();

  const ontologyModelId = currentOntology?.id;
  const [draft, setDraft] = useState<SecurityProtectionConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !ontologyModelId) {
      return;
    }

    loadSecurityProtectionForOntology(ontologyModelId);
  }, [visible, ontologyModelId, loadSecurityProtectionForOntology]);

  useEffect(() => {
    if (!visible || !securityProtectionConfig) {
      return;
    }

    setDraft({
      ...securityProtectionConfig,
      categories: securityProtectionConfig.categories.map((item) => ({
        ...item
      }))
    });
  }, [visible, securityProtectionConfig]);

  const handleSave = () => {
    if (!ontologyModelId || !draft) {
      return;
    }

    setSaving(true);
    try {
      const next = updateSecurityProtectionConfig(ontologyModelId, draft);
      setSecurityProtectionConfig(next);
      Message.success('安全防护配置已保存');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!draft) {
    return (
      <Drawer
        className={styles.drawer}
        width={640}
        title="安全防护设置"
        visible={visible}
        onCancel={onClose}
        footer={null}
        unmountOnExit
      />
    );
  }

  return (
    <Drawer
      className={styles.drawer}
      width={640}
      title="安全防护设置"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      {!ontologyModelId ? (
        <div className={styles.footerTip}>请先选择本体场景库</div>
      ) : (
        <div className={styles.body}>
          <div className={styles.alertBox}>
            开启后，系统将自动检测用户输入中的涉密、涉黄、涉爆、涉黑等敏感话题，并给出提示；可配置是否在检测到时拦截发送。
          </div>

          <div className={styles.section}>
            <div className={styles.masterRow}>
              <div>
                <div className={styles.sectionTitle}>启用安全防护</div>
                <div className={styles.masterDesc}>
                  关闭后将不再检测与提示敏感内容
                </div>
              </div>
              <Switch
                checked={draft.enabled}
                onChange={(checked) =>
                  setDraft((prev) =>
                    prev ? { ...prev, enabled: checked } : prev
                  )
                }
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>检测分类</div>
            {draft.categories.map((category) => (
              <div key={category.type} className={styles.categoryCard}>
                <div className={styles.categoryMeta}>
                  <div className={styles.categoryName}>{category.name}</div>
                  <div className={styles.categoryDesc}>
                    {category.description}
                  </div>
                </div>
                <Switch
                  checked={category.enabled}
                  disabled={!draft.enabled}
                  onChange={(checked) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            categories: prev.categories.map((item) =>
                              item.type === category.type
                                ? { ...item, enabled: checked }
                                : item
                            )
                          }
                        : prev
                    )
                  }
                />
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <Form layout="vertical">
              <Form.Item label="自定义敏感词">
                <TextArea
                  value={draft.customKeywords}
                  placeholder="每行一个敏感词，或用逗号分隔"
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  disabled={!draft.enabled}
                  onChange={(value) =>
                    setDraft((prev) =>
                      prev ? { ...prev, customKeywords: value } : prev
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="检测到敏感内容时拦截发送">
                <Switch
                  checked={draft.blockOnMatch}
                  disabled={!draft.enabled}
                  onChange={(checked) =>
                    setDraft((prev) =>
                      prev ? { ...prev, blockOnMatch: checked } : prev
                    )
                  }
                />
              </Form.Item>
            </Form>
          </div>

          <div className={styles.footer}>
            <div className={styles.footerTip}>
              配置按当前本体场景库独立保存，发送消息前自动生效。
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

export default SecuritySettings;
