import React from 'react';
import { Tag } from '@arco-design/web-react';
import { IconExport, IconLocation } from '@arco-design/web-react/icon';
import styles from './OntologyActionCard.module.scss';

// 操作类型枚举
export enum OntologyActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  GET = 'get',
  LIST = 'list'
}

// 操作类型中文映射
const ACTION_TEXT_MAP: Record<string, string> = {
  [OntologyActionType.CREATE]: '新增',
  [OntologyActionType.UPDATE]: '更新',
  [OntologyActionType.DELETE]: '删除',
  [OntologyActionType.GET]: '查询'
};

// 操作类型标签颜色映射
const ACTION_COLOR_MAP: Record<string, string> = {
  [OntologyActionType.CREATE]: 'green',
  [OntologyActionType.UPDATE]: 'blue',
  [OntologyActionType.DELETE]: 'red',
  [OntologyActionType.GET]: 'arcoblue'
};

export interface OntologyAction {
  action_type: string;
  code: string;
  name: string;
  toolName?: string;
}

interface OntologyActionCardProps {
  action: OntologyAction;
  onLocate?: (code: string) => void;
}

const OntologyActionCard: React.FC<OntologyActionCardProps> = ({
  action,
  onLocate
}) => {
  const { action_type: actionType, name, code } = action;

  // 忽略 list 操作
  if (actionType === OntologyActionType.LIST) {
    return null;
  }

  // 是否显示右侧操作图标（create、update、get 显示）
  const showActions =
    actionType === OntologyActionType.CREATE ||
    actionType === OntologyActionType.UPDATE ||
    actionType === OntologyActionType.GET;

  const actionText = ACTION_TEXT_MAP[actionType] || actionType;
  const actionColor = ACTION_COLOR_MAP[actionType] || 'gray';

  // 处理定位点击
  const handleLocate = () => {
    console.log('[OntologyActionCard] 点击定位，code:', code);
    onLocate?.(code);
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        {/* 左侧图标 + 名称 + 标签 */}
        <div className={styles.leftSection}>
          {/* 对象图标 */}
          <div className={styles.iconWrapper}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1.5L2 4.5V11.5L8 14.5L14 11.5V4.5L8 1.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M8 8L2 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 8V14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 8L14 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* 名称 */}
          <span className={styles.name}>{name}</span>

          {/* 操作标签 */}
          <Tag color={actionColor} size="small">
            {actionText}
          </Tag>
        </div>

        {/* 右侧操作图标 */}
        {showActions && (
          <div className={styles.rightSection}>
            {/* 导出图标 */}
            <div className={styles.actionIcon}>
              <IconExport style={{ fontSize: 14 }} />
            </div>

            {/* 定位图标 */}
            <div className={styles.actionIcon} onClick={handleLocate}>
              <IconLocation style={{ fontSize: 14 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OntologyActionCard;
