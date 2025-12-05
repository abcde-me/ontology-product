/**
 * 角色分配卡片组件
 */

import { Button } from '@arco-design/web-react';
import React, { useState } from 'react';
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

  // 处理分配类型切换
  const handleAssignTypeChange = (value: AssignType) => {
    setAssignType(value);
    // 切换类型时清空已选数据
    onUpdate({
      assignType: value,
      selectedDepartments: [],
      selectedPersons: [],
      selectedCount: 0
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

  return (
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
          {/* <Radio.Group
            type="button"
            value={assignType}
            onChange={handleAssignTypeChange}
            disabled={disabled}
          >
            <Radio value="department">部门</Radio>
            <Radio value="person">个人</Radio>
          </Radio.Group> */}
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
          <span className="selected-count">已选 {role.selectedCount}</span>
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
