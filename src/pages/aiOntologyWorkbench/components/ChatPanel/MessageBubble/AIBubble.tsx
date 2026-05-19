/**
 * AIBubble - AI 消息气泡（左侧）
 * 包含：ThinkChain → ToolCalling → Markdown 内容 → OntologyActions
 */
import React, { memo, useMemo } from 'react';
import { ThinkChain } from '@ceai-front/chat';
import type { AgentThinkTypes } from '@ceai-front/chat';
import MarkdownRenderer from '../MarkdownRenderer';
import OntologyActionCard from '../OntologyActionCard';
import { ChatMessage, OntologyAction, ThinkingStep } from '@/hooks/chat/types';
import styles from './MessageBubble.module.scss';

interface AIBubbleProps {
  message: ChatMessage;
  ontologyId?: number | string; // 本体 ID
  onLocateNode?: (code: string) => void;
  onViewNode?: (action: OntologyAction) => void; // 查看节点回调
}

/**
 * 将 ai-onto 的 ThinkingStep 转换为 @ceai-front/chat 的 ThinkChainStep
 */
const convertToThinkChainSteps = (
  steps: ThinkingStep[]
): AgentThinkTypes.ThinkChainStep[] => {
  return steps.map((step) => {
    // 转换 status: running -> loading, success -> success, error -> error
    let status: 'success' | 'error' | 'loading' = 'loading';
    if (step.status === 'running') {
      status = 'loading';
    } else if (step.status === 'success') {
      status = 'success';
    } else if (step.status === 'error') {
      status = 'error';
    }

    // 转换 running_time: number -> string
    const running_time =
      step.running_time !== undefined ? String(step.running_time) : undefined;

    // 对于 type: 'http'、'workflow'、'mcp' 的步骤，需要转换数据结构以匹配 WorkflowItem
    if (
      step.type === 'http' ||
      step.type === 'workflow' ||
      step.type === 'mcp'
    ) {
      // step.content 可能是对象或字符串
      const content =
        typeof step.content === 'string'
          ? (() => {
              try {
                return JSON.parse(step.content);
              } catch {
                return {};
              }
            })()
          : step.content || {};

      // 提取 tool_name, arg, response
      const tool_name = content.tool_name || content.name || '本体场景快照';

      // arg 和 response 必须是 JSON 字符串
      let arg = '';
      if (content.arg !== undefined && content.arg !== null) {
        arg =
          typeof content.arg === 'string'
            ? content.arg
            : JSON.stringify(content.arg, null, 2);
      }

      let response = '';
      if (content.response !== undefined && content.response !== null) {
        response =
          typeof content.response === 'string'
            ? content.response
            : JSON.stringify(content.response, null, 2);
      }

      // 返回符合 WorkflowItem 格式的对象
      return {
        type: step.type,
        chunk_id: step.chunk_id,
        status,
        running_time: running_time || '0',
        done: step.done ?? false,
        tool_name,
        description: content.description || '',
        arg,
        response,
        tool_id: content.tool_id || '',
        workflow_id: content.workflow_id || '',
        timestamp: new Date().toISOString()
      } as AgentThinkTypes.ThinkChainStep;
    }

    // 其他类型（thinking, ontology 等）保持原样
    return {
      ...step,
      status,
      running_time,
      done: step.done ?? false
    } as AgentThinkTypes.ThinkChainStep;
  });
};

// ========== MOCK 数据开关 ==========
// 设置为 true 使用 mock 数据，false 使用真实数据
const USE_MOCK_ONTOLOGY_ACTIONS = false;
// ========== MOCK 数据开关结束 ==========

