import type { JointNlParseResult } from '@/types/jointOperationsKnowledge';

const splitNameContent = (input: string) => {
  const byColon = input.split(/[:：]/);
  if (byColon.length >= 2) {
    return {
      name: byColon[0].trim(),
      content: byColon.slice(1).join('：').trim()
    };
  }

  return {
    name: input.slice(0, 24).trim() || '未命名',
    content: input.trim()
  };
};

export const parseJointOperationsNaturalLanguage = (
  text: string
): JointNlParseResult => {
  const trimmed = text.trim();
  if (!trimmed) {
    return { intent: 'unknown', message: '请输入自然语言指令' };
  }

  const createAxiomMatch = trimmed.match(
    /^(?:创建|新建|添加)(?:公理|本体公理)[:：]?\s*(.+)$/i
  );
  if (createAxiomMatch) {
    const { name, content } = splitNameContent(createAxiomMatch[1]);
    return {
      intent: 'create_axiom',
      name,
      content,
      message: `将创建公理「${name}」`
    };
  }

  const updateAxiomMatch = trimmed.match(
    /^(?:更新|修改)(?:公理|本体公理)\s*(.+?)[:：]\s*(.+)$/i
  );
  if (updateAxiomMatch) {
    return {
      intent: 'update_axiom',
      name: updateAxiomMatch[1].trim(),
      content: updateAxiomMatch[2].trim(),
      message: `将更新公理「${updateAxiomMatch[1].trim()}」`
    };
  }

  const createRuleMatch = trimmed.match(
    /^(?:创建|新建|添加)(?:场景规则|规则)[:：]?\s*(.+)$/i
  );
  if (createRuleMatch) {
    const { name, content } = splitNameContent(createRuleMatch[1]);
    const [condition, action] = content.split(/[，,；;]\s*则\s*/);
    return {
      intent: 'create_scene_rule',
      name,
      condition: condition?.trim() || content,
      action: action?.trim() || '按规则聚合跨域查询结果',
      message: `将创建场景规则「${name}」`
    };
  }

  const updateRuleMatch = trimmed.match(
    /^(?:更新|修改)(?:场景规则|规则)\s*(.+?)[:：]\s*(.+)$/i
  );
  if (updateRuleMatch) {
    const { name, content } = splitNameContent(updateRuleMatch[2]);
    const [condition, action] = content.split(/[，,；;]\s*则\s*/);
    return {
      intent: 'update_scene_rule',
      name: updateRuleMatch[1].trim(),
      condition: condition?.trim() || content,
      action: action?.trim(),
      message: `将更新场景规则「${updateRuleMatch[1].trim()}」`
    };
  }

  const queryMatch = trimmed.match(/^(?:查询|检索|搜索|分析)[:：]?\s*(.+)$/i);
  if (queryMatch) {
    return {
      intent: 'query',
      queryText: queryMatch[1].trim(),
      message: `将执行跨域查询：${queryMatch[1].trim()}`
    };
  }

  if (/公理/.test(trimmed)) {
    const { name, content } = splitNameContent(trimmed.replace(/公理/g, ''));
    return {
      intent: 'create_axiom',
      name,
      content,
      message: `将按公理语句创建「${name}」`
    };
  }

  if (/规则/.test(trimmed)) {
    const { name, content } = splitNameContent(trimmed.replace(/规则/g, ''));
    return {
      intent: 'create_scene_rule',
      name,
      condition: content,
      action: '按规则聚合跨域查询结果',
      message: `将按场景规则创建「${name}」`
    };
  }

  return {
    intent: 'query',
    queryText: trimmed,
    message: '将作为跨域查询处理'
  };
};
