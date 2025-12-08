import React, { useState, useRef, useEffect, useCallback } from 'react';
import { memo } from 'react';

import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RemarkBreaks from 'remark-breaks';
import RemarkGfm from 'remark-gfm';
import RehypeRaw from 'rehype-raw';

import cn from '@/pages/workflowConfig/utils/classnames';

import { RichCode, Sup } from './components';

interface MarkdownBaseProps {
  content: string;
  className?: string;
  onChangeSup?: (con: string) => void;
  onChangetp?: (inx: number, tp: boolean) => void;
  lineLimit?: number; // 限制显示的行数，默认8行
  expandText?: string; // 展开按钮文本
  collapseText?: string; // 折叠按钮文本
  type?: boolean;
  Expanded?: boolean;
  index: number;
}

const MarkDownBase: React.FC<MarkdownBaseProps> = ({
  content,
  className,
  onChangetp,
  onChangeSup,
  lineLimit,
  expandText = '展开全部',
  collapseText = '收起',
  type,
  Expanded,
  index
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null);

  // 计算限制的最大高度 (基于行高*行数)
  const getMaxHeight = useCallback(() => {
    if (!markdownRef.current) return 'none';

    const element = markdownRef.current;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 24;
    return `${lineHeight * lineLimit}px`;
  }, [lineLimit]);
  //
  useEffect(() => {
    setIsExpanded(!Expanded);
  }, [Expanded]);
  // 检查内容是否溢出
  useEffect(() => {
    const checkOverflow = () => {
      if (markdownRef.current) {
        const element = markdownRef.current;
        const maxHeight = getMaxHeight();

        // 如果设置了max-height，检查是否溢出
        if (maxHeight !== 'none') {
          const parsedMaxHeight = parseFloat(maxHeight);
          setIsOverflowing(element.scrollHeight > parsedMaxHeight);
          onChangetp(index, element.scrollHeight > parsedMaxHeight);
        } else {
          setIsOverflowing(false);
          onChangetp(index, false);
        }
      }
    };

    // 初始检查
    checkOverflow();

    // 监听窗口大小变化，重新检查
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (markdownRef.current) {
      resizeObserver.observe(markdownRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, getMaxHeight, lineLimit]);

  // 切换展开/折叠状态
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn(className, 'markdown-body-cec markdown-body relative')}>
      <div
        ref={markdownRef}
        className={cn(
          isOverflowing && !isExpanded ? 'overflow-hidden' : '',
          'relative transition-all duration-300'
        )}
        style={
          isOverflowing && !isExpanded ? { maxHeight: getMaxHeight() } : {}
        }
      >
        <ReactMarkdown
          remarkPlugins={[
            RemarkGfm,
            [RemarkMath, { singleDollarTextMath: false }],
            RemarkBreaks
          ]}
          rehypePlugins={[RehypeRaw as any]}
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
            code: RichCode,
            sup: ({ children, className, ...rest }) => (
              <Sup className={className} onChangeSup={onChangeSup} {...rest}>
                {children}
              </Sup>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* 只有内容溢出且未展开时显示渐变遮罩 */}
      {isOverflowing && !isExpanded && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 cursor-pointer"></div>
      )}

      {/* 展开/折叠按钮 */}

      {type && isOverflowing && (
        <button
          className="text-primary hover:text-primary-dark mt-2 flex items-center gap-1 transition-colors duration-200"
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <>
              <span className="text-[#438DFB]">{collapseText}</span>
              <i className="fa fa-chevron-up text-xs"></i>
            </>
          ) : (
            <>
              <span className="text-[#438DFB]">{expandText}</span>
              <i className="fa fa-chevron-down text-xs"></i>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default memo(MarkDownBase);
