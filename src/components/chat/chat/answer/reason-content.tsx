import React, { type CSSProperties, type PropsWithChildren } from 'react';
import ReactMarkdown from 'react-markdown';
import { Markdown } from '@/components/markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import './reason.less';

export function formatMarkdown(str: string) {
  const thinkStartMatch = str?.match(/\<think\>/);
  const thinkEndMatch = str?.match(/\<\/think\>/);
  if (thinkStartMatch && !thinkEndMatch) {
    const regex = /<think>\s*(.*)$/gs;
    return str?.replace(regex, (match, p1) => {
      return `<div class="think">\n\n<div>\n\n${p1}\n\n</div>\n\n</div>`;
    });
  }

  const regex = /<think>\s*(.*)\s*<\/think>/gs;
  return str?.replace(regex, (match, p1) => {
    return `<div class="think">\n\n<div>\n\n${p1}\n\n</div>\n\n</div>`;
  });
}

export type ChatMarkdownProps = PropsWithChildren<
  Partial<{
    style: CSSProperties;
    className: string;
    content?: string;
  }>
>;

export default function ChatMarkdown({ content }: ChatMarkdownProps) {
  const formattedContent = formatMarkdown(content || '');
  console.debug('🚀 ~ formattedContent:', formattedContent);
  return content ? (
    // <ReactMarkdown rehypePlugins={[rehypeRaw as any]} remarkPlugins={[remarkGfm]}>
    //   {formattedContent}
    // </ReactMarkdown>
    <Markdown content={ formattedContent } />
  ) : null;
}
