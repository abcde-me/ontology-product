import type { FC } from 'react';
import React, { memo } from 'react';
import { BlockEnum } from './types';
// import {
//   Agent,
//   Answer,
//   Assigner,
//   Code,
//   DocsExtractor,
//   End,
//   Home,
//   Http,
//   IfElse,
//   Iteration,
//   KnowledgeRetrieval,
//   ListFilter,
//   Llm,
//   Loop,
//   ParameterExtractor,
//   QuestionClassifier,
//   TemplatingTransform,
//   VariableX,
// } from '@remixicon/react'
import { RiApps2Fill } from '@remixicon/react';
import AppIcon from '@/pages/workflowConfig/components/app-icon';

type BlockIconProps = {
  type: BlockEnum;
  size?: string;
  className?: string;
  toolIcon?: string | { content: string; background: string };
};
const ICON_CONTAINER_CLASSNAME_SIZE_MAP: Record<string, string> = {
  xs: 'w-4 h-4 rounded-[5px] shadow-xs',
  sm: 'w-5 h-5 rounded-md shadow-xs',
  md: 'w-6 h-6 rounded-[4px] shadow-md'
};
const getIcon = (type: BlockEnum, className: string) => {
  return <RiApps2Fill className={className} />;
};
const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  [BlockEnum.Start]: 'bg-util-colors-blue-brand-blue-brand-500',
  [BlockEnum.Text]: 'bg-util-colors-indigo-indigo-500',
  [BlockEnum.Pic]: 'bg-util-colors-blue-blue-500',
  [BlockEnum.Audio]: 'bg-util-colors-warning-warning-500',
  [BlockEnum.Video]: 'bg-util-colors-cyan-cyan-500',
  [BlockEnum.Cleaning]: 'bg-util-colors-cyan-cyan-500',
  [BlockEnum.Enhancement]: 'bg-util-colors-cyan-cyan-500',
  [BlockEnum.Customize]: 'bg-util-colors-cyan-cyan-500',
  [BlockEnum.End]: 'bg-util-colors-warning-warning-500',
  [BlockEnum.SQL]: 'bg-util-colors-warning-warning-350',
  [BlockEnum.Seatunnel]: 'bg-util-colors-blue-brand-blue-brand-450',
  [BlockEnum.Dependent]: 'bg-util-colors-green-green-350'
};
const BlockIcon: FC<BlockIconProps> = ({
  type,
  size = 'sm',
  className,
  toolIcon
}) => {
  return (
    <div
      className={`
      flex items-center justify-center border-[0.5px] border-white/2 text-white
      ${ICON_CONTAINER_CLASSNAME_SIZE_MAP[size]}
      ${ICON_CONTAINER_BG_COLOR_MAP[type]}
      ${toolIcon && '!shadow-none'}
      ${className}
      wk-icon ${type}
    `}
    >
      {toolIcon && (
        <>
          {typeof toolIcon === 'string' ? (
            <div
              className="h-full w-full shrink-0 rounded-md bg-cover bg-center"
              style={{
                backgroundImage: `url(${toolIcon})`
              }}
            ></div>
          ) : (
            <AppIcon
              className="!h-full !w-full shrink-0"
              size="tiny"
              icon={toolIcon?.content}
              background={toolIcon?.background}
            />
          )}
        </>
      )}
    </div>
  );
};

export const VarBlockIcon: FC<BlockIconProps> = ({ type, className }) => {
  return <>{getIcon(type, `w-3 h-3 ${className}`)}</>;
};

export default memo(BlockIcon);
