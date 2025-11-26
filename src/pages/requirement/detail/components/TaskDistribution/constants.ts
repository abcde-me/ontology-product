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

// 角色颜色映射
export const ROLE_COLOR_MAP: Record<RoleType, string> = {
  labeler: '#165DFF', // 主色（蓝色）
  inspector_1: '#00B42A', // 成功色（绿色）
  inspector_2: '#FF7D00', // 警告色（橙色）
  inspector_3: '#722ED1' // 紫色
};

// 角色图标映射（使用Arco Design图标）
export const ROLE_ICON_MAP: Record<RoleType, string> = {
  labeler: 'user',
  inspector_1: 'check-circle',
  inspector_2: 'check-circle',
  inspector_3: 'check-circle'
};

// 获取角色名称
export const getRoleName = (roleType: string): string => {
  return ROLE_NAME_MAP[roleType as RoleType] || roleType;
};

// 获取角色颜色
export const getRoleColor = (roleType: RoleType): string => {
  return ROLE_COLOR_MAP[roleType] || '#165DFF';
};
