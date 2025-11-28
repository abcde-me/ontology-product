/**
 * Segment Markdown Component
 * 基于markdownBase组件,添加图片点击放大功能
 */

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RemarkBreaks from 'remark-breaks';
import RemarkGfm from 'remark-gfm';
import RehypeRaw from 'rehype-raw';
import RehypeKatex from 'rehype-katex';
import cn from '@/pages/workflowConfig/utils/classnames';
import { Sup } from '@/components/markdownBase/components';
import { useRagDetailStore } from '../../store/ragDetailStore';
import 'katex/dist/katex.min.css';

interface SegmentMarkdownProps {
  content: string;
  className?: string;
}

const SegmentMarkdown: React.FC<SegmentMarkdownProps> = ({
  content,
  className
}) => {
  const { openImageModal } = useRagDetailStore();

  return (
    <div className={cn(className, 'markdown-body-cec markdown-body')}>
      <ReactMarkdown
        remarkPlugins={[
          RemarkGfm,
          [RemarkMath, { singleDollarTextMath: false }],
          RemarkBreaks
        ]}
        rehypePlugins={[
          RehypeRaw as any,
          [
            RehypeKatex,
            {
              strict: false,
              trust: false,
              output: 'html',
              throwOnError: false,
              displayMode: false
            }
          ]
        ]}
        disallowedElements={[
          'iframe',
          'head',
          'html',
          'meta',
          'link',
          'style',
          'body',
          'input'
        ]}
        components={{
          // 自定义代码组件,排除math类型
          code: ({ inline, className, children, ...props }: any) => {
            // 检查是否是math语言(公式)
            const match = /language-(\w+)/.exec(className || '');
            const language = match?.[1];

            // 如果是math语言,直接返回纯文本(公式会被rehype-katex处理)
            if (language === 'math') {
              return <code {...props}>{children}</code>;
            }

            // 行内代码
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            // 其他代码块不显示(避免显示代码块样式)
            return <code {...props}>{children}</code>;
          },
          sup: ({ children, className: supClassName, ...rest }) => (
            <Sup className={supClassName} {...rest}>
              {children}
            </Sup>
          ),
          // 自定义图片组件,支持点击放大
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              {...props}
              className="my-2 cursor-pointer rounded-lg shadow-md transition-all hover:shadow-lg"
              style={{
                width: '200px',
                height: '150px',
                objectFit: 'cover',
                display: 'block',
                maxWidth: '100%'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (src) {
                  openImageModal(src);
                }
              }}
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default memo(SegmentMarkdown);
