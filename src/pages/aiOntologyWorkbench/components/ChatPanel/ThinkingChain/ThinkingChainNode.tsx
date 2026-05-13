/**
 * ThinkingChainNode - 思维链单个节点
 * 参考 ai-appforge 的 ThinkChainNode
 */
import React, { useState, useEffect, useRef, memo } from 'react';
import { IconDown, IconLoading } from '@arco-design/web-react/icon';
import { ThinkingStep } from '@/hooks/chat/types';
import { STEP_TYPES } from './types.d';
import styles from './ThinkingChain.module.scss';

interface ThinkingChainNodeProps {
  step: ThinkingStep;
  isLast: boolean;
}

// 获取步骤类型文本
const getStepTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    [STEP_TYPES.THINKING]: '深度思考',
    [STEP_TYPES.ONTOLOGY]: '本体工具调用',
    [STEP_TYPES.KNOWLEDGE]: '知识库调用',
    [STEP_TYPES.WORKFLOW]: '工作流调用',
    [STEP_TYPES.MCP]: 'MCP调用',
    [STEP_TYPES.HTTP]: '插件调用'
  };
  return typeMap[type] || '处理中';
};

// 渲染步骤内容
const renderStepContent = (step: ThinkingStep): React.ReactNode => {
  const { type, content } = step;

  // thinking 类型：纯文本
  if (type === STEP_TYPES.THINKING) {
    return (
      <div className={styles.contentCard}>
        <div className={styles.contentText}>
          {typeof content === 'string'
            ? content
            : JSON.stringify(content, null, 2)}
        </div>
      </div>
    );
  }

  // ontology 类型：结构化展示
  if (type === STEP_TYPES.ONTOLOGY) {
    let data: any = content;
    if (typeof content === 'string') {
      try {
        data = JSON.parse(content);
      } catch (e) {
        // 如果解析失败，直接显示原始字符串
        return (
          <div className={styles.contentCard}>
            <div className={styles.contentText}>{content}</div>
          </div>
        );
      }
    }

    return (
      <div className={styles.contentCard}>
        <div className={styles.ontologyContent}>
          <div className={styles.ontologyTitle}>本体工具调用</div>
          {data?.args && (
            <div className={styles.ontologySection}>
              <div className={styles.sectionLabel}>输入参数：</div>
              <pre className={styles.codeBlock}>
                {JSON.stringify(data.args, null, 2)}
              </pre>
            </div>
          )}
          {data?.result && (
            <div className={styles.ontologySection}>
              <div className={styles.sectionLabel}>返回结果：</div>
              <pre className={styles.codeBlock}>
                {JSON.stringify(data.result, null, 2)}
              </pre>
            </div>
          )}
          {!data?.args && !data?.result && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  }

  // 其他类型：JSON 展示
  return (
    <div className={styles.contentCard}>
      <pre className={styles.codeBlock}>
        {typeof content === 'string'
          ? content
          : JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
};

const ThinkingChainNode: React.FC<ThinkingChainNodeProps> = ({
  step,
  isLast
}) => {
  const { type, content, status, running_time, done } = step;

  // 进行中时默认展开，完成后自动收起
  const [expanded, setExpanded] = useState(!done);

  // 内容容器的 ref，用于自动滚动
  const contentRef = useRef<HTMLDivElement>(null);

  // 监听 done 状态变化，完成后自动收起
  useEffect(() => {
    if (done) {
      setExpanded(false);
    }
  }, [done]);

  // 监听内容变化，自动滚动到底部（仅在展开且未完成时）
  useEffect(() => {
    if (expanded && !done && contentRef.current) {
      const contentElement = contentRef.current.querySelector(
        `.${styles.contentText}`
      );
      if (contentElement) {
        contentElement.scrollTop = contentElement.scrollHeight;
      }
    }
  }, [content, expanded, done]);

  const isLoading = !done && status === 'running';
  const typeText = getStepTypeText(type);

  // 状态文案
  const statusText = isLoading
    ? `${typeText}中...`
    : running_time
      ? `${typeText}成功，用时${running_time}秒`
      : `${typeText}完成`;

  // 是否有内容可展开（根据类型判断）
  const hasContent =
    content != null &&
    (typeof content === 'string' ? content.trim().length > 0 : true);

  return (
    <div className={styles.nodeContainer}>
      {/* 节点行 */}
      <div className={styles.nodeRow}>
        {/* 类型图标 */}
        <div className={styles.nodeIcon}>
          {isLoading ? (
            <IconLoading className={styles.loadingIcon} spin />
          ) : (
            <div className={styles.successIcon} />
          )}
        </div>

        {/* 状态文案 */}
        <span className={styles.nodeStatus}>{statusText}</span>

        {/* 展开/折叠箭头 */}
        {hasContent && (
          <IconDown
            className={`${styles.arrow} ${expanded ? styles.arrowUp : styles.arrowDown}`}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </div>

      {/* 连接线 + 内容 */}
      {(!isLast || (hasContent && expanded)) && (
        <div className={styles.nodeContent}>
          {/* 左侧连接线 */}
          <div className={styles.nodeLine}>
            {!isLast && <div className={styles.lineBar} />}
          </div>

          {/* 右侧内容 */}
          <div className={styles.nodeContentBox} ref={contentRef}>
            {hasContent && expanded && renderStepContent(step)}

            {/* 无内容或未展开时的间距 */}
            {!(hasContent && expanded) && !isLast && (
              <div className={styles.spacer} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ThinkingChainNode);
