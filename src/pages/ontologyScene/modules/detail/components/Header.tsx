import React, { useState, useRef } from 'react';
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
import SearchDropdown from './SearchDropdown';
import { EllipsisPopover } from '@ceai-front/arco-material';
import DeveloperResourceIcon from '@/pages/ontologyScene/assets/developer-resource.svg';
import { openNewPage } from '@/utils/env';

const { Header: LayoutHeader } = Layout;

interface HeaderProps {
  title?: string;
  status?: string;
  onTitleEdit?: (title: string) => void;
  onPublish?: () => void;
  sceneId?: number;
  sceneDetail?: OntologScene | null;
  onSceneUpdate?: () => void;
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    history.push('/tenant/compute/modaforge/ontologyScene/list');
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

      if (response.status === 200 && response.code === '') {
        Message.success('修改成功');
        setModalVisible(false);
        // 更新标题
        if (onTitleEdit) {
          onTitleEdit(data.name);
        }
        // 触发场景更新回调
        if (onSceneUpdate) {
          onSceneUpdate();
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
    openNewPage('https://my.feishu.cn/docx/XzAqdVIHmoptbAxFNeCcTIfEnjb');
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
        'z-[2] flex h-[56px] items-center justify-between border-b border-[var(--color-border-2)] bg-white px-[16px] shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]'
      )}
    >
      {/* 左侧区域 */}
      <div className="flex items-center">
        <Popover trigger="hover" content="返回">
          <IconArrowLeft
            className="mx-[9px] cursor-pointer text-[14px] text-[var(--color-text-2)] hover:text-primary-600"
            onClick={handleBack}
          />
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
              wrapperClassName="max-w-[455px] ml-[12px] mr-[8px]"
              className="w-full text-[16px] font-[600] text-[var(--color-text-1)]"
            />

            <Popover trigger="hover" content="编辑">
              <IconEdit
                className="cursor-pointer text-[16px] text-[var(--color-text-2)] hover:text-primary-600"
                onClick={handleEdit}
              />
            </Popover>
          </>
        )}
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-x-[18px]">
        <div
          ref={searchContainerRef}
          className="relative"
          onMouseEnter={() => setSearchHovered(true)}
        >
          {/* 搜索图标，绝对定位 */}
          <div
            className="top-50% absolute right-0 flex -translate-y-1/2 cursor-pointer items-center text-[var(--color-text-3)] transition-all duration-300 ease-in-out hover:text-[var(--color-text-3)]"
            style={{
              opacity: searchHovered ? 0 : 1,
              visibility: searchHovered ? 'hidden' : 'visible',
              pointerEvents: searchHovered ? 'none' : 'auto',
              whiteSpace: 'nowrap',
              transition:
                'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
            }}
          >
            <IconSearch className="mr-[7px] text-[15px]" />
            <span className="text-[14px] leading-[22px]">搜索</span>
          </div>
          {/* SearchDropdown，绝对定位，可以超出容器 */}
          <div
            ref={searchDropdownRef}
            className="top-50% absolute right-0 z-10 -translate-y-1/2"
            style={{
              opacity: searchHovered ? 1 : 0,
              visibility: searchHovered ? 'visible' : 'hidden',
              pointerEvents: searchHovered ? 'auto' : 'none',
              transition:
                'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
            }}
          >
            <SearchDropdown
              visible={searchHovered}
              onVisibleChange={setSearchHovered}
            />
          </div>
        </div>

        <div
          className="flex cursor-pointer items-center text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text-3)]"
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
    </LayoutHeader>
  );
}
