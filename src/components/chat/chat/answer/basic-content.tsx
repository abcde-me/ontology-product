import React from 'react';
import type { FC } from 'react';
import { memo } from 'react';
import type { ChatItem } from '@/utils/type';
import { Markdown } from '@/components/markdown';

type BasicContentProps = {
  item: ChatItem;
};
const BasicContent: FC<BasicContentProps> = ({ item }) => {
  const { annotation, content } = item;

  if (annotation?.logAnnotation)
    return <Markdown content={annotation?.logAnnotation.content || ''} />;

  if (content.includes('<div')) {
    return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
  }
  return <Markdown content={content} />;
};

export default memo(BasicContent);
