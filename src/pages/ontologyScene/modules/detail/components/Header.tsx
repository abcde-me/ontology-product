import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import { useHistory } from 'react-router-dom';
import {
  Layout,
  Input,
  Button,
  Select,
  Tooltip,
  Popover,
  Message,
  Spin
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconEdit,
  IconSearch,
  IconCode,
  IconHistory,
  IconPlus
} from '@arco-design/web-react/icon';
import cls from 'classnames';
import { useClickAway } from 'ahooks';
import SceneModal, { SceneFormData } from '../../list/components/SceneModal';
import { updateOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { OntologScene } from '@/types/ontologySceneApi';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import SearchDropdown from './SearchDropdown';
import SceneVersionPanel from './SceneVersionPanel';
import { getSceneDisplayVersionLabel } from '@/pages/ontologyScene/services/ontologySceneVersionLabel';
import { loadOntologySceneVersionStore } from '@/pages/ontologyScene/services/ontologySceneVersionStorage';
import { scheduleOverlayCleanup } from '@/utils/removeStaleArcoOverlays';

import DeveloperResourceIcon from '@/pages/ontologyScene/assets/developer-resource.svg';
import { openNewPage } from '@/utils/env';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

const { Header: LayoutHeader } = Layout;

const ONTOLOGY_SCENE_LIST_PATH = '/tenant/compute/onto/ontologyScene/list';

interface HeaderProps {
  title?: string;
  status?: string;
  onTitleEdit?: (title: string) => void;
  onPublish?: () => void;
  sceneId?: number;
  sceneDetail?: OntologScene | null;
  onSceneUpdate?: (scene?: OntologScene) => void;
}

export default function Header({
  title = '新建本体场景',
  status = '未发布',
  onTitleEdit,
  onPublish,
  sceneId,
  sceneDetail,
  onSceneUpdate
}: HeaderProps) {
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [searchHovered, setSearchHovered] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [versionPanelVisible, setVersionPanelVisible] = useState(false);
  const [versionTooltipVisible, setVersionTooltipVisible] = useState(false);
  const [versionStoreRevision, setVersionStoreRevision] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeVersionLabel = useMemo(() => {
    if (!sceneId) {
      return '';
    }
    const store = loadOntologySceneVersionStore(sceneId);
    return getSceneDisplayVersionLabel(store);
  }, [sceneId, versionPanelVisible, versionStoreRevision]);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const handleVersionStoreChange = useCallback(() => {
    setVersionStoreRevision((revision) => revision + 1);
  }, []);

  const handleOpenVersionPanel = () => {
    scheduleOverlayCleanup();
    setVersionTooltipVisible(false);

    const drawerStillMounted = document.querySelector(
      '.arco-drawer-wrapper:not(.arco-drawer-wrapper-hide) .arco-drawer'
    );

    if (versionPanelVisible && drawerStillMounted) {
      return;
    }

    if (versionPanelVisible) {
      setVersionPanelVisible(false);
    }

    window.requestAnimationFrame(() => {
      scheduleOverlayCleanup();
      setVersionPanelVisible(true);
    });
  };

  const handleCloseVersionPanel = () => {
    setVersionPanelVisible(false);
    setVersionTooltipVisible(false);
    scheduleOverlayCleanup();
  };

  useEffect(() => {
    if (versionPanelVisible) {
      setVersionTooltipVisible(false);
    }
  }, [versionPanelVisible]);

  const handleBack = () => {
    setVersionPanelVisible(false);
    setVersionTooltipVisible(false);
    setSearchHovered(false);
    scheduleOverlayCleanup();
    history.push(ONTOLOGY_SCENE_LIST_PATH);
  };

  const handleEdit = () => {
    if (!sceneId) {
      Message.warning('场景ID不存在');
      return;
    }

    if (!sceneDetail) {
      Message.warning('场景数据未加载完成，请稍候再试');
      return;
    }

    setModalVisible(true);
  };

  const handleModalSubmit = async (data: SceneFormData) => {
    if (!sceneId) {
      Message.warning('场景ID不存在');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await updateOntologyModel({
        id: sceneId,
        name: data.name,
        description: data.description || '',
        icon: data.icon || ''
      });

      if (isOntologyApiSuccess(response)) {
        Message.success('修改成功');
        setModalVisible(false);

        const updatedScene: OntologScene = {
          ...(sceneDetail || { id: sceneId }),
          id: sceneId,
          name: data.name,
          description: data.description || '',
          icon: data.icon || '',
          updateTime: new Date().toISOString()
        };

        if (onTitleEdit) {
          onTitleEdit(data.name);
        }
        if (onSceneUpdate) {
          onSceneUpdate(updatedScene);
        }
      } else {
        Message.error(response.message || '修改失败');
      }
    } catch (error) {
      Message.error('修改失败');
      console.error('提交失败:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (onTitleEdit && editTitle !== title) {
      onTitleEdit(editTitle);
    }
  };

  const handleTitlePressEnter = () => {
    handleTitleBlur();
  };

  const handleDeveloperResource = () => {
    const fileName = '本体构建平台 Ontology API 开发指南.pdf';
    openNewPage(`/onto/assets/${encodeURIComponent(fileName)}`);
  };

  // 使用 useClickAway 检测点击 SearchDropdown 外部区域时隐藏
  useClickAway(
    () => {
      if (searchHovered) {
        setSearchHovered(false);
      }
    },
    searchDropdownRef,
    'mousedown'
  );

  return (
    <LayoutHeader
      className={cls(
        'sticky top-0 z-[1001] flex h-[56px] flex-shrink-0 items-center justify-between border-b border-[var(--color-border-2)] bg-white px-[16px] shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]'
      )}
    >
      {/* 左侧区域 */}
      <div className="flex items-center overflow-hidden">
        <Popover trigger="hover" content="返回">
          <button
            type="button"
            aria-label="返回本体场景库列表"
            className="mx-[9px] flex flex-shrink-0 cursor-pointer items-center border-0 bg-transparent p-0 text-[14px] text-[var(--color-text-2)] outline-none hover:text-primary-600"
            onClick={handleBack}
          >
            <IconArrowLeft className="text-[14px]" />
          </button>
        </Popover>
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={setEditTitle}
            onBlur={handleTitleBlur}
            onPressEnter={handleTitlePressEnter}
            autoFocus
            className="w-[200px]"
          />
        ) : (
          <>
            <EllipsisPopover
              value={title}
              className="ml-[12px] mr-[8px] w-full max-w-[455px] text-[16px] font-[600] text-[var(--color-text-1)]"
            />

            <Popover trigger="hover" content="编辑">
              <IconEdit
                className="flex-shrink-0 cursor-pointer text-[16px] text-[var(--color-text-2)] hover:text-primary-600"
                onClick={handleEdit}
              />
            </Popover>
          </>
        )}
      </div>

      {/* 右侧区域 */}
      <div className="flex flex-shrink-0 items-center gap-x-[18px]">
        {sceneId && (
          <Tooltip
            popupVisible={versionTooltipVisible && !versionPanelVisible}
            onVisibleChange={(visible) => {
              if (!versionPanelVisible) {
                setVersionTooltipVisible(visible);
              }
            }}
            content={
              activeVersionLabel
                ? `管理场景版本快照，最新：${activeVersionLabel}`
                : '管理场景版本快照与对比'
            }
          >
            <span className="inline-flex">
              <Button
                type="text"
                className="!flex-shrink-0 whitespace-nowrap !px-[4px] text-[var(--color-text-2)]"
                icon={<IconHistory className="text-[16px]" />}
                onClick={handleOpenVersionPanel}
              >
                版本
                {activeVersionLabel ? (
                  <span className="ml-[4px] max-w-[72px] truncate text-[12px] text-[var(--color-text-3)]">
                    {activeVersionLabel}
                  </span>
                ) : null}
              </Button>
            </span>
          </Tooltip>
        )}

        <div
          ref={searchContainerRef}
          className={cls(
            'flex h-[32px] flex-shrink-0 items-center justify-end overflow-hidden transition-[width] duration-300 ease-in-out',
            searchHovered ? 'w-[400px]' : 'w-[72px]'
          )}
          onMouseEnter={() => setSearchHovered(true)}
        >
          {searchHovered ? (
            <div ref={searchDropdownRef} className="w-full flex-shrink-0">
              <SearchDropdown
                visible={searchHovered}
                onVisibleChange={setSearchHovered}
              />
            </div>
          ) : (
            <button
              type="button"
              className="flex cursor-pointer items-center whitespace-nowrap border-0 bg-transparent p-0 text-[var(--color-text-3)] outline-none"
              onClick={() => setSearchHovered(true)}
            >
              <IconSearch className="mr-[7px] text-[15px]" />
              <span className="text-[14px] leading-[22px]">搜索</span>
            </button>
          )}
        </div>

        <div
          className="flex flex-shrink-0 cursor-pointer items-center whitespace-nowrap text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text-3)]"
          onClick={handleDeveloperResource}
        >
          <DeveloperResourceIcon className="mr-[4px] text-[16px]" />
          <span className="text-[14px]">开发者资源</span>
        </div>
      </div>

      {modalVisible && sceneDetail && (
        <SceneModal
          visible={modalVisible}
          mode="edit"
          initialValues={{
            name: sceneDetail.name || '',
            description: sceneDetail.description || '',
            icon: sceneDetail.icon || ''
          }}
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
          loading={submitLoading}
        />
      )}

      <SceneVersionPanel
        visible={versionPanelVisible}
        sceneId={sceneId}
        onClose={handleCloseVersionPanel}
        onStoreChange={handleVersionStoreChange}
      />
    </LayoutHeader>
  );
}
