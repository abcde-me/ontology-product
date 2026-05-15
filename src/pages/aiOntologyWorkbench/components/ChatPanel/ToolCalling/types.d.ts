/**
 * ToolCalling 组件类型声明
 * 用于确保 TypeScript 正确识别组件 props
 */
import { ToolCall } from '@/hooks/chat/types';

export interface ToolCallingProps {
  calls: ToolCall[];
  allDone?: boolean;
}
