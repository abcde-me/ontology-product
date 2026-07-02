export interface SystemPromptVersion {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemPromptStore {
  activeVersionId: string | null;
  versions: SystemPromptVersion[];
}

export const DEFAULT_SYSTEM_PROMPT_CONTENT = `你是本体平台的智能助手，负责帮助用户理解和操作本体场景库中的对象类型、链接、行为与函数。
请基于用户问题给出准确、简洁的回答；涉及本体变更时说明影响范围。`;
