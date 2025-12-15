/**
 * 任务分配模块类型定义
 */

// 角色类型
export type RoleType =
  | 'labeler'
  | 'inspector_1'
  | 'inspector_2'
  | 'inspector_3';

// 分配类型
export type AssignType = 'department' | 'person';

// 角色分配数据结构
export interface RoleAssignment {
  roleType: RoleType; // 角色类型
  roleName: string; // 角色名称（标注人员、1轮质检人员等）
  assignType: AssignType; // 分配类型：部门/个人
  selectedDepartments: string[]; // 已选部门ID列表
  selectedPersons: string[]; // 已选个人ID列表
  selectedCount: number; // 已选数量
  error?: string; // 错误信息
}

// 任务包数据结构
export interface TaskPackage {
  taskId: string; // 任务ID（自增序号：1, 2, 3...）
  taskBId: string; // 任务包ID（格式：任务包1、任务包2...）
  dataAmount: number; // 数据量（总数据量 ÷ 任务包数）
  roles: RoleAssignment[]; // 角色分配列表（动态生成：标注人员 + N轮质检）
}

// 表单状态数据结构
export interface TaskDistributionForm {
  task_effective_minute: number; // 超时释放时间（分钟）
  taskPackages: TaskPackage[]; // 任务包列表（动态生成）
}

// 批量分配数据结构
export interface BatchAssignData {
  selectedProcesses: string[]; // 选中的工序ID列表（格式：taskId-roleType）
  assignType: AssignType;
  selectedDepartments: string[];
  selectedPersons: string[];
}

// 工序选项
export interface ProcessOption {
  label: string; // 显示文本：任务包1~标注人员
  value: string; // 值：1-labeler
  taskId: string;
  roleType: RoleType;
  isConfigured: boolean; // 是否已配置（已选部门或个人）
}

// 验证错误
export type ValidationErrors = Record<string, string>;
