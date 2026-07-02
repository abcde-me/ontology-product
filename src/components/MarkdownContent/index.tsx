import React from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkGfm from 'remark-gfm';
import classNames from 'classnames';

const remarkGfmPlugin = ((RemarkGfm as any).default ??
  RemarkGfm) as typeof RemarkGfm;

export function isHtmlContent(content: string): boolean {
  return /^<[a-z][\s\S]*>/i.test(content.trim());
}

export function isEmptyMarkdownContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed || trimmed === '<br>') {
    return true;
  }
  if (isHtmlContent(trimmed)) {
    return !trimmed.replace(/<[^>]+>/g, '').trim();
  }
  return false;
}

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({
  content,
  className
}: MarkdownContentProps) {
  const normalized = content.replace(/\r\n/g, '\n');

  if (isHtmlContent(normalized)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: normalized }}
      />
    );
  }

  return (
    <div className={classNames('markdown-body', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfmPlugin]}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
