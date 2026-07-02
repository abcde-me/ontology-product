import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Button,
  Input,
  Message,
  Popconfirm,
  Typography
} from '@arco-design/web-react';

import { IconDelete, IconSend } from '@arco-design/web-react/icon';

import type {
  ApplicationScenarioRule,
  InstanceInferenceResult,
  ThinkingProgressCallbacks
} from '../types';

import { parseApplicationScenarioWithLlm } from '../services/llmRuleAssistant';

import { executeInstanceInferenceQuery } from '../services/instanceInferenceQuery';

import {
  findApplicationScenarioRuleByName,
  saveApplicationScenarioRule
} from '../services/storage';

import {
  buildAssistantQuickPrompts,
  type AssistantQuickPrompt
} from '../services/generateAssistantQuickPrompts';

import styles from '../index.module.scss';

import { formatInstanceFieldBlock } from '../services/formatInstanceFields';

import AssistantThinkingDetails from './AssistantThinkingDetails';

const { Text } = Typography;

const { TextArea } = Input;

interface AssistantMessage {
  id: string;

  role: 'user' | 'assistant';

  content: string;

  thinkingProcess?: string;

  isThinking?: boolean;
}

interface ScenarioAssistantProps {
  scenarioId: string;

  ontologySceneId?: number;

  rules: ApplicationScenarioRule[];

  onRulesChange: () => void;

  onQueryResult?: (result: InstanceInferenceResult) => void;
}

