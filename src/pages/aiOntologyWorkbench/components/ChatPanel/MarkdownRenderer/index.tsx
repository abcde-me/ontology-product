/**
 * MarkdownRenderer - Markdown 内容渲染器
 * 使用 ai-chat-library 的 MdContent 组件
 */
import React from 'react';
import { MdContent } from '@ceai-front/chat';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <MdContent
      content={content}
      imgProps={{
        preview: true,
        width: '60%',
        height: 'auto'
      }}
    />
  );
};

export default MarkdownRenderer;
