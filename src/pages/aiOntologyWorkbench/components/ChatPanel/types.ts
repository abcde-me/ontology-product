/**
 * ChatPanel 组件类型定义
 * 注意：ChatMessage、ThinkingStep、ToolCall 等类型请使用 @/hooks/chat/types
 */

/**
 * 提示词项
 */
export interface PromptItem {
  id: string;
  value: string;
  disabled?: boolean;
}
