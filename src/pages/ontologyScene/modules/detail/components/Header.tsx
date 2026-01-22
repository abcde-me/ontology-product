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
        'flex h-[56px] items-center justify-between border-b border-gray-200 bg-white px-[20px]'
      )}
    >
      {/* 左侧区域 */}
      <div className="flex items-center gap-x-[16px]">
        <IconArrowLeft
          className="cursor-pointer text-[16px] text-gray-700 hover:text-primary-600"
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
            <span className="text-[16px] font-medium text-gray-900">
              {title}
            </span>
            <Popover trigger="hover" content="编辑">
              <IconEdit
                className="cursor-pointer text-[16px] text-gray-500 hover:text-primary-600"
                onClick={handleEdit}
              />
            </Popover>
            <span className="text-[14px] text-gray-500">{status}</span>
          </>
        )}
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center gap-x-[16px]">
        <Input.Group compact>
          <Select defaultValue="all" style={{ width: '76px' }}>
            <Select.Option value="all">全部</Select.Option>
          </Select>
          <Input.Search
            placeholder="请输入名称或唯一标识"
            style={{ width: '284px' }}
          />
        </Input.Group>

        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={onPublish}
          className="bg-primary-600 hover:bg-primary-700"
        >
          发布更新
        </Button>
      </div>
    </LayoutHeader>
  );
}
