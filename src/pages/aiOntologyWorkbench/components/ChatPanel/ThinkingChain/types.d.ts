/**
 * ThinkingChain 组件类型声明
 * 通用的思维链组件，支持多种步骤类型
 */
import { ThinkingStep } from '@/hooks/chat/types';

// 步骤状态
export type StepStatus = 'running' | 'success' | 'error';

// 步骤类型常量
export const STEP_TYPES = {
  THINKING: 'thinking',
  ONTOLOGY: 'ontology',
  KNOWLEDGE: 'knowledge',
  WORKFLOW: 'workflow',
  MCP: 'mcp',
  HTTP: 'http'
} as const;

export type StepType = (typeof STEP_TYPES)[keyof typeof STEP_TYPES];

export interface ThinkingChainProps {
  steps: ThinkingStep[];
  allDone?: boolean;
}

export interface ThinkingChainNodeProps {
  step: ThinkingStep;
  isLast: boolean;
}