const GRAPH_REQUIRED_HINT = '请先在图谱区域选择关联图谱。';

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function ScenarioAssistant({
  scenarioId,

  ontologySceneId,

  rules,

  onRulesChange,

  onQueryResult
}: ScenarioAssistantProps) {
  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  const [quickPrompts, setQuickPrompts] = useState<AssistantQuickPrompt[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    void buildAssistantQuickPrompts({
      ontologySceneId,

      rules
    }).then((prompts) => {
      if (!cancelled) {
        setQuickPrompts(prompts);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ontologySceneId, rules]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const appendMessage = useCallback((message: AssistantMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const createThinkingProgress = useCallback(
    (messageId: string): ThinkingProgressCallbacks => ({
      onThinkingLine: (line: string) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,

                  thinkingProcess: message.thinkingProcess
                    ? `${message.thinkingProcess}\n${line}`
                    : line
                }
              : message
          )
        );
      },

      onThinkingChunk: (chunk: string) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,

                  thinkingProcess: `${message.thinkingProcess || ''}${chunk}`
                }
              : message
          )
        );
      }
    }),

    []
  );

  const finalizeAssistantMessage = useCallback(
    (
      messageId: string,

      content: string,

      thinkingAppend?: string
    ) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,

                content,

                isThinking: false,

                thinkingProcess: thinkingAppend
                  ? message.thinkingProcess
                    ? `${message.thinkingProcess}\n${thinkingAppend}`
                    : thinkingAppend
                  : message.thinkingProcess
              }
            : message
        )
      );
    },

    []
  );

  const handleSubmit = async () => {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    setInput('');

    const history = messages.map(({ role, content }) => ({ role, content }));

    appendMessage({
      id: createMessageId(),

      role: 'user',

      content: text
    });

    const assistantMessageId = createMessageId();

    appendMessage({
      id: assistantMessageId,

      role: 'assistant',

      content: '',

      thinkingProcess: '',

      isThinking: true
    });

    setLoading(true);

    const progress = createThinkingProgress(assistantMessageId);

    try {
      const parsed = await parseApplicationScenarioWithLlm(
        text,

        rules,

        history,

        progress
      );

      const now = new Date().toISOString();

      if (parsed.intent === 'create_rule') {
        progress.onThinkingLine?.('▸ 识别为创建规则，写入规则管理…');

        const rule = saveApplicationScenarioRule({
          id: `rule-${Date.now()}`,

          scenarioId,

          name: parsed.name || '未命名规则',

          condition: parsed.condition || text,

          action: parsed.action || '按规则筛选图谱实例',

          description: '通过大模型对话创建',

          priority: 50,

          enabled: true,

          createdAt: now,

          updatedAt: now
        });

        onRulesChange();

        progress.onThinkingLine?.('▸ 保存规则到本地存储…');

        finalizeAssistantMessage(
          assistantMessageId,

          `已创建规则「${rule.name}」：若 ${rule.condition}，则 ${rule.action}`
        );

        return;
      }

      if (parsed.intent === 'update_rule') {
        progress.onThinkingLine?.('▸ 识别为修改规则，更新规则管理…');

        const existing = findApplicationScenarioRuleByName(
          scenarioId,

          parsed.name || ''
        );

        if (!existing) {
          finalizeAssistantMessage(
            assistantMessageId,

            `未找到规则「${parsed.name}」，请先创建。`
          );

          return;
        }

        const rule = saveApplicationScenarioRule({
          ...existing,

          condition: parsed.condition || existing.condition,

          action: parsed.action || existing.action,

          updatedAt: now
        });

        onRulesChange();

        progress.onThinkingLine?.('▸ 更新规则配置…');

        finalizeAssistantMessage(
          assistantMessageId,

          `已更新规则「${rule.name}」：若 ${rule.condition}，则 ${rule.action}`
        );

        return;
      }

      if (parsed.intent === 'query_instances') {
        progress.onThinkingLine?.('▸ 识别为数据查询，先匹配规则再推理图谱…');

        if (!ontologySceneId) {
          finalizeAssistantMessage(assistantMessageId, GRAPH_REQUIRED_HINT);

          return;
        }

        const result = await executeInstanceInferenceQuery({
          ontologySceneId,

          query: parsed.queryText || text,

          rules,

          progress
        });

        onQueryResult?.(result);

        const resolvedLines =
          result.resolvedValues

            ?.slice(0, 8)

            .map(
              (item) =>
                `• ${item.fieldLabel || item.fieldName}：${item.value}（${item.objectTypeName}）`
            )

            .join('\n') || '';

        const hitLines = result.hits

          .slice(0, 8)

          .map((hit) => {
            const rulePart = hit.matchedRuleNames.length
              ? `（规则：${hit.matchedRuleNames.join('、')}）`
              : '';

            let samplePart = '';

            if (hit.sampleInstances?.length) {
              const preview = hit.sampleInstances

                .slice(0, 2)

                .map((inst) => formatInstanceFieldBlock(inst, hit.fieldLabels))

                .join('\n\n');

              samplePart = `\n${preview}${
                hit.sampleInstances.length > 2 ? '\n    ...' : ''
              }`;
            }

            return `• ${hit.objectTypeName}：${hit.instanceCount} 条实例${rulePart}${samplePart}`;
          })

          .join('\n');

        const mainSections = [result.summary];

        if (resolvedLines) {
          mainSections.push(`查询结果：\n${resolvedLines}`);
        } else if (hitLines) {
          mainSections.push(hitLines);
        }

        const mainContent = mainSections.join('\n\n');

        finalizeAssistantMessage(
          assistantMessageId,
          mainContent,
          '▸ 回答生成完成'
        );

        return;
      }

      finalizeAssistantMessage(
        assistantMessageId,

        parsed.reply ||
          '请使用「创建规则：…」「修改规则 名称：…」或「查询…」等指令。'
      );
    } catch (error) {
      console.error(error);

      Message.error('处理对话失败');

      finalizeAssistantMessage(
        assistantMessageId,

        '处理失败，请检查图谱是否已配置或稍后重试。'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearConversation = () => {
    if (loading) {
      return;
    }

    setMessages([]);

    setInput('');

    Message.success('已清空对话上下文');
  };

  return (
    <div className={styles['assistant-panel']}>
      <div className={styles['assistant-header']}>
        <Text bold className="text-[13px]">
          大模型对话助手
        </Text>

        <Popconfirm
          title="确定清空对话？"
          content="将清除当前多轮对话上下文，后续提问将不再参考此前内容。"
          okText="清空"
          cancelText="取消"
          disabled={loading || messages.length === 0}
          onOk={handleClearConversation}
        >
          <Button
            type="text"
            size="mini"
            icon={<IconDelete />}
            disabled={loading || messages.length === 0}
            className={styles['assistant-clear-btn']}
          >
            清空对话
          </Button>
        </Popconfirm>
      </div>

      <div className={styles['assistant-messages']}>
        <div className={styles['assistant-message-list']}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? styles['assistant-message-user']
                  : styles['assistant-message-bot']
              }
            >
              {message.role === 'assistant' &&
              (message.thinkingProcess || message.isThinking) ? (
                <AssistantThinkingDetails
                  content={message.thinkingProcess || ''}
                  streaming={Boolean(message.isThinking)}
                />
              ) : null}

              {message.content ? (
                <pre
                  className={`${styles['assistant-message-content']} whitespace-pre-wrap font-sans`}
                >
                  {message.content}
                </pre>
              ) : null}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles['assistant-footer']}>
        <div className={styles['assistant-quick-prompts']}>
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt.id}
              size="mini"
              type="outline"
              className={styles['assistant-quick-prompt-btn']}
              title={prompt.value}
              onClick={() => setInput(prompt.value)}
            >
              {prompt.label}
            </Button>
          ))}
        </div>

        <div className={styles['assistant-input-row']}>
          <TextArea
            value={input}
            onChange={setInput}
            placeholder="输入自然语言，如：增加规则：… / 修改规则 名称：… / 查询…"
            autoSize={{ minRows: 1, maxRows: 3 }}
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
