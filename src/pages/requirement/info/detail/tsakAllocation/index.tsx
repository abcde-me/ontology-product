/**
 * 任务分配展示组件 - 只读展示
 */

import React from 'react';
import { Table } from '@arco-design/web-react';
import AnnotationUserIcon from '@/assets/annotation/annotation-user.svg';
import QualityUserIcon from '@/assets/annotation/quality-user.svg';
import RightArrowIcon from '@/assets/annotation/right-arrow.svg';
import './styles.scss';
import { mockRequirementDetail } from './mockData';

// 开发调试：设置为 true 使用 mock 数据
const USE_MOCK = true;

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
  selectedDepartmentNames?: string[];
  selectedPersons: string[];
  selectedPersonNames?: string[];
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
      const isPersonType = labelOperate.own_type === 1;
      roles.push({
        roleType: 'labeler',
        roleName: ROLE_NAME_MAP.labeler,
        assignType: isPersonType ? 'person' : 'department',
        selectedDepartments: labelOperate.org_id || [],
        selectedDepartmentNames: labelOperate.org_names || [],
        selectedPersons: labelOperate.user_id || [],
        selectedPersonNames: labelOperate.user_names || [],
        selectedCount: isPersonType
          ? labelOperate.user_id?.length || 0
          : labelOperate.org_id?.length || 0
      });
    }

    // 质检人员
    if (pkg.qc_operate && Array.isArray(pkg.qc_operate)) {
      pkg.qc_operate.forEach((qcOperate: any, qcIndex: number) => {
        const roleType = `inspector_${qcIndex + 1}` as RoleType;
        const isPersonType = qcOperate.own_type === 1;
        roles.push({
          roleType,
          roleName: ROLE_NAME_MAP[roleType] || `${qcIndex + 1}轮质检人员`,
          assignType: isPersonType ? 'person' : 'department',
          selectedDepartments: qcOperate.org_id || [],
          selectedDepartmentNames: qcOperate.org_names || [],
          selectedPersons: qcOperate.user_id || [],
          selectedPersonNames: qcOperate.user_names || [],
          selectedCount: isPersonType
            ? qcOperate.user_id?.length || 0
            : qcOperate.org_id?.length || 0
        });
      });
    }

    return {
      taskId: String(pkg.front_pkg_id || index + 1),
      taskBId: pkg.pkg_name || `任务包${index + 1}`,
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
  // 根据角色类型获取对应的图标
  const getRoleIcon = () => {
    if (role.roleType === 'labeler') {
      return <AnnotationUserIcon className="role-icon" />;
    }
    return <QualityUserIcon className="role-icon" />;
  };

  // 获取分配摘要信息
  const getAssignmentSummary = () => {
    if (role.assignType === 'department') {
      const names = role.selectedDepartmentNames || [];
      const count = role.selectedDepartments?.length || 0;
      if (count === 0) return '未分配';

      // 显示第一个部门名称，如果有多个显示"共N个"
      const firstName = names[0] || `${count}组`;
      return (
        <>
          <span className="assignment-name">{firstName}</span>
          <span className="assignment-count">
            共<span className="count-number">{count}</span>个
          </span>
        </>
      );
    } else {
      const names = role.selectedPersonNames || [];
      const count = role.selectedPersons?.length || 0;
      if (count === 0) return '未分配';

      // 显示第一个人员名称
      const firstName = names[0] || '人员';
      return (
        <>
          <span className="assignment-name">{firstName}</span>
          <span className="assignment-count">
            共<span className="count-number">{count}</span>个
          </span>
        </>
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
    </div>
  );
};

interface TaskAllocationProps {
  requirementDetail: any;
}

function TaskAllocation({ requirementDetail }: TaskAllocationProps) {
  // 使用 mock 数据或真实数据
  const dataSource = USE_MOCK ? mockRequirementDetail : requirementDetail;
  const taskPackages = parseDetailData(dataSource);

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
