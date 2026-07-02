import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Input,
  Message,
  Space,
  Typography
} from '@arco-design/web-react';
import { IconSend } from '@arco-design/web-react/icon';
import type {
  CrossDomainQueryResult,
  JointKnowledgeBundle
} from '@/types/jointOperationsKnowledge';
import { parseJointOperationsNaturalLanguage } from '@/services/jointOperationsNlInterpreter';
import { executeJointOperationsCrossDomainQuery } from '@/services/jointOperationsCrossDomainQuery';
import {
  findJointAxiomByName,
  findJointSceneRuleByName,
  getJointOperationsKnowledge,
  saveJointAxiom,
  saveJointSceneRule
} from '@/utils/devJointOperationsKnowledgeStore';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface JointOperationsAssistantProps {
  sceneId: number;
  extraSceneIds?: number[];
  onKnowledgeChange?: (bundle: JointKnowledgeBundle) => void;
  onQueryResult?: (result: CrossDomainQueryResult) => void;
}

export default function JointOperationsAssistant({
  sceneId,
  extraSceneIds = [],
  onKnowledgeChange,
  onQueryResult
}: JointOperationsAssistantProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '可用自然语言创建/更新公理与场景规则，或发起跨域查询。示例：\n• 创建公理：联合作战单元必须关联指挥节点\n• 创建场景规则：当查询打击链路，则聚合平台与武器\n• 查询海军平台与武器打击关系'
    }
  ]);

  const quickPrompts = useMemo(
    () => [
      '创建公理：跨域平台必须可追溯到作战行动',
      '创建场景规则：当查询涉及地理位置与军事行动，则展示区域目标关联',
      '查询联合作战打击链路与武器平台'
    ],
    []
  );

  const appendMessage = useCallback(
    (role: AssistantMessage['role'], content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${prev.length}`, role, content }
      ]);
    },
    []
  );

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    setInput('');
    appendMessage('user', text);
    setLoading(true);

    try {
      const parsed = parseJointOperationsNaturalLanguage(text);
      const now = new Date().toISOString();
      const knowledge = getJointOperationsKnowledge(sceneId);

      if (parsed.intent === 'create_axiom') {
        const axiom = saveJointAxiom(sceneId, {
          id: `axiom-${Date.now()}`,
          sceneId,
          name: parsed.name || '未命名公理',
          expression: parsed.content || text,
          description: '通过自然语言创建',
          enabled: true,
          createdAt: now,
          updatedAt: now
        });
        const bundle = getJointOperationsKnowledge(sceneId);
        onKnowledgeChange?.(bundle);
        appendMessage(
          'assistant',
          `已创建公理「${axiom.name}」：${axiom.expression}`
        );
        return;
      }

      if (parsed.intent === 'update_axiom') {
        const existing = findJointAxiomByName(sceneId, parsed.name || '');
        if (!existing) {
          appendMessage(
            'assistant',
            `未找到公理「${parsed.name}」，请先创建。`
          );
          return;
        }
        const axiom = saveJointAxiom(sceneId, {
          ...existing,
          expression: parsed.content || existing.expression,
          updatedAt: now
        });
        onKnowledgeChange?.(getJointOperationsKnowledge(sceneId));
        appendMessage(
          'assistant',
          `已更新公理「${axiom.name}」：${axiom.expression}`
        );
        return;
      }

      if (parsed.intent === 'create_scene_rule') {
        const rule = saveJointSceneRule(sceneId, {
          id: `rule-${Date.now()}`,
          sceneId,
          name: parsed.name || '未命名场景规则',
          condition: parsed.condition || parsed.content || text,
          action: parsed.action || '按规则聚合跨域查询结果',
          description: '通过自然语言创建',
          priority: 50,
          enabled: true,
          createdAt: now,
          updatedAt: now
        });
        onKnowledgeChange?.(getJointOperationsKnowledge(sceneId));
        appendMessage(
          'assistant',
          `已创建场景规则「${rule.name}」：若 ${rule.condition}，则 ${rule.action}`
        );
        return;
      }

      if (parsed.intent === 'update_scene_rule') {
        const existing = findJointSceneRuleByName(sceneId, parsed.name || '');
        if (!existing) {
          appendMessage(
            'assistant',
            `未找到场景规则「${parsed.name}」，请先创建。`
          );
          return;
        }
        const rule = saveJointSceneRule(sceneId, {
          ...existing,
          condition: parsed.condition || existing.condition,
          action: parsed.action || existing.action,
          updatedAt: now
        });
        onKnowledgeChange?.(getJointOperationsKnowledge(sceneId));
        appendMessage(
          'assistant',
          `已更新场景规则「${rule.name}」：若 ${rule.condition}，则 ${rule.action}`
        );
        return;
      }

      const queryText = parsed.queryText || text;
      const result = await executeJointOperationsCrossDomainQuery({
        sceneId,
        query: queryText,
        knowledge,
        extraSceneIds
      });
      onQueryResult?.(result);
      appendMessage(
        'assistant',
        `${result.summary}\n${result.hits
          .slice(0, 5)
          .map(
            (hit) =>
              `• [${hit.kind}] ${hit.name}${hit.sceneName ? `（${hit.sceneName}）` : ''}`
          )
          .join('\n')}`
      );
    } catch (error) {
      console.error(error);
      Message.error('处理自然语言指令失败');
      appendMessage('assistant', '处理失败，请检查图谱是否已加载或稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-[var(--color-border-2)] bg-[#F8FAFC]">
      <div className="border-b border-[var(--color-border-2)] px-4 py-3">
        <Text bold>自然语言助手</Text>
        <Paragraph className="!mb-0 mt-1 text-[12px] text-[var(--color-text-3)]">
          支持用自然语言创建/更新公理、场景规则，并驱动跨域查询
        </Paragraph>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-4 py-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'ml-8 rounded-lg bg-white px-3 py-2 text-[13px] shadow-sm'
                : 'mr-4 rounded-lg bg-[#EEF2FF] px-3 py-2 text-[13px]'
            }
          >
            <pre className="whitespace-pre-wrap font-sans">
              {message.content}
            </pre>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-[var(--color-border-2)] px-4 py-3">
        <Space wrap>
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              size="mini"
              type="outline"
              onClick={() => setInput(prompt)}
            >
              {prompt.slice(0, 18)}…
            </Button>
          ))}
        </Space>
        <div className="flex gap-2">
          <TextArea
            value={input}
            onChange={setInput}
            placeholder="输入自然语言，如：创建公理：… / 创建场景规则：… / 查询…"
            autoSize={{ minRows: 2, maxRows: 4 }}
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <Button
            type="primary"
            icon={<IconSend />}
            loading={loading}
            onClick={() => void handleSubmit()}
          />
        </div>
      </div>
    </div>
  );
}
