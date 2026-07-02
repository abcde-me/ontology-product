import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Message,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag
} from '@arco-design/web-react';
import { IconDelete, IconPlus, IconRobot } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import MarkdownContent from '@/components/MarkdownContent';
import type {
  OntologySceneVersion,
  OntologySceneVersionCompareResult,
  OntologySceneVersionStore
} from '@/types/ontologySceneVersion';
import { captureSceneSnapshot } from '@/pages/ontologyScene/services/captureSceneSnapshot';
import {
  compareSceneVersions,
  hasCompareDiff
} from '@/pages/ontologyScene/services/compareSceneVersions';
import {
  addOntologySceneVersion,
  deleteOntologySceneVersion,
  loadOntologySceneVersionStore
} from '@/pages/ontologyScene/services/ontologySceneVersionStorage';
import { buildVersionCompareSummary } from '@/pages/ontologyScene/services/summarizeVersionCompare';
import {
  getNextSceneVersionLabel,
  isHistoricalSavedVersion,
  isNewestSavedVersion,
  type SceneVersionSelectOption
} from '@/pages/ontologyScene/services/ontologySceneVersionLabel';
import { useUserInfoStore } from '@/store/userInfoStore';
import { OntoModal } from '@/pages/ontologyScene/components';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';
import styles from './index.module.scss';

const TextArea = Input.TextArea;
const TabPane = Tabs.TabPane;

export interface SceneVersionPanelProps {
  visible: boolean;
  onClose: () => void;
  sceneId?: number;
  onStoreChange?: () => void;
}

const buildVersionSelectOptions = (
  versions: OntologySceneVersion[]
): SceneVersionSelectOption[] => {
  const options: SceneVersionSelectOption[] = [];

  versions.forEach((version, index) => {
    options.push({
      value: version.id,
      versionLabel: version.label,
      isNewestSaved: index === 0
    });
  });

  return options;
};

const VersionOptionContent: React.FC<{
  option: SceneVersionSelectOption;
}> = ({ option }) => (
  <span className={styles.versionOptionRow}>
    <span>{option.versionLabel}</span>
    {option.isNewestSaved ? (
      <Tag size="small" color="arcoblue">
        最新快照
      </Tag>
    ) : null}
  </span>
);

const renderVersionSelectFormat = (
  value: string | undefined,
  options: SceneVersionSelectOption[]
) => {
  const option = options.find((item) => item.value === value);
  if (!option) {
    return value;
  }
  return <VersionOptionContent option={option} />;
};

const DiffTagList: React.FC<{
  added: string[];
  removed: string[];
}> = ({ added, removed }) => {
  if (!added.length && !removed.length) {
    return <span className="text-[var(--color-text-3)]">无变更</span>;
  }

  return (
    <div className="flex flex-wrap gap-[4px]">
      {added.map((name) => (
        <Tag key={`add-${name}`} color="green" size="small">
          + {name}
        </Tag>
      ))}
      {removed.map((name) => (
        <Tag key={`rm-${name}`} color="red" size="small">
          − {name}
        </Tag>
      ))}
    </div>
  );
};

