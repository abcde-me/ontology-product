import type { FC } from 'react';
import React, { useState } from 'react';

import cn from 'classnames';
import type { ToolInfoInThought, Emoji } from '@/utils/type';
import Panel from './panel';
import AppIcon from '@/components/app-icon';
import {
  IconBook,
  IconCheckCircle,
  IconDown,
  IconLoading
} from '@arco-design/web-react/icon';

type Props = {
  payload: ToolInfoInThought;
  allToolIcons?: Record<string, string | Emoji>;
};

const getIcon = (
  toolName: string,
  allToolIcons: Record<string, string | Emoji>
) => {
  if (toolName.startsWith('dataset-'))
    return <IconBook className="text-[16px]" />;
  const icon = allToolIcons[toolName];
  if (!icon) return null;
  return typeof icon === 'string' ? (
    <div
      className="h-3 w-3 shrink-0 rounded-[3px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${icon})`
      }}
    ></div>
  ) : (
    <AppIcon
      className="shrink-0 rounded-[3px]"
      size="xs"
      icon={icon?.content}
      background={icon?.background}
    />
  );
};

const Tool: FC<Props> = ({ payload, allToolIcons = {} }) => {
  const { name, input, isFinished, output } = payload;
  const toolName = name.startsWith('dataset-') ? '知识库' : name;
  const [isShowDetail, setIsShowDetail] = useState(false);
  const icon = getIcon(toolName, allToolIcons) as any;
  return (
    <div>
      <div
        className={cn(
          !isShowDetail && 'shadow-sm',
          !isShowDetail && 'inline-block',
          'max-w-full overflow-x-auto rounded-md bg-white'
        )}
      >
        <div
          className={cn('flex h-7 cursor-pointer items-center px-2')}
          onClick={() => setIsShowDetail(!isShowDetail)}
        >
          {!isFinished && (
            <IconLoading spin className="shrink-0 text-[16px] text-gray-500" />
          )}
          {isFinished && !isShowDetail && (
            <IconCheckCircle className="shrink-0 text-[16px] text-[#12B76A]" />
          )}
          {isFinished && isShowDetail && icon}
          <span className="mx-1 shrink-0 text-xs font-medium text-gray-500">
            {isFinished ? '已使用' : '正在使用'}
          </span>
          <span
            className="truncate text-xs font-medium text-gray-700"
            title={toolName}
          >
            {toolName}
          </span>
          <IconDown
            className={cn(
              isShowDetail && 'rotate-180',
              'shrink-0 cursor-pointer select-none text-[16px] text-gray-500'
            )}
          />
        </div>
        {isShowDetail && (
          <div className="space-y-2 border-t border-black/5 p-2 ">
            <Panel isRequest={true} toolName={toolName} content={input} />
            {output && (
              <Panel
                isRequest={false}
                toolName={toolName}
                content={output as string}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default React.memo(Tool);
