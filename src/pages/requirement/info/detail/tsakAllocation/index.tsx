/**
 * 任务分配展示组件 - 只读展示
 */

import React, { useState } from 'react';
import { Table } from '@arco-design/web-react';
import AnnotationUserIcon from '@/assets/annotation/annotation-user.svg';
import QualityUserIcon from '@/assets/annotation/quality-user.svg';
import RightArrowIcon from '@/assets/annotation/right-arrow.svg';
import SelectedDepartmentModal from './SelectedDepartmentModal';
import SelectedPersonModal from './SelectedPersonModal';
import './styles.scss';

// 角色类型
type RoleType = 'labeler' | 'inspector_1' | 'inspector_2' | 'inspector_3';

// 分配类型
type AssignType = 'department' | 'person';

// 角色分配数据结构
interface RoleAssignment {
  roleType: RoleType;
  roleName: string;
  assignType: AssignType;
  selectedDepartments: string[];
  selectedPersons: string[];
  selectedCount: number;
}

// 任务包数据结构
interface TaskPackage {
  taskId: string;
  taskBId: string;
  dataAmount: number;
  roles: RoleAssignment[];
}

// 角色名称映射
const ROLE_NAME_MAP: Record<RoleType, string> = {
  labeler: '标注人员',
  inspector_1: '1轮质检人员',
  inspector_2: '2轮质检人员',
  inspector_3: '3轮质检人员'
};

/**
 * 判断是否为个人类型
 * own_type: 1-个人，2-部门
 * 注意：label_operate 中是 integer，qc_operate 中是 string，需要兼容两种类型
 */
const isPersonOwnType = (ownType: number | string | undefined): boolean => {
  return ownType === 1 || ownType === '1';
};

/**
 * 解析详情数据
 */
const parseDetailData = (detailData: any): TaskPackage[] => {
  if (!detailData?.pkg_infos || !Array.isArray(detailData.pkg_infos)) {
    return [];
  }

  return detailData.pkg_infos.map((pkg: any, index: number) => {
    const roles: RoleAssignment[] = [];

    // 标注人员
    if (pkg.label_operate) {
      const labelOperate = pkg.label_operate;
      const isPersonType = isPersonOwnType(labelOperate.own_type);
      roles.push({
        roleType: 'labeler',
        roleName: ROLE_NAME_MAP.labeler,
        assignType: isPersonType ? 'person' : 'department',
        selectedDepartments: labelOperate.org_id || [],
        selectedPersons: labelOperate.user_id || [],
        selectedCount: isPersonType
          ? labelOperate.user_id?.length || 0
          : labelOperate.org_id?.length || 0
      });
    }

    // 质检人员
    if (pkg.qc_operate && Array.isArray(pkg.qc_operate)) {
      pkg.qc_operate.forEach((qcOperate: any, qcIndex: number) => {
        const roleType = `inspector_${qcIndex + 1}` as RoleType;
        const isPersonType = isPersonOwnType(qcOperate.own_type);
        roles.push({
          roleType,
          roleName: ROLE_NAME_MAP[roleType] || `${qcIndex + 1}轮质检人员`,
          assignType: isPersonType ? 'person' : 'department',
          selectedDepartments: qcOperate.org_id || [],
          selectedPersons: qcOperate.user_id || [],
          selectedCount: isPersonType
            ? qcOperate.user_id?.length || 0
            : qcOperate.org_id?.length || 0
        });
      });
    }

    return {
      taskId: String(pkg.front_pkg_id || index + 1),
      taskBId: String(pkg.front_pkg_id || index + 1),
      dataAmount: pkg.pkg_task_cnt || 0,
      roles
    };
  });
};

// 角色展示卡片组件
interface RoleDisplayCardProps {
  role: RoleAssignment;
}

const RoleDisplayCard: React.FC<RoleDisplayCardProps> = ({ role }) => {
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [personModalVisible, setPersonModalVisible] = useState(false);

  // 根据角色类型获取对应的图标
  const getRoleIcon = () => {
    if (role.roleType === 'labeler') {
      return <AnnotationUserIcon className="role-icon" />;
    }
    return <QualityUserIcon className="role-icon" />;
  };

  // 处理点击数字
  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (role.assignType === 'department') {
      setDepartmentModalVisible(true);
    } else {
      setPersonModalVisible(true);
    }
  };

  // 获取分配摘要信息
  const getAssignmentSummary = () => {
    if (role.assignType === 'department') {
      const count = role.selectedDepartments?.length || 0;
      if (count === 0) return '未分配';

      return (
        <span
          className="assignment-count"
          onClick={handleCountClick}
          style={{ cursor: 'pointer' }}
        >
          已选<span className="count-number">{count}</span>个部门
        </span>
      );
    } else {
      const count = role.selectedPersons?.length || 0;
      if (count === 0) return '未分配';

      return (
        <span
          className="assignment-count"
          onClick={handleCountClick}
          style={{ cursor: 'pointer' }}
        >
          已选<span className="count-number">{count}</span>个人
        </span>
      );
    }
  };

  return (
    <div className="role-display-card">
      <div className="role-header">
        {getRoleIcon()}
        <span className="role-name">{role.roleName}</span>
      </div>
      <div className="role-content">
        <div className="assignment-summary">{getAssignmentSummary()}</div>
      </div>

      {/* 已选部门Modal */}
      <SelectedDepartmentModal
        visible={departmentModalVisible}
        onClose={() => setDepartmentModalVisible(false)}
        departmentIds={role.selectedDepartments}
      />

      {/* 已选个人Modal */}
      <SelectedPersonModal
        visible={personModalVisible}
        onClose={() => setPersonModalVisible(false)}
        personIds={role.selectedPersons}
      />
    </div>
  );
};

interface TaskAllocationProps {
  requirementDetail: any;
}

function TaskAllocation({ requirementDetail }: TaskAllocationProps) {
  const taskPackages = parseDetailData(requirementDetail);

  // 如果没有任务包数据，显示提示
  if (!taskPackages || taskPackages.length === 0) {
    return (
      <div className="task-allocation-empty">
        <span>暂无任务分配数据</span>
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
      title: '人员分配',
      dataIndex: 'roles',
      render: (roles: RoleAssignment[]) => (
        <div className="role-assignments-row">
          {roles.map((role, index) => (
            <React.Fragment key={role.roleType}>
              <RoleDisplayCard role={role} />
              {index < roles.length - 1 && (
                <div className="role-arrow">
                  <RightArrowIcon />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="task-allocation-panel">
      <Table
        columns={columns}
        data={taskPackages}
        rowKey="taskId"
        pagination={false}
        className="task-allocation-table"
        border={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default TaskAllocation;
