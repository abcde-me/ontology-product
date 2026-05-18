import React from 'react';
import { IconExport, IconLocation } from '@arco-design/web-react/icon';
import { GlobalTooltip } from '@ceai-front/arco-material';
import {
  OntologyAction,
  OntologyActionType,
  OntologyTargetType
} from '@/hooks/chat/types';
import ObjectIcon from '../../../assets/object.svg';
import LinkIcon from '../../../assets/link.svg';
import BehaviorIcon from '../../../assets/behavior.svg';
import FunctionIcon from '../../../assets/function.svg';
import styles from './OntologyActionCard.module.scss';

// 操作类型中文映射
const ACTION_TEXT_MAP: Record<string, string> = {
  [OntologyActionType.CREATE]: '新增',
  [OntologyActionType.UPDATE]: '更改',
  [OntologyActionType.DELETE]: '删除',
  [OntologyActionType.GET]: '查询'
};

// 目标类型图标映射
const TARGET_ICON_MAP: Record<string, any> = {
  [OntologyTargetType.OBJECT_TYPE]: ObjectIcon,
  [OntologyTargetType.LINK]: LinkIcon,
  [OntologyTargetType.ACTION]: BehaviorIcon,
  [OntologyTargetType.FUNCTION]: FunctionIcon
};

interface OntologyActionCardProps {
  action: OntologyAction;
  ontologyId?: number | string; // 本体 ID
  onLocate?: (code: string) => void;
  onView?: (action: OntologyAction) => void; // 查看回调
}

const OntologyActionCard: React.FC<OntologyActionCardProps> = ({
  action,
  ontologyId,
  onLocate,
  onView
}) => {
  const {
    action_type: actionType,
    target_type: targetType,
    name,
    code
  } = action;

  // 忽略 list 操作
  if (actionType === OntologyActionType.LIST) {
    return null;
  }

  // 是否显示导出图标（查看）- create、update、get、delete 显示
  const showExport =
    actionType === OntologyActionType.CREATE ||
    actionType === OntologyActionType.UPDATE ||
    actionType === OntologyActionType.GET ||
    actionType === OntologyActionType.DELETE;

  // 是否显示定位图标
  // 1. 只有 object_type 和 link 类型才可能显示
  // 2. delete 操作不显示定位图标
  const showLocate =
    actionType !== OntologyActionType.DELETE &&
    (targetType === OntologyTargetType.OBJECT_TYPE ||
      targetType === OntologyTargetType.LINK);

  const actionText = ACTION_TEXT_MAP[actionType] || actionType;

  // 根据 target_type 获取对应的图标组件
  const IconComponent = TARGET_ICON_MAP[targetType] || ObjectIcon;

  // 处理定位点击
  const handleLocate = () => {
    console.log(
      '[OntologyActionCard] 点击定位，code:',
      code,
      'targetType:',
      targetType
    );
    onLocate?.(code);
  };

  // 处理查看点击
  const handleView = () => {
    console.log(
      '[OntologyActionCard] 点击查看，action:',
      action,
      'ontologyId:',
      ontologyId
    );
    onView?.(action);
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        {/* 左侧图标 + 名称 + 标签 */}
        <div className={styles.leftSection}>
          {/* 对象图标 - 根据 target_type 动态显示 */}
          <div className={styles.iconWrapper}>
            <IconComponent className={styles.icon} />
          </div>

          {/* 名称 - 带 Tooltip */}
          <GlobalTooltip.Ellipsis text={name}>
            <span className={styles.name}>{name}</span>
          </GlobalTooltip.Ellipsis>

          {/* 操作标签 - 查询操作不显示 */}
          {actionType !== OntologyActionType.GET && (
            <div className={styles.tag} data-action-type={actionType}>
              {actionText}
            </div>
          )}
        </div>

        {/* 右侧操作图标 */}
        {(showExport || showLocate) && (
          <div className={styles.rightSection}>
            {/* 导出图标（查看） */}
            {showExport && (
              <div className={styles.actionIcon} onClick={handleView}>
                <IconExport style={{ fontSize: 14 }} />
              </div>
            )}

            {/* 定位图标 - 只有 object_type 和 link 显示 */}
            {showLocate && (
              <div className={styles.actionIcon} onClick={handleLocate}>
                <IconLocation style={{ fontSize: 14 }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OntologyActionCard;
