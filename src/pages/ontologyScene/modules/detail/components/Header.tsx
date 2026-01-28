import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Layout,
  Input,
  Button,
  Select,
  Tooltip,
  Popover
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

const { Header: LayoutHeader } = Layout;

interface HeaderProps {
  title?: string;
  status?: string;
  onTitleEdit?: (title: string) => void;
  onPublish?: () => void;
}

export default function Header({
  title = '新建本体场景',
  status = '未发布',
  onTitleEdit,
  onPublish
}: HeaderProps) {
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [searchValue, setSearchValue] = useState('');

  const handleBack = () => {
    history.push('/tenant/compute/modaforge/ontologyScene/list');
  };

  const handleEdit = () => {
    setIsEditing(true);
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

  return (
    <LayoutHeader
      className={cls(
        'flex h-[56px] items-center justify-between border-b border-[var(--color-border-2)] bg-white px-[16px]'
      )}
    >
      {/* 左侧区域 */}
      <div className="flex items-center">
        <IconArrowLeft
          className="mx-[9px] cursor-pointer text-[14px] text-[var(--color-text-2)]"
          onClick={handleBack}
        />
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
            <span className="ml-[12px] mr-[8px] text-[16px] font-medium text-gray-900">
              {title}
            </span>
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
          className="flex cursor-pointer items-center text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text-1)]"
          onClick={() => {
            // 搜索功能处理
            console.log('搜索');
          }}
        >
          <IconSearch className="mr-[7px] text-[15px]" />
          <span className="text-[14px]">搜索</span>
        </div>

        <div
          className="flex cursor-pointer items-center text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text-1)]"
          onClick={() => {
            // 开发者资源功能处理
            console.log('开发者资源');
          }}
        >
          <IconCode className="mr-[7px] text-[15px]" />
          <span className="text-[14px]">开发者资源</span>
        </div>
      </div>
    </LayoutHeader>
  );
}