// ========== MOCK 数据 - 用于调试 ==========
const MOCK_ONTOLOGY_ACTIONS: OntologyAction[] = [
  // ===== 对象类型示例 =====
  {
    action_type: 'create', // 新增操作 - 绿色标签
    target_type: 'object_type', // 对象类型 - 显示对象图标
    code: 'ArgusTrackPrediction3',
    name: '预测轨迹',
    toolName: '本体场景快照'
  },
  {
    action_type: 'update', // 更新操作 - 蓝色标签
    target_type: 'object_type', // 对象类型 - 显示对象图标
    code: 'VehicleType',
    name: '车辆类型',
    toolName: '本体场景快照'
  },
  {
    action_type: 'delete', // 删除操作 - 红色标签
    target_type: 'object_type', // 对象类型 - 不显示定位图标
    code: 'OldVehicleType',
    name: '旧车辆类型',
    toolName: '本体场景快照'
  },
  {
    action_type: 'get', // 查询操作 - 蓝色标签
    target_type: 'object_type', // 对象类型 - 显示对象图标
    code: 'PersonType',
    name: '人员类型',
    toolName: '本体场景快照'
  },

  // ===== 链接类型示例 =====
  {
    action_type: 'create', // 新增操作 - 绿色标签
    target_type: 'link', // 链接 - 显示链接图标
    code: 'UavGeneratRecord3',
    name: '产生',
    toolName: '本体场景快照'
  },
  {
    action_type: 'update', // 更新操作 - 蓝色标签
    target_type: 'link', // 链接 - 显示链接图标
    code: 'LinkBelongsTo',
    name: '属于关系',
    toolName: '本体场景快照'
  },
  {
    action_type: 'delete', // 删除操作 - 红色标签
    target_type: 'link', // 链接 - 不显示定位图标
    code: 'OldLinkContains',
    name: '旧包含关系',
    toolName: '本体场景快照'
  },
  {
    action_type: 'get', // 查询操作 - 蓝色标签
    target_type: 'link', // 链接 - 显示链接图标
    code: 'LinkHasProperty',
    name: '具有属性',
    toolName: '本体场景快照'
  },

  // ===== 行为类型示例 =====
  {
    action_type: 'create', // 新增操作 - 绿色标签
    target_type: 'action', // 行为 - 显示行为图标，只显示查看图标
    code: 'tmpAlertPush23',
    name: '临时测试推送行为',
    toolName: '本体场景快照'
  },
  {
    action_type: 'update', // 更新操作 - 蓝色标签
    target_type: 'action', // 行为 - 显示行为图标，只显示查看图标
    code: 'tmpAlertPush24',
    name: '更新推送行为',
    toolName: '本体场景快照'
  },
  {
    action_type: 'delete', // 删除操作 - 红色标签
    target_type: 'action', // 行为 - 显示行为图标，只显示查看图标
    code: 'tmpAlertPush25',
    name: '删除推送行为',
    toolName: '本体场景快照'
  },
  {
    action_type: 'get', // 查询操作 - 蓝色标签
    target_type: 'action', // 行为 - 显示行为图标，只显示查看图标
    code: 'tmpAlertPush26',
    name: '查询推送行为',
    toolName: '本体场景快照'
  },

  // ===== 函数类型示例 =====
  {
    action_type: 'create', // 新增操作 - 绿色标签
    target_type: 'function', // 函数 - 显示函数图标，只显示查看图标
    code: 'argus_scheme_func3',
    name: '方案推荐函数',
    toolName: '本体场景快照'
  },
  {
    action_type: 'update', // 更新操作 - 蓝色标签
    target_type: 'function', // 函数 - 显示函数图标，只显示查看图标
    code: 'argus_scheme_func4',
    name: '更新推荐函数',
    toolName: '本体场景快照'
  },
  {
    action_type: 'delete', // 删除操作 - 红色标签
    target_type: 'function', // 函数 - 显示函数图标，只显示查看图标
    code: 'argus_scheme_func5',
    name: '删除推荐函数',
    toolName: '本体场景快照'
  },
  {
    action_type: 'get', // 查询操作 - 蓝色标签
    target_type: 'function', // 函数 - 显示函数图标，只显示查看图标
    code: 'argus_scheme_func6',
    name: '查询推荐函数',
    toolName: '本体场景快照'
  }
];
// ========== MOCK 数据结束 ==========

const AIBubble: React.FC<AIBubbleProps> = ({
  message,
  ontologyId,
  onLocateNode,
  onViewNode
}) => {
  const { content, thinkingSteps, ontologyActions, status } = message;

  const isStreaming = status === 'streaming';
  const isLoading = status === 'loading';
  const isDone = status === 'success';
  const isError = status === 'error';
  const isAbort = status === 'abort';

  // 判断是否有任何内容
  const hasThinkingSteps = thinkingSteps && thinkingSteps.length > 0;
  const hasContent = content && content.trim().length > 0;
  const hasOntologyActions = ontologyActions && ontologyActions.length > 0;
  const hasAnyContent = hasThinkingSteps || hasContent || hasOntologyActions;

  // 转换思维链步骤格式
  const convertedSteps = useMemo(() => {
    if (!thinkingSteps) return [];
    return convertToThinkChainSteps(thinkingSteps);
  }, [thinkingSteps]);

  // ========== 根据开关决定使用 mock 数据还是真实数据 ==========
  const displayActions = USE_MOCK_ONTOLOGY_ACTIONS
    ? MOCK_ONTOLOGY_ACTIONS
    : ontologyActions || [];
  // ========== 数据选择结束 ==========

  return (
    <div className={styles.aiBubbleContainer}>
      {/* 移除 AI 头像 */}
      <div className={styles.aiBubble}>
        {/* 思维链 - 使用 @ceai-front/chat 的 ThinkChain 组件 */}
        {hasThinkingSteps && (
          <ThinkChain
            steps={convertedSteps}
            done={isDone || isAbort}
            defaultOpen={true}
            defaultStepOpen={false}
            showDebug={false}
          />
        )}

        {/* 正文内容 - Markdown */}
        {hasContent && (
          <div className={styles.aiContent}>
            <MarkdownRenderer content={content} />
          </div>
        )}

        {/* 本体操作卡片 - 显示在正文下方 */}
        {displayActions.length > 0 && (
          <div className={styles.ontologyActions}>
            {displayActions.map((action, index) => (
              <OntologyActionCard
                key={`${action.code}-${index}`}
                action={action}
                ontologyId={ontologyId}
                onLocate={onLocateNode}
                onView={onViewNode}
              />
            ))}
          </div>
        )}

        {/* 错误状态 */}
        {isError && (
          <div className={styles.errorMessage}>
            {content || '生成失败，请重试'}
          </div>
        )}

        {/* 流式加载指示器 - 当没有任何内容且正在加载时显示 */}
        {(isLoading || (isStreaming && !hasAnyContent)) && (
          <div className={styles.loadingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AIBubble);
