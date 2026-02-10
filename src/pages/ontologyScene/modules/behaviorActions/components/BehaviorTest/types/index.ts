// 复用外层的 BehaviorActionItem 类型
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';

// 扩展行为项（添加测试相关字段）
export interface BehaviorItem extends BehaviorActionItem {
  icon?: string;
  color?: string;
  configSchema?: ConfigSchema; // 配置表单的 schema
  validationRules?: ValidationRule[]; // 校验规则
  functionCode?: string; // 函数代码
  // 不知道是啥
  identifier?: string;
  // 不加构建报错 todo
  description: string;
  name: string;
}

// 编排节点
export interface OrchestrationNode {
  id: string; // 节点唯一 ID（UUID）
  behaviorId: string; // 关联的行为 ID
  behavior: BehaviorItem; // 行为数据
  order: number; // 排序
  isConfigured: boolean; // 是否已配置
  isExpanded: boolean; // 是否展开详情
}

// 节点配置
export interface NodeConfig {
  [key: string]: any; // 动态配置字段
}

// 配置表单 Schema
export interface ConfigSchema {
  fields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'switch' | 'date' | 'upload' | 'custom';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  defaultValue?: any;
  validation?: (value: any) => boolean | string;
  dataType?: string; // 数据类型（STRING, NUMBER, etc.）
  widget?: string; // 界面控件（数字选择器、下拉选择等）
}

// 校验规则
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  expression: string;
}

// 测试结果
export interface TestResult {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'pending';
  output?: any;
  error?: string;
  duration?: number;
}

// 测试历史记录
export interface HistoryItem {
  id: string;
  createdAt: string;
  nodeCount: number;
  status: 'success' | 'error';
  duration: number;
  nodes: {
    behaviorId: string;
    config: NodeConfig;
  }[];
  results: TestResult[];
}
