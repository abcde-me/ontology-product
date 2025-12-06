/**
 * 任务分配模块工具函数
 */

import {
  TaskPackage,
  RoleAssignment,
  ValidationErrors,
  ProcessOption
} from './types';
import { ROLE_NAME_MAP } from './constants';

/**
 * 生成任务包列表
 * @param splitCount 拆分任务包数量
 * @param qualityRounds 质检轮次（0/1/2/3）
 * @param totalDataAmount 总数据量
 * @param existingPackages 现有的任务包（用于保留已选数据）
 * @returns 任务包列表
 */
export const generateTaskPackages = (
  splitCount: number,
  qualityRounds: number,
  totalDataAmount: number,
  existingPackages: TaskPackage[] = []
): TaskPackage[] => {
  if (!splitCount || !totalDataAmount || splitCount < 1) {
    return [];
  }

  const packages: TaskPackage[] = [];
  const dataPerPackage = Math.floor(totalDataAmount / splitCount);
  const remainder = totalDataAmount % splitCount;

  for (let i = 1; i <= splitCount; i++) {
    const taskId = String(i);
    const existingPackage = existingPackages.find(
      (pkg) => pkg.taskId === taskId
    );

    // 生成角色列表：标注人员 + N轮质检
    const roles: RoleAssignment[] = [];

    // 标注人员（必有）
    const existingLabeler = existingPackage?.roles.find(
      (r) => r.roleType === 'labeler'
    );
    roles.push(
      existingLabeler || {
        roleType: 'labeler',
        roleName: '标注人员',
        assignType: 'department',
        selectedDepartments: [],
        selectedPersons: [],
        selectedCount: 0
      }
    );

    // 根据质检轮次添加质检角色（保留已有数据）
    for (let round = 1; round <= qualityRounds; round++) {
      const roleType = `inspector_${round}` as any;
      const existingRole = existingPackage?.roles.find(
        (r) => r.roleType === roleType
      );

      roles.push(
        existingRole || {
          roleType,
          roleName: `${round}轮质检人员`,
          assignType: 'department',
          selectedDepartments: [],
          selectedPersons: [],
          selectedCount: 0
        }
      );
    }

    packages.unshift({
      taskId,
      taskBId: `${i}`,
      dataAmount:
        i === splitCount
          ? dataPerPackage + remainder // 最后一个包含剩余数据
          : dataPerPackage,
      roles
    });
  }

  return packages;
};

/**
 * 验证任务分配
 * @param taskPackages 任务包列表
 * @returns 错误映射表
 */
export const validateTaskAssignment = (
  taskPackages: TaskPackage[]
): ValidationErrors => {
  const errors: ValidationErrors = {};

  taskPackages.forEach((task) => {
    task.roles.forEach((role) => {
      const key = `${task.taskId}-${role.roleType}`;

      // 根据 assignType 判断对应的选择是否为空
      const hasSelection =
        role.assignType === 'department'
          ? (role.selectedDepartments?.length || 0) > 0
          : (role.selectedPersons?.length || 0) > 0;

      // 标注人员必选
      if (role.roleType === 'labeler' && !hasSelection) {
        errors[key] = '请选择标注人员';
      }

      // 质检人员根据轮次决定是否必选（如果有该轮次则必选）
      if (role.roleType.startsWith('inspector') && !hasSelection) {
        errors[key] = `请选择${role.roleName}`;
      }
    });
  });

  return errors;
};

/**
 * 生成工序选项列表（用于批量分配）
 * @param taskPackages 任务包列表
 * @returns 工序选项列表
 */
export const generateProcessOptions = (
  taskPackages: TaskPackage[]
): ProcessOption[] => {
  const options: ProcessOption[] = [];

  taskPackages.forEach((task) => {
    task.roles.forEach((role) => {
      options.push({
        label: `${task.taskBId}~${role.roleName}`,
        value: `${task.taskId}-${role.roleType}`,
        taskId: task.taskId,
        roleType: role.roleType
      });
    });
  });

  return options;
};

/**
 * 格式化角色分配数据
 * @param role 角色分配信息
 * @returns 格式化后的操作数据
 */
const formatOperateData = (role: RoleAssignment) => {
  // own_type: 1-个人, 2-部门
  const ownType = role.assignType === 'person' ? 1 : 2;
  return {
    user_id: role.assignType === 'person' ? role.selectedPersons : [],
    org_id: role.assignType === 'department' ? role.selectedDepartments : [],
    own_type: ownType
  };
};

/**
 * 格式化提交数据
 * @param taskPackages 任务包列表
 * @param timeoutRelease 超时释放时间
 * @returns 格式化后的数据
 */
export const formatSubmitData = (
  taskPackages: TaskPackage[],
  timeoutRelease: number
) => {
  const pkg_infos = taskPackages.map((task) => {
    // 找到标注人员
    const labelerRole = task.roles.find((role) => role.roleType === 'labeler');

    // 找到所有质检人员，按轮次排序
    const inspectorRoles = task.roles
      .filter((role) => role.roleType.startsWith('inspector'))
      .sort((a, b) => {
        const aRound = parseInt(a.roleType.split('_')[1]) || 0;
        const bRound = parseInt(b.roleType.split('_')[1]) || 0;
        return aRound - bRound;
      });

    return {
      front_pkg_id: parseInt(task.taskId),
      pkg_task_cnt: task.dataAmount,
      label_operate: labelerRole
        ? formatOperateData(labelerRole)
        : { user_id: [], org_id: [], own_type: 2 },
      qc_operate: inspectorRoles.map((role) => formatOperateData(role))
    };
  });

  return {
    timeout_release: timeoutRelease,
    pkg_infos
  };
};

/**
 * 解析详情数据（用于编辑模式回显）
 * @param detailData 详情数据
 * @returns 任务包列表
 */
export const parseDetailData = (detailData: any): TaskPackage[] => {
  if (!detailData?.task_packages) {
    return [];
  }

  return detailData.task_packages.map((pkg: any) => ({
    taskId: pkg.task_id,
    taskBId: pkg.task_b_id,
    dataAmount: pkg.data_amount,
    roles: pkg.assignments.map((assignment: any) => ({
      roleType: assignment.role_type,
      roleName:
        ROLE_NAME_MAP[assignment.role_type as keyof typeof ROLE_NAME_MAP] ||
        assignment.role_type,
      assignType: assignment.org_ids?.length > 0 ? 'department' : 'person',
      selectedDepartments: assignment.org_ids || [],
      selectedPersons: assignment.user_ids || [],
      selectedCount:
        (assignment.org_ids?.length || 0) + (assignment.user_ids?.length || 0)
    }))
  }));
};
