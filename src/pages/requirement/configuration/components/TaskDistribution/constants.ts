/**
 * 任务分配模块常量定义
 */

import { RoleType } from './types';

// 角色名称映射
export const ROLE_NAME_MAP: Record<RoleType, string> = {
  labeler: '标注人员',
  inspector_1: '1轮质检人员',
  inspector_2: '2轮质检人员',
  inspector_3: '3轮质检人员'
};

// 获取角色名称
export const getRoleName = (roleType: string): string => {
  return ROLE_NAME_MAP[roleType as RoleType] || roleType;
};
