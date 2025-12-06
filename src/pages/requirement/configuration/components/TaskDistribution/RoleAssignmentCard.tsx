/**
 * 角色分配卡片组件
 */

import { Button } from '@arco-design/web-react';
import React, { useState, useEffect } from 'react';
import { DepartmentModal } from '../DepartmentModal';
import { IndividualModal } from '../IndividualModal';
import { AssignType, RoleAssignment } from './types';

import AnnotationUserIcon from '@/assets/annotation/annotation-user.svg';
import QualityUserIcon from '@/assets/annotation/quality-user.svg';
import { RadioGroupTab } from '@ceai-front/arco-material';
interface RoleAssignmentCardProps {
  role: RoleAssignment;
  onUpdate: (data: Partial<RoleAssignment>) => void;
  error?: string;
  disabled?: boolean;
}

const RoleAssignmentCard: React.FC<RoleAssignmentCardProps> = ({
  role,
  onUpdate,
  error,
  disabled = false
}) => {
  const [assignType, setAssignType] = useState<AssignType>(
    role.assignType || 'department'
  );
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [individualModalVisible, setIndividualModalVisible] = useState(false);

  // 同步 role.assignType 到本地状态（解决数据回显问题）
  useEffect(() => {
    setAssignType(role.assignType || 'department');
  }, [role.assignType]);

  // 处理分配类型切换
  const handleAssignTypeChange = (value: AssignType) => {
    setAssignType(value);
    // 切换类型时，只更新 assignType，保留两边的选择数据
    // 只有在确认选择时才清空另一个类型的数据
    const newSelectedCount =
      value === 'department'
        ? role.selectedDepartments?.length || 0
        : role.selectedPersons?.length || 0;

    onUpdate({
      assignType: value,
      selectedCount: newSelectedCount
    });
  };

  // 处理部门选择确认
  const handleDepartmentConfirm = (selectedIds: string[]) => {
    onUpdate({
      assignType: 'department',
      selectedDepartments: selectedIds,
      selectedPersons: [],
      selectedCount: selectedIds.length,
      error: undefined // 清除错误信息
    });
    setDepartmentModalVisible(false);
  };

  // 处理个人选择确认
  const handlePersonConfirm = (selectedIds: string[]) => {
    onUpdate({
      assignType: 'person',
      selectedDepartments: [],
      selectedPersons: selectedIds,
      selectedCount: selectedIds.length,
      error: undefined // 清除错误信息
    });
    setIndividualModalVisible(false);
  };

  // 根据角色类型获取对应的图标
  const getRoleIcon = () => {
    if (role.roleType === 'labeler') {
      return <AnnotationUserIcon className="role-icon" />;
    }
    return <QualityUserIcon className="role-icon" />;
  };

  // 获取当前选中数量
  const selectedCount =
    assignType === 'department'
      ? role.selectedDepartments?.length || 0
      : role.selectedPersons?.length || 0;

  return (
    <div className="role-assignment-card-wrapper">
      <div className={`role-assignment-card ${error ? 'has-error' : ''}`}>
        <div className="role-header">
          {getRoleIcon()}
          <span className="role-name">{role.roleName}</span>
        </div>

        <div className="role-content">
          <div className="assign-type-selector">
            <RadioGroupTab
              type="button"
              className="assign-type-selector-radio-group"
              options={[
                { value: 'department', label: '部门' },
                { value: 'person', label: '个人' }
              ]}
              value={assignType}
              onChange={(value: string) =>
                handleAssignTypeChange(value as AssignType)
              }
            />
          </div>

          <div className="select-action">
            <Button
              onClick={() => {
                if (assignType === 'department') {
                  setDepartmentModalVisible(true);
                } else {
                  setIndividualModalVisible(true);
                }
              }}
              disabled={disabled}
            >
              {assignType === 'department' ? '选择部门' : '选择个人'}
            </Button>
            <span className="selected-count">已选 {selectedCount}</span>
          </div>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}

      {/* 部门选择弹窗 */}
      <DepartmentModal
        visible={departmentModalVisible}
        onClose={() => setDepartmentModalVisible(false)}
        onConfirm={handleDepartmentConfirm}
        initialSelected={role.selectedDepartments}
        title="选择部门"
        getChildTreeSelectData={() => {
          // 不在选择时立即触发，只在点击确认按钮时触发
        }}
        type="create"
      />

      {/* 个人选择弹窗 */}
      <IndividualModal
        visible={individualModalVisible}
        onClose={() => setIndividualModalVisible(false)}
        onConfirm={handlePersonConfirm}
        initialSelected={role.selectedPersons}
        title="选择个人"
        getChildTreeSelectData={() => {
          // 不在选择时立即触发，只在点击确认按钮时触发
        }}
        getTreeIds={() => {}}
        type="create"
      />
    </div>
  );
};

export default RoleAssignmentCard;
