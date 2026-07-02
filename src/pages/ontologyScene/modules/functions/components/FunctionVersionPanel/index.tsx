import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Input,
  Message,
  Space,
  Spin,
  Table,
  Tag
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import { PyCodeContent } from '@/components/PyCodeContent';
import { OntoModal } from '@/pages/ontologyScene/components';
import { captureFunctionSnapshot } from '@/pages/ontologyScene/services/captureFunctionSnapshot';
import {
  addOntologyFunctionVersion,
  deleteOntologyFunctionVersion,
  loadOntologyFunctionVersionStore
} from '@/pages/ontologyScene/services/ontologyFunctionVersionStorage';
import {
  getNextFunctionVersionLabel,
  isHistoricalFunctionVersion,
  isNewestFunctionVersion
} from '@/pages/ontologyScene/services/ontologyFunctionVersionLabel';
import {
  InputType,
  type OntologyFunctionParam
} from '@/pages/ontologyScene/types/ontologyFunction';
import type { OntologyFunctionVersion } from '@/types/ontologyFunctionVersion';
import { useUserInfoStore } from '@/store/userInfoStore';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';
import styles from './index.module.scss';

const TextArea = Input.TextArea;

export interface FunctionVersionPanelProps {
  visible: boolean;
  functionId?: number;
  functionName?: string;
  onClose: () => void;
}

const splitParams = (params: OntologyFunctionParam[] = []) => ({
  input: params.filter((item) => item.inputType === InputType.Input),
  output: params.filter((item) => item.inputType === InputType.Output)
});

const paramColumns = [
  {
    title: '参数名称',
    dataIndex: 'name',
    width: 140,
    ellipsis: true
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 120,
    render: (value: string | undefined) => value || '-'
  },
  {
    title: '说明',
    dataIndex: 'description',
    ellipsis: true,
    render: (value: string | undefined) => value || '-'
  }
];

