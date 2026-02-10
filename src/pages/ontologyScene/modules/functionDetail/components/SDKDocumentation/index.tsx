import React, { useMemo } from 'react';
import styles from './index.module.scss';
import ReactMarkdown from 'react-markdown';
import RemarkGfm from 'remark-gfm';
import { copyCode } from '@/utils/json';
import { CopyItemIcon } from '@ceai-front/arco-material';

interface SdkDocumentationProps {
  content?: string;
}

export const SdkDocumentation: React.FC<SdkDocumentationProps> = ({
  content
}) => {
  const markdown = content && content.trim() ? content : '暂无文档';

  // 缓存自定义渲染器，避免每次渲染都创建新对象
  const components = useMemo(
    () => ({
      code({
        inline,
        className,
        children,
        ...props
      }: {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
      }) {
        const match = /language-(\w+)/.exec(className || '');
        const codeText = String(children ?? '').replace(/\n$/, '');
        const language = match?.[1] ?? 'text';

        // 行内代码直接渲染
        if (inline) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }

        // 代码块渲染：包含语言标签和复制按钮
        return (
          <div className={styles['code-block']}>
            <div className={styles['code-toolbar']}>
              <span className={styles['code-lang']}>{language}</span>
              <CopyItemIcon value={codeText} />
            </div>
            <pre className={styles['code-pre']}>
              <code className={className} {...props}>
                {codeText}
              </code>
            </pre>
          </div>
        );
      }
    }),
    []
  );

  return (
    <div className={styles['sdk-doc']}>
      {/* Markdown 渲染区域 */}
      <ReactMarkdown remarkPlugins={[RemarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
