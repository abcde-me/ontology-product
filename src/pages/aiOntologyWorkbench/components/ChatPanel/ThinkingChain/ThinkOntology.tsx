/**
 * ThinkOntology - 本体工具调用内容组件
 * 参考 ai-appforge 的 ThinkOntology
 */
import React, { memo, useMemo } from 'react';
import { ThinkingStep } from '@/hooks/chat/types';
import CollapsibleSection from './CollapsibleSection';
import CodeBlock from './CodeBlock';
import styles from './ThinkingChain.module.scss';

interface ThinkOntologyProps {
  step: ThinkingStep;
}

const MAX_SECTION_HEIGHT = 190;

const ThinkOntology: React.FC<ThinkOntologyProps> = ({ step }) => {
  const { content } = step;

  // 调试日志
  console.log('[ThinkOntology] step:', step);
  console.log('[ThinkOntology] content:', content);
  console.log('[ThinkOntology] content type:', typeof content);

  // 解析 content
  let data: any = content;
  if (typeof content === 'string') {
    try {
      data = JSON.parse(content);
    } catch (e) {
      // 解析失败
      data = { raw: content };
    }
  }

  /** 解析后的数据 */
  const { parsedArgs, parsedText, parsedGraph } = useMemo(() => {
    let pArgs: any = null;
    let pText: any[] = [];
    let pGraph: any = null;

    try {
      if (data?.args) {
        pArgs =
          typeof data.args === 'string' ? JSON.parse(data.args) : data.args;
      }
    } catch (e) {
      pArgs = data?.args;
    }

    try {
      if (data?.result?.text) {
        pText =
          typeof data.result.text === 'string'
            ? JSON.parse(data.result.text)
            : data.result.text;
      }
    } catch (e) {
      pText = [];
    }

    try {
      if (data?.result?.graph) {
        pGraph =
          typeof data.result.graph === 'string'
            ? JSON.parse(data.result.graph)
            : data.result.graph;
      }
    } catch (e) {
      pGraph = null;
    }

    return { parsedArgs: pArgs, parsedText: pText, parsedGraph: pGraph };
  }, [data]);

  /** Argument JSON 格式化 */
  const argsFormatted = useMemo(() => {
    if (
      !parsedArgs ||
      (typeof parsedArgs === 'object' && Object.keys(parsedArgs).length === 0)
    )
      return '';
    try {
      return JSON.stringify(parsedArgs, null, 2);
    } catch {
      return '';
    }
  }, [parsedArgs]);

  /** Result JSON 格式化 */
  const resultFormatted = useMemo(() => {
    if (!parsedText || parsedText.length === 0) return '';
    try {
      return JSON.stringify(parsedText, null, 2);
    } catch {
      return '';
    }
  }, [parsedText]);

  /** Graph JSON 格式化 */
  const graphFormatted = useMemo(() => {
    if (!parsedGraph || Object.keys(parsedGraph).length === 0) return '';
    try {
      return JSON.stringify(parsedGraph, null, 2);
    } catch {
      return '';
    }
  }, [parsedGraph]);

  return (
    <div className={styles.stepContentContainer}>
      {/* Response */}
      <CollapsibleSection
        title="Response"
        contentClassName={styles.collapsibleContent}
        defaultOpen={true}
        maxHeight={MAX_SECTION_HEIGHT}
        emptyText="暂无匹配结果"
      >
        {resultFormatted || graphFormatted ? (
          parsedText && parsedText.length > 0 ? (
            // TEXT 视图
            <div className={styles.ontologyTextView}>
              {parsedText.map((group: any, groupIndex: number) => (
                <div
                  key={group.id || groupIndex}
                  className={styles.ontologyGroup}
                >
                  {/* 对象类型标题 */}
                  <div className={styles.ontologyGroupTitle}>
                    <span className={styles.ontologyTypeIcon}>📦</span>
                    <span className={styles.ontologyTypeName}>
                      {group.name}
                    </span>
                  </div>

                  {/* 实体列表 */}
                  {group.entities && group.entities.length > 0 && (
                    <div className={styles.ontologyEntities}>
                      {group.entities.map(
                        (entity: any, entityIndex: number) => (
                          <div
                            key={entity.id || entityIndex}
                            className={styles.ontologyEntity}
                            title={entity.name}
                          >
                            {entity.name}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // JSON 视图
            <CodeBlock code={graphFormatted} language="JSON" />
          )
        ) : null}
      </CollapsibleSection>
    </div>
  );
};

export default memo(ThinkOntology);