export const FunctionVersionPanel: React.FC<FunctionVersionPanelProps> = ({
  visible,
  functionId,
  functionName,
  onClose
}) => {
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const [store, setStore] = useState(() =>
    functionId
      ? loadOntologyFunctionVersionStore(functionId)
      : { activeVersionId: null, versions: [] }
  );
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [creating, setCreating] = useState(false);

  const syncStoreFromLocal = useCallback(() => {
    if (!functionId) {
      return { activeVersionId: null, versions: [] };
    }
    return loadOntologyFunctionVersionStore(functionId);
  }, [functionId]);

  useEffect(() => {
    if (!visible) {
      scheduleOverlayCleanup();
      return;
    }

    if (!functionId) {
      return;
    }

    const next = syncStoreFromLocal();
    setStore(next);
    setSelectedVersionId(next.versions[0]?.id || '');
  }, [visible, functionId, syncStoreFromLocal]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const isValidSelection = store.versions.some(
      (version) => version.id === selectedVersionId
    );

    if (!isValidSelection && store.versions.length) {
      setSelectedVersionId(store.versions[0]?.id || '');
    }
  }, [visible, store.versions, selectedVersionId]);

  const nextVersionLabel = useMemo(
    () => getNextFunctionVersionLabel(store.versions),
    [store.versions]
  );

  const selectedVersion = useMemo(
    () => store.versions.find((item) => item.id === selectedVersionId) ?? null,
    [store.versions, selectedVersionId]
  );

  const handleCreateVersion = async () => {
    if (!functionId) {
      return;
    }

    if (!changeSummary.trim()) {
      Message.warning('请填写本版本主要更改说明');
      return;
    }

    setCreating(true);
    try {
      const snapshot = await captureFunctionSnapshot(functionId);
      const next = addOntologyFunctionVersion(functionId, store, {
        label: nextVersionLabel,
        changeSummary: changeSummary.trim(),
        snapshot,
        createdBy: userInfo?.username || userInfo?.account
      });
      setStore(next);
      setSelectedVersionId(next.versions[0]?.id || '');
      setChangeSummary('');
      setCreateModalVisible(false);
      Message.success(`新版本 ${nextVersionLabel} 已创建`);
      scheduleOverlayCleanup();
    } catch {
      Message.error('创建版本失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVersion = (version: OntologyFunctionVersion) => {
    if (!functionId) {
      return;
    }

    OntoModal.confirm({
      title: `删除版本 ${version.label}？`,
      content: '删除后不可恢复',
      onOk: () => {
        const next = deleteOntologyFunctionVersion(
          functionId,
          store,
          version.id
        );
        if (!next) {
          return;
        }
        setStore(next);
        setSelectedVersionId(next.versions[0]?.id || '');
        Message.success('版本已删除');
      }
    });
  };

  const renderVersionDetail = () => {
    if (!selectedVersion) {
      return (
        <div className={styles.emptyTip}>
          选择左侧版本可查看该版本的函数详情快照
        </div>
      );
    }

    const { snapshot } = selectedVersion;
    const { input, output } = splitParams(snapshot.params);

    return (
      <div className={styles.detailPanel}>
        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>版本信息</div>
          <div className={styles.detailMeta}>
            <span className={styles.detailMetaLabel}>版本号</span>
            <span className={styles.detailMetaValue}>
              {selectedVersion.label}
            </span>
            <span className={styles.detailMetaLabel}>创建时间</span>
            <span className={styles.detailMetaValue}>
              {dayjs(selectedVersion.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </span>
            <span className={styles.detailMetaLabel}>创建人</span>
            <span className={styles.detailMetaValue}>
              {selectedVersion.createdBy || '-'}
            </span>
            <span className={styles.detailMetaLabel}>更改说明</span>
            <span className={styles.detailMetaValue}>
              {selectedVersion.changeSummary || '（无）'}
            </span>
          </div>
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>函数信息</div>
          <Descriptions
            column={1}
            size="small"
            data={[
              { label: '显示名称', value: snapshot.name || '-' },
              { label: '函数名称(id)', value: snapshot.code || '-' },
              { label: '描述说明', value: snapshot.description || '-' }
            ]}
          />
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>
            入参（{input.length}）
          </div>
          <Table
            size="small"
            rowKey={(record) => `${record.name}-${record.type}`}
            columns={paramColumns}
            data={input}
            pagination={false}
            border={false}
            noDataElement="暂无入参"
          />
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>
            出参（{output.length}）
          </div>
          <Table
            size="small"
            rowKey={(record) => `${record.name}-${record.type}`}
            columns={paramColumns}
            data={output}
            pagination={false}
            border={false}
            noDataElement="暂无出参"
          />
        </div>

        <div className={styles.detailSection}>
          <div className={styles.detailSectionTitle}>函数代码</div>
          <div className={styles.codePreview}>
            <PyCodeContent
              value={snapshot.content || '# 暂无代码'}
              readOnly
              fullScreen={false}
              basicSetup={{ lineNumbers: true, foldGutter: false }}
              height="240px"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer
        className={styles.drawer}
        width={760}
        title={`函数版本${functionName ? ` · ${functionName}` : ''}`}
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
        {!functionId ? (
          <div className={styles.emptyTip}>函数 ID 无效</div>
        ) : (
          <div className={styles.body}>
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
                    暂无已保存版本。点击「新建」将当前函数保存为版本快照。
                  </div>
                ) : (
                  store.versions.map((version) => (
                    <div
                      key={version.id}
                      className={`${styles.versionItem} ${
                        version.id === selectedVersionId
                          ? styles.versionItemActive
                          : ''
                      }`}
                      onClick={() => setSelectedVersionId(version.id)}
                    >
                      <div className="flex items-start justify-between gap-[4px]">
                        <div className="min-w-0 flex-1">
                          <div className={styles.versionLabel}>
                            {version.label}
                          </div>
                          <div className={styles.versionTime}>
                            {dayjs(version.createdAt).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                          </div>
                          <div className={styles.versionSummary}>
                            {version.changeSummary || '（无更改说明）'}
                          </div>
                          <div className={styles.versionTags}>
                            {isNewestFunctionVersion(
                              version.id,
                              store.versions
                            ) ? (
                              <Tag size="small" color="arcoblue">
                                最新快照
                              </Tag>
                            ) : null}
                            {isHistoricalFunctionVersion(
                              version.id,
                              store.versions
                            ) ? (
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
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteVersion(version);
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {renderVersionDetail()}
          </div>
        )}
      </Drawer>

      <OntoModal
        title={`创建新版本 · ${nextVersionLabel}`}
        visible={createModalVisible}
        confirmLoading={creating}
        onOk={() => void handleCreateVersion()}
        onCancel={() => {
          setCreateModalVisible(false);
          setChangeSummary('');
          scheduleOverlayCleanup();
        }}
        afterClose={scheduleOverlayCleanup}
        okText="保存版本"
        cancelText="取消"
      >
        <Spin loading={creating}>
          <div className={styles.createVersionPreview}>
            将保存当前函数的代码、入参/出参与描述信息为版本快照。
          </div>
          <div>即将保存的版本号</div>
          <div className="mb-3 mt-1 text-[16px] font-medium text-[var(--color-text-1)]">
            {nextVersionLabel}
          </div>
          <TextArea
            placeholder="请描述本版本相对上一版的主要变更，如：调整油耗计算逻辑、新增入参等"
            value={changeSummary}
            onChange={setChangeSummary}
            maxLength={500}
            showWordLimit
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Spin>
      </OntoModal>
    </>
  );
};
