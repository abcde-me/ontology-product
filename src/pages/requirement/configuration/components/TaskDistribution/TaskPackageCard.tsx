/**
 * 任务包卡片组件
 */

import React from 'react';
import { TaskPackage, RoleAssignment, ValidationErrors } from './types';
import RoleAssignmentCard from './RoleAssignmentCard';

interface TaskPackageCardProps {
  taskPackage: TaskPackage;
  onRoleUpdate: (
    taskId: string,
    roleType: string,
    data: Partial<RoleAssignment>
  ) => void;
  errors: ValidationErrors;
  disabled?: boolean;
}

const TaskPackageCard: React.FC<TaskPackageCardProps> = ({
  taskPackage,
  onRoleUpdate,
  errors,
  disabled = false
}) => {
  return (
    <div className="task-package-card">
      <div className="task-info">
        <div className="task-header">
          <span className="task-label">任务包ID</span>
          <span className="data-label">数据量</span>
          <span className="assignment-label">人员分配</span>
        </div>
        <div className="task-content">
          <div className="task-id-section">
            <span className="task-id">{taskPackage.taskBId}</span>
          </div>
          <div className="data-amount-section">
            <span className="data-amount">{taskPackage.dataAmount}</span>
          </div>
          <div className="role-assignments-section">
            <div className="role-assignments">
              {taskPackage.roles.map((role, index) => (
                <React.Fragment key={role.roleType}>
                  <RoleAssignmentCard
                    role={role}
                    onUpdate={(data) =>
                      onRoleUpdate(taskPackage.taskId, role.roleType, data)
                    }
                    error={errors[`${taskPackage.taskId}-${role.roleType}`]}
                    disabled={disabled}
                  />
                  {index < taskPackage.roles.length - 1 && (
                    <div className="role-arrow">▶</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPackageCard;
