import React from 'react';
import { Button, Dropdown, Empty, Menu, Tabs } from '@arco-design/web-react';
import { IconClose, IconPlus } from '@arco-design/web-react/icon';
import {
  INSTANCE_SYNC_SOURCE_TYPE_OPTIONS,
  InstanceSyncSourceType
} from '@/pages/ontologyScene/common/constants';
import type { InstanceSyncSourceTabItem } from '../../ObjectTypeFormUtils/types';
import {
  getSourceTabLabel,
  INSTANCE_SYNC_TAB_TYPE_CLASS
} from './instanceSyncSourceTabModel';

interface InstanceSyncSourceTabsProps {
  sourceTabs: InstanceSyncSourceTabItem[];
  activeSourceTabId?: string;
  onTabChange: (tabId: string) => void;
  onAddSource: (sourceType: InstanceSyncSourceType) => void;
  onRemoveSource: (tabId: string) => void;
  readOnly?: boolean;
  styles: Record<string, string>;
}

export default function InstanceSyncSourceTabs({
  sourceTabs,
  activeSourceTabId,
  onTabChange,
  onAddSource,
  onRemoveSource,
  readOnly = false,
  styles
}: InstanceSyncSourceTabsProps) {
  const addSourceMenu = (
    <Menu
      className={styles['instance-sync-add-source-menu']}
      onClickMenuItem={(key) => onAddSource(key as InstanceSyncSourceType)}
    >
      {INSTANCE_SYNC_SOURCE_TYPE_OPTIONS.map((option) => {
        const typeClass = INSTANCE_SYNC_TAB_TYPE_CLASS[option.value];
        return (
          <Menu.Item
            key={option.value}
            className={styles['instance-sync-add-source-menu-item']}
          >
            <span
              className={`${styles['instance-sync-menu-item-tag']} ${styles[typeClass] || ''}`}
            >
              {option.label}
            </span>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const addSourceButton = (
    <Dropdown
      droplist={addSourceMenu}
      droplistClassName={styles['instance-sync-add-source-dropdown']}
      disabled={readOnly}
      trigger="click"
      position="bl"
    >
      <Button
        type="outline"
        size="small"
        icon={<IconPlus />}
        disabled={readOnly}
      >
        选择数据源
      </Button>
    </Dropdown>
  );

  if (!sourceTabs.length) {
    return (
      <div className={styles['instance-sync-empty']}>
        <Empty description="请添加数据源，配置实例同步到当前对象类型" />
        <div className={styles['instance-sync-empty-action']}>
          <Dropdown
            droplist={addSourceMenu}
            droplistClassName={styles['instance-sync-add-source-dropdown']}
            disabled={readOnly}
            trigger="click"
            position="bl"
          >
            <Button type="primary" icon={<IconPlus />} disabled={readOnly}>
              选择数据源
            </Button>
          </Dropdown>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['instance-sync-tabs-bar']}>
      <Tabs
        type="card-gutter"
        className={styles['instance-sync-tabs']}
        activeTab={activeSourceTabId}
        onChange={(key) => onTabChange(String(key))}
        extra={addSourceButton}
      >
        {sourceTabs.map((tab) => {
          const typeClass = INSTANCE_SYNC_TAB_TYPE_CLASS[tab.sourceType];
          const isActive = tab.id === activeSourceTabId;
          return (
            <Tabs.TabPane
              key={tab.id}
              title={
                <span
                  className={`${styles['instance-sync-tab-title']} ${styles[typeClass] || ''} ${
                    isActive ? styles['instance-sync-tab-title--active'] : ''
                  }`}
                >
                  <span className={styles['instance-sync-tab-label']}>
                    {getSourceTabLabel(tab, sourceTabs)}
                  </span>
                  {!readOnly ? (
                    <button
                      type="button"
                      className={styles['instance-sync-tab-close']}
                      aria-label={`关闭${getSourceTabLabel(tab, sourceTabs)}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveSource(tab.id);
                      }}
                    >
                      <IconClose />
                    </button>
                  ) : null}
                </span>
              }
            />
          );
        })}
      </Tabs>
    </div>
  );
}
