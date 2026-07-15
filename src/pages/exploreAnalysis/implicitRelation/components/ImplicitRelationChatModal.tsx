import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Input,
  Message,
  Modal,
  Popconfirm,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import { IconDelete, IconSend } from '@arco-design/web-react/icon';
import MarkdownContent from '@/components/MarkdownContent';
import type { ImplicitDiscoveryResult, ImplicitRelationTask } from '../types';
import {
  askRelationMiningChat,
  DEFAULT_RELATION_MINING_CHAT_CONFIG,
  type RelationMiningChatConfig,
  type RelationMiningChatMessage
} from '../services/implicitRelationChatQa';
import styles from './ImplicitRelationChatModal.module.scss';

interface ChatBubble extends RelationMiningChatMessage {
  id: string;
  source?: 'llm' | 'local';
}

interface ImplicitRelationChatModalProps {
  visible: boolean;
  task: Pick<
    ImplicitRelationTask,
    'id' | 'name' | 'description' | 'scope'
  > | null;
  result: ImplicitDiscoveryResult | null;
  onClose: () => void;
}

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const QUICK_PROMPT = '请概括本次挖掘出了哪些关键关系？';

export default function ImplicitRelationChatModal({
  visible,
  task,
  result,
  onClose
}: ImplicitRelationChatModalProps) {
  const [config, setConfig] = useState<RelationMiningChatConfig>(
    DEFAULT_RELATION_MINING_CHAT_CONFIG
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!visible) {
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }
    setConfig(DEFAULT_RELATION_MINING_CHAT_CONFIG);
    setInput('');
    setMessages([
      {
        id: createId(),
        role: 'assistant',
        content:
          '您好，我可以结合本次关系挖掘的图谱与结论回答问题。请勾选查询范围后开始提问。'
      }
    ]);
  }, [visible, task?.id, result?.ranAt]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, loading, visible]);

  const handleSend = async (questionText?: string) => {
    const question = (questionText ?? input).trim();
    if (!question) {
      return;
    }
    if (!task || !result) {
      Message.warning('当前任务暂无挖掘结果，请先在详情页执行发现');
      return;
    }
    if (
      !config.includeGraph &&
      !config.includeSummary &&
      !config.includeDiscoveries
    ) {
      Message.warning('请至少勾选一项查询范围');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: ChatBubble = {
      id: createId(),
      role: 'user',
      content: question
    };
    const history = messages
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .map((item) => ({ role: item.role, content: item.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { answer, source } = await askRelationMiningChat({
        question,
        history,
        task,
        result,
        config,
        signal: controller.signal
      });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: answer,
          source
        }
      ]);
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        return;
      }
      Message.error(error instanceof Error ? error.message : '问答失败');
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: '抱歉，本次问答失败，请稍后重试。'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: createId(),
        role: 'assistant',
        content: '对话已清空。请继续提问。'
      }
    ]);
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitleRow}>
          <span className={styles.modalTitle}>关系挖掘问答</span>
          <Popconfirm title="确认清空当前对话？" onOk={handleClear}>
            <Tooltip content="清空对话">
              <Button
                type="text"
                size="small"
                icon={<IconDelete />}
                disabled={loading}
                className={styles.clearBtn}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
      style={{ width: 720 }}
      className={styles.chatModal}
    >
      <div className={styles.modalBody}>
        <div className={styles.configBar}>
          <span className={styles.configLabel}>查询范围</span>
          <Checkbox
            checked={config.includeGraph}
            onChange={(checked) =>
              setConfig((prev) => ({ ...prev, includeGraph: checked }))
            }
          >
            关系图谱
          </Checkbox>
          <Checkbox
            checked={config.includeSummary}
            onChange={(checked) =>
              setConfig((prev) => ({ ...prev, includeSummary: checked }))
            }
          >
            发现总结
          </Checkbox>
          <Checkbox
            checked={config.includeDiscoveries}
            onChange={(checked) =>
              setConfig((prev) => ({ ...prev, includeDiscoveries: checked }))
            }
          >
            发现的关系
          </Checkbox>
        </div>

        {!result ? (
          <div className={styles.emptyResult}>
            暂无挖掘结果，请先在详情页执行发现
          </div>
        ) : null}

        <div className={styles.messageList} ref={listRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble
              }
            >
              <div className={styles.bubbleMeta}>
                {message.role === 'user' ? '我' : '助手'}
                {message.source === 'local' ? (
                  <Tag size="small" color="gray">
                    本地
                  </Tag>
                ) : null}
                {message.source === 'llm' ? (
                  <Tag size="small" color="arcoblue">
                    大模型
                  </Tag>
                ) : null}
              </div>
              <MarkdownContent
                className={styles.bubbleContent}
                content={message.content}
              />
            </div>
          ))}
          {loading ? (
            <div className={styles.assistantBubble}>
              <div className={styles.bubbleMeta}>助手</div>
              <div className={styles.bubbleContent}>正在思考...</div>
            </div>
          ) : null}
        </div>

        <div className={styles.footer}>
          <div className={styles.quickPrompts}>
            <Button
              size="mini"
              type="text"
              disabled={loading || !result}
              onClick={() => void handleSend(QUICK_PROMPT)}
            >
              {QUICK_PROMPT}
            </Button>
          </div>

          <div className={styles.composer}>
            <Input
              value={input}
              onChange={setInput}
              placeholder="基于挖掘结果提问，例如：哪些关系最值得复核？"
              disabled={loading || !result}
              onPressEnter={() => void handleSend()}
            />
            <Button
              type="primary"
              icon={<IconSend />}
              loading={loading}
              disabled={!result}
              onClick={() => void handleSend()}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