export const SceneVersionPanel: React.FC<SceneVersionPanelProps> = ({
  visible,
  onClose,
  sceneId,
  onStoreChange
}) => {
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const [store, setStore] = useState<OntologySceneVersionStore>({
    activeVersionId: null,
    versions: []
  });
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('manage');

  const [compareBaseId, setCompareBaseId] = useState('');
  const [compareTargetId, setCompareTargetId] = useState('');
  const [compareResult, setCompareResult] =
    useState<OntologySceneVersionCompareResult | null>(null);
  const [summaryText, setSummaryText] = useState('');
  const [summarySource, setSummarySource] = useState<'llm' | 'local' | ''>('');
  const [comparing, setComparing] = useState(false);

  const syncStoreFromLocal = useCallback((): OntologySceneVersionStore => {
    if (!sceneId) {
      return { activeVersionId: null, versions: [] };
    }

    return loadOntologySceneVersionStore(sceneId);
  }, [sceneId]);

  const applyStore = useCallback(
    (next: OntologySceneVersionStore) => {
      setStore(next);
      onStoreChange?.();
    },
    [onStoreChange]
  );

  useEffect(() => {
    if (!visible) {
      scheduleOverlayCleanup();
      return;
    }

    if (!sceneId) {
      return;
    }

    const next = syncStoreFromLocal();
    setStore(next);

    const defaultId = next.versions[0]?.id || '';
    setSelectedVersionId(defaultId);

    if (next.versions[0]) {
      setCompareTargetId(next.versions[0].id);
      setCompareBaseId(next.versions[1]?.id ?? next.versions[0].id);
    } else {
      setCompareTargetId('');
      setCompareBaseId('');
    }

    setCompareResult(null);
    setSummaryText('');
    setSummarySource('');
  }, [visible, sceneId, syncStoreFromLocal]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const isValidSelection = store.versions.some(
      (v) => v.id === selectedVersionId
    );

    if (!isValidSelection && store.versions.length) {
      setSelectedVersionId(store.versions[0]?.id || '');
    }
  }, [visible, store.versions, selectedVersionId]);

  const nextVersionLabel = useMemo(
    () => getNextSceneVersionLabel(store.versions),
    [store.versions]
  );

  const versionCompareSelectOptions = useMemo(
    () => buildVersionSelectOptions(store.versions),
    [store.versions]
  );

  useEffect(() => {
    if (!visible || store.versions.length === 0) {
      return;
    }

    const isValidOption = (id: string) =>
      versionCompareSelectOptions.some((o) => o.value === id);

    const newestId = store.versions[0].id;
    const olderId = store.versions[1]?.id ?? newestId;

    if (!compareTargetId || !isValidOption(compareTargetId)) {
      setCompareTargetId(newestId);
    }

    if (!compareBaseId || !isValidOption(compareBaseId)) {
      setCompareBaseId(store.versions.length > 1 ? olderId : newestId);
    }
  }, [
    visible,
    store.versions,
    versionCompareSelectOptions,
    compareBaseId,
    compareTargetId
  ]);

  const resolveVersionForCompare = useCallback(
    (versionId: string): OntologySceneVersion | null =>
      store.versions.find((v) => v.id === versionId) ?? null,
    [store.versions]
  );

  const handleCreateVersion = async () => {
    if (!sceneId) {
      return;
    }

    if (!changeSummary.trim()) {
      Message.warning('请填写本版本主要更改说明');
      return;
    }

    setCreating(true);
    try {
      const snapshot = await captureSceneSnapshot(sceneId);
      const next = addOntologySceneVersion(sceneId, store, {
        label: nextVersionLabel,
        changeSummary: changeSummary.trim(),
        snapshot,
        createdBy: userInfo?.username || userInfo?.account
      });
      applyStore(next);
      setSelectedVersionId(next.versions[0].id);
      setChangeSummary('');
      setCreateModalVisible(false);
      setCompareTargetId(next.versions[0].id);
      setCompareBaseId(next.versions[1]?.id ?? next.versions[0].id);
      Message.success(`新版本 ${nextVersionLabel} 已创建`);
      scheduleOverlayCleanup();
    } catch {
      Message.error('创建版本失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVersion = (version: OntologySceneVersion) => {
    if (!sceneId) {
      return;
    }

    OntoModal.confirm({
      title: `删除版本 ${version.label}？`,
      content: '删除后不可恢复',
      onOk: () => {
        const next = deleteOntologySceneVersion(sceneId, store, version.id);
        if (!next) {
          return;
        }
        applyStore(next);
        const fallback = next.versions[0];
        if (fallback) {
          setSelectedVersionId(fallback.id);
        }
        Message.success('版本已删除');
      }
    });
  };

  const runCompare = () => {
    if (store.versions.length < 2) {
      Message.warning('请至少保存两个版本后再对比');
      return;
    }

    const base = resolveVersionForCompare(compareBaseId);
    const target = resolveVersionForCompare(compareTargetId);

    if (!base || !target) {
      Message.warning('请选择两个有效版本');
      return;
    }

    if (base.id === target.id) {
      Message.warning('请选择两个不同的版本');
      return;
    }

    const result = compareSceneVersions(base, target);
    setCompareResult(result);
    setSummaryText('');
    setSummarySource('');

    if (!hasCompareDiff(result)) {
      setSummaryText(
        '两个版本在对象类型、链接、行为、函数名称与数量上均无差异。'
      );
      setSummarySource('local');
    }
  };

  const handleRunCompareAndSummarize = async () => {
    if (store.versions.length < 2) {
      Message.warning('请至少保存两个版本后再对比');
      return;
    }

    setComparing(true);
    try {
      const base = resolveVersionForCompare(compareBaseId);
      const target = resolveVersionForCompare(compareTargetId);
      if (!base || !target || base.id === target.id) {
        Message.warning('请选择两个不同的有效版本');
        return;
      }
      const result = compareSceneVersions(base, target);
      setCompareResult(result);
      const { text, source } = await buildVersionCompareSummary(result);
      setSummaryText(text);
      setSummarySource(source);
    } finally {
      setComparing(false);
    }
  };

  const diffTableData = compareResult
    ? [
        {
          key: 'objectTypes',
          category: '对象类型',
          delta: compareResult.countsDelta.objectTypes,
          diff: compareResult.objectTypes
        },
        {
          key: 'linkTypes',
          category: '链接',
          delta: compareResult.countsDelta.linkTypes,
          diff: compareResult.linkTypes
        },
        {
          key: 'actions',
          category: '行为',
          delta: compareResult.countsDelta.actions,
          diff: compareResult.actions
        },
        {
          key: 'functions',
          category: '函数',
          delta: compareResult.countsDelta.functions,
          diff: compareResult.functions
        }
      ]
    : [];

  const renderVersionList = () => (
    <div className={styles.versionList}>
      <div className={styles.versionListHeader}>
        <span>版本历史</span>
        <Space size="mini">
          <Button
            type="text"
            size="mini"
            icon={<IconPlus />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建
          </Button>
        </Space>
      </div>
      <div className={styles.versionItems}>
        {store.versions.length === 0 ? (
          <div className={styles.emptyTip}>
            暂无已保存版本。当前场景可随时编辑，点击「新建」保存快照后才会生成版本记录。
          </div>
        ) : (
          store.versions.map((version) => (
            <div
              key={version.id}
              className={`${styles.versionItem} ${
                version.id === selectedVersionId ? styles.versionItemActive : ''
              }`}
              onClick={() => setSelectedVersionId(version.id)}
            >
              <div className="flex items-start justify-between gap-[4px]">
                <div className="min-w-0 flex-1">
                  <div className={styles.versionLabel}>{version.label}</div>
                  <div className={styles.versionTime}>
                    {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                  <div className={styles.versionSummary}>
                    {version.changeSummary || '（无更改说明）'}
                  </div>
                  <div className={styles.versionTags}>
                    {isNewestSavedVersion(version.id, store.versions) ? (
                      <Tag size="small" color="arcoblue">
                        最新快照
                      </Tag>
                    ) : null}
                    {isHistoricalSavedVersion(version.id, store.versions) ? (
                      <Tag size="small" color="gray">
                        历史版本
                      </Tag>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="text"
                  size="mini"
                  status="danger"
                  icon={<IconDelete />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVersion(version);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className={styles.body}>{renderVersionList()}</div>
  );

  const renderCompareTab = () => (
    <div>
      {store.versions.length < 2 ? (
        <div className={styles.emptyTip}>
          请至少保存两个版本后再进行对比（可先「新建」保存当前场景快照）
        </div>
      ) : (
        <>
          <div className="mb-[8px] text-[12px] text-[var(--color-text-3)]">
            选择两个已保存版本进行对比，默认较新版本在右侧
          </div>
          <div className={styles.compareRow}>
            <Select
              className={styles.compareSelect}
              placeholder="基准版本"
              value={compareBaseId || undefined}
              onChange={setCompareBaseId}
              renderFormat={(_, value) =>
                renderVersionSelectFormat(
                  (value as string) || compareBaseId,
                  versionCompareSelectOptions
                )
              }
            >
              {versionCompareSelectOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  <VersionOptionContent option={option} />
                </Select.Option>
              ))}
            </Select>
            <span className="text-[var(--color-text-3)]">对比</span>
            <Select
              className={styles.compareSelect}
              placeholder="对比版本"
              value={compareTargetId || undefined}
              onChange={setCompareTargetId}
              renderFormat={(_, value) =>
                renderVersionSelectFormat(
                  value as string,
                  versionCompareSelectOptions
                )
              }
            >
              {versionCompareSelectOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  <VersionOptionContent option={option} />
                </Select.Option>
              ))}
            </Select>
          </div>
          <Space className="mt-[12px]">
            <Button loading={comparing} onClick={() => void runCompare()}>
              对比差异
            </Button>
            <Button
              type="primary"
              icon={<IconRobot />}
              loading={comparing}
              onClick={handleRunCompareAndSummarize}
            >
              对比并 AI 总结
            </Button>
          </Space>

          {compareResult && (
            <Table
              className={styles.diffTable}
              pagination={false}
              size="small"
              columns={[
                { title: '资源类型', dataIndex: 'category', width: 100 },
                {
                  title: '数量变化',
                  dataIndex: 'delta',
                  width: 90,
                  render: (delta: number) => (
                    <span
                      style={{
                        color:
                          delta > 0
                            ? 'rgb(var(--green-6))'
                            : delta < 0
                              ? 'rgb(var(--red-6))'
                              : undefined
                      }}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )
                },
                {
                  title: '名称变更',
                  dataIndex: 'diff',
                  render: (diff) => <DiffTagList {...diff} />
                }
              ]}
              data={diffTableData}
            />
          )}

          {summaryText && (
            <div className={styles.summaryBox}>
              {summarySource === 'llm' && (
                <Tag color="purple" size="small" className="mb-[8px]">
                  AI 总结
                </Tag>
              )}
              <MarkdownContent
                content={summaryText}
                className={styles.summaryMarkdown}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <Drawer
        className={styles.drawer}
        width={420}
        title="本体场景版本"
        visible={visible}
        mask
        maskClosable
        escToExit
        focusLock={false}
        getPopupContainer={() => document.body}
        onCancel={() => {
          onClose();
          scheduleOverlayCleanup();
        }}
        afterClose={scheduleOverlayCleanup}
        footer={null}
        unmountOnExit
      >
        {!sceneId ? (
          <div className={styles.emptyTip}>场景 ID 无效</div>
        ) : (
          <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <TabPane key="manage" title="版本管理">
              {renderManageTab()}
            </TabPane>
            <TabPane key="compare" title="版本对比">
              {renderCompareTab()}
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      <OntoModal
        title={`创建新版本 · ${nextVersionLabel}`}
        visible={createModalVisible}
        confirmLoading={creating}
        onOk={handleCreateVersion}
        getPopupContainer={() => document.body}
        onCancel={() => {
          setCreateModalVisible(false);
          setChangeSummary('');
          scheduleOverlayCleanup();
        }}
        afterClose={scheduleOverlayCleanup}
        unmountOnExit
      >
        <div className={styles.createVersionPreview}>
          <div>即将保存的版本号</div>
          <div className={styles.createVersionPreviewLabel}>
            {nextVersionLabel}
          </div>
        </div>
        <Form layout="vertical">
          <Form.Item label="主要更改" required>
            <TextArea
              value={changeSummary}
              placeholder="请描述本版本相对上一版的主要变更，如：新增对象类型「作战单元」、调整供应链链接等"
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={500}
              showWordLimit
              onChange={setChangeSummary}
            />
          </Form.Item>
          <div className="text-[12px] text-[var(--color-text-3)]">
            将自动采集当前场景下的对象类型、链接、行为、函数快照并保存。
          </div>
        </Form>
        {creating && (
          <div className="mt-[8px] flex items-center gap-[8px] text-[12px] text-[var(--color-text-3)]">
            <Spin size={14} />
            正在采集场景快照…
          </div>
        )}
      </OntoModal>
    </>
  );
};

export default SceneVersionPanel;
