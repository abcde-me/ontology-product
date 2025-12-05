/**
 * 任务分配面板主组件 - 使用表格布局
 */

import RightArrowIcon from '@/assets/annotation/right-arrow.svg';
import { Button, Table } from '@arco-design/web-react';
import React, { useCallback, useState } from 'react';
import BatchAssignModal from './BatchAssignModal';
import RoleAssignmentCard from './RoleAssignmentCard';
import './styles.scss';
import {
  BatchAssignData,
  RoleAssignment,
  TaskPackage,
  ValidationErrors
} from './types';

interface TaskDistributionPanelProps {
  taskPackages: TaskPackage[];
  onUpdate: (packages: TaskPackage[]) => void;
  validationErrors?: ValidationErrors;
  disabled?: boolean;
}

const TaskDistributionPanel: React.FC<TaskDistributionPanelProps> = ({
  taskPackages,
  onUpdate,
  validationErrors = {},
  disabled = false
}) => {
  const [batchModalVisible, setBatchModalVisible] = useState(false);

  // 处理单个角色更新
  const handleRoleUpdate = useCallback(
    (taskId: string, roleType: string, data: Partial<RoleAssignment>) => {
      const updatedPackages = taskPackages.map((pkg) => {
        if (pkg.taskId === taskId) {
          return {
            ...pkg,
            roles: pkg.roles.map((role) => {
              if (role.roleType === roleType) {
                return { ...role, ...data };
              }
              return role;
            })
          };
        }
        return pkg;
      });

      onUpdate(updatedPackages);

      // 如果选择了人员，清除该角色的验证错误
      if (data.selectedCount && data.selectedCount > 0) {
        // 通过删除错误属性来清除错误（在父组件中处理）
      }
    },
    [taskPackages, onUpdate]
  );

  // 处理批量分配
  const handleBatchAssign = useCallback(
    (data: BatchAssignData) => {
      const updatedPackages = taskPackages.map((pkg) => {
        return {
          ...pkg,
          roles: pkg.roles.map((role) => {
            const processKey = `${pkg.taskId}-${role.roleType}`;

            // 如果该角色在选中的工序列表中
            if (data.selectedProcesses.includes(processKey)) {
              return {
                ...role,
                assignType: data.assignType,
                selectedDepartments:
                  data.assignType === 'department'
                    ? data.selectedDepartments
                    : [],
                selectedPersons:
                  data.assignType === 'person' ? data.selectedPersons : [],
                selectedCount:
                  data.assignType === 'department'
                    ? data.selectedDepartments.length
                    : data.selectedPersons.length
              };
            }

            return role;
          })
        };
      });

      onUpdate(updatedPackages);
    },
    [taskPackages, onUpdate]
  );

  // 如果没有任务包，显示提示
  if (!taskPackages || taskPackages.length === 0) {
    return (
      <div className="data-content-set">
        <span style={{ color: '#86909c' }}>请先选择标注数据</span>
      </div>
    );
  }

  // 定义表格列
  const columns = [
    {
      title: '任务包ID',
      dataIndex: 'taskBId',
      width: 120
    },
    {
      title: '数据量',
      dataIndex: 'dataAmount',
      width: 80
    },
    {
      title: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>人员分配</span>
          <Button
            type="text"
            onClick={() => setBatchModalVisible(true)}
            disabled={disabled}
          >
            批量分配
          </Button>
        </div>
      ),
      dataIndex: 'roles',
      width: 800,
      render: (roles: RoleAssignment[], record: TaskPackage) => (
        <div className="role-assignments-row">
          {roles.map((role, index) => (
            <React.Fragment key={role.roleType}>
              <RoleAssignmentCard
                role={role}
                onUpdate={(data) =>
                  handleRoleUpdate(record.taskId, role.roleType, data)
                }
                error={validationErrors[`${record.taskId}-${role.roleType}`]}
                disabled={disabled}
              />
              {index < roles.length - 1 && <RightArrowIcon />}
            </React.Fragment>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="task-distribution-panel">
      {/* 表格形式展示任务包 */}
      <Table
        columns={columns}
        data={taskPackages}
        rowKey="taskId"
        pagination={false}
        className="task-distribution-table"
        border={false}
      />

      {/* 批量分配弹窗 */}
      <BatchAssignModal
        visible={batchModalVisible}
        onClose={() => setBatchModalVisible(false)}
        taskPackages={taskPackages}
        onConfirm={handleBatchAssign}
      />
    </div>
  );
};

export default TaskDistributionPanel;
