import React from 'react';
import { memo } from 'react';

import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RemarkBreaks from 'remark-breaks';
import RemarkGfm from 'remark-gfm';
import RehypeRaw from 'rehype-raw';

import cn from '@/pages/workflowConfig/utils/classnames';

import { RichCode, Sup } from './components';

const MarkDownBase = (props: {
  content: string;
  className?: string;
  onChangeSup?: (con: string) => void;
}) => {
  return (
    <div className={cn(props.className, 'markdown-body-cec markdown-body')}>
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
            <Sup
              className={className}
              onChangeSup={props.onChangeSup}
              {...rest} // 传递其他所有props
            >
              {children}
            </Sup>
          )
        }}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  );
};

export default memo(MarkDownBase);
