/**
 * ThinkTool - 工具调用内容组件
 * 用于 http, workflow, mcp, knowledge 等类型
 */
import React, { memo, useMemo } from 'react';
import { ThinkingStep } from '@/hooks/chat/types';
import CollapsibleSection from './CollapsibleSection';
import CodeBlock from './CodeBlock';
import styles from './ThinkingChain.module.scss';

interface ThinkToolProps {
  step: ThinkingStep;
}

const MAX_SECTION_HEIGHT = 190;

const ThinkTool: React.FC<ThinkToolProps> = ({ step }) => {
  const { content } = step;

  // 调试日志 - 使用 JSON.stringify 确保能看到完整数据
  console.log('[ThinkTool] ========== START ==========');
  console.log('[ThinkTool] step:', JSON.stringify(step, null, 2));
  console.log('[ThinkTool] content:', content);
  console.log('[ThinkTool] content type:', typeof content);
  console.log('[ThinkTool] content is null?', content === null);
  console.log('[ThinkTool] content is undefined?', content === undefined);

  // 解析 content - 必须在所有 hooks 之前完成
  const data: any = useMemo(() => {
    if (!content) return null;

    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.log('[ThinkTool] JSON parse failed, treat as raw string');
        return { raw: content };
      }
    }
    return content;
  }, [content]);

  const { arg, args, response, result, tool_name } = data || {};

  /** Argument JSON 格式化 */
  const argFormatted = useMemo(() => {
    const argData = arg || args;
    if (!argData) return '';
    try {
      // 如果 argData 本身是字符串，尝试解析后再格式化
      if (typeof argData === 'string') {
        try {
          const parsed = JSON.parse(argData);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // 解析失败，直接返回原字符串
          return argData;
        }
      }
      return JSON.stringify(argData, null, 2);
    } catch {
      return String(argData);
    }
  }, [arg, args]);

  /** Response JSON 格式化 */
  const responseFormatted = useMemo(() => {
    const respData = response || result;
    if (!respData) return '';
    try {
      // 如果 respData 本身是字符串，尝试解析后再格式化
      if (typeof respData === 'string') {
        try {
          const parsed = JSON.parse(respData);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // 解析失败，直接返回原字符串
          return respData;
        }
      }
      return JSON.stringify(respData, null, 2);
    } catch {
      return String(respData);
    }
  }, [response, result]);

  // 如果 content 为空，不渲染
  if (!data) {
    console.log('[ThinkTool] data is null, not rendering');
    return null;
  }

  console.log('[ThinkTool] parsed data:', data);
  console.log('[ThinkTool] tool_name:', tool_name);
  console.log('[ThinkTool] arg:', arg);
  console.log('[ThinkTool] response:', response);
  console.log('[ThinkTool] argFormatted length:', argFormatted?.length);
  console.log(
    '[ThinkTool] responseFormatted length:',
    responseFormatted?.length
  );
  console.log(
    '[ThinkTool] argFormatted preview:',
    argFormatted?.substring(0, 100)
  );
  console.log(
    '[ThinkTool] responseFormatted preview:',
    responseFormatted?.substring(0, 100)
  );
  console.log('[ThinkTool] ========== END ==========');

  // 如果既没有 arg 也没有 response，显示原始数据
  if (!argFormatted && !responseFormatted) {
    const rawFormatted =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    return (
      <div className={styles.stepContentContainer}>
        <CollapsibleSection
          title="Data"
          contentClassName={styles.collapsibleContent}
          maxHeight={MAX_SECTION_HEIGHT}
          defaultOpen={true}
        >
          <CodeBlock code={rawFormatted} language="JSON" />
        </CollapsibleSection>
      </div>
    );
  }

  return (
    <div className={styles.stepContentContainer}>
      {/* 工具名称 */}
      {tool_name && <span className={styles.toolName}>{tool_name}</span>}

      {/* Argument */}
      {argFormatted && (
        <CollapsibleSection
          title="Argument"
          contentClassName={styles.collapsibleContent}
          maxHeight={MAX_SECTION_HEIGHT}
          defaultOpen={true}
        >
          <CodeBlock code={argFormatted} language="JSON" />
        </CollapsibleSection>
      )}

      {/* Response */}
      {responseFormatted && (
        <CollapsibleSection
          title="Response"
          contentClassName={styles.collapsibleContent}
          maxHeight={MAX_SECTION_HEIGHT}
          defaultOpen={true}
        >
          <CodeBlock code={responseFormatted} language="JSON" />
        </CollapsibleSection>
      )}
    </div>
  );
};

export default memo(ThinkTool);
