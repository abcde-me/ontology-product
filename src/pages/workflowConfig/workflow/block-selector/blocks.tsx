import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash-es';
import BlockIcon from '../block-icon';
import { BlockEnum } from '../types';
import { useNodesExtraData } from '../hooks';
import { BLOCK_CLASSIFICATIONS } from './constants';
import { useBlocks } from './hooks';
import type { ToolDefaultValue } from './types';
import Tooltip from '@/pages/workflowConfig/components/tooltip';
import { useParams } from 'react-router-dom';

type BlocksProps = {
  searchText: string;
  onSelect: (type: BlockEnum, tool?: ToolDefaultValue) => void;
  availableBlocksTypes?: BlockEnum[];
};
const Blocks = ({
  searchText,
  onSelect,
  availableBlocksTypes = []
}: BlocksProps) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const nodesExtraData = useNodesExtraData();
  const blocks = useBlocks();

  const groups = useMemo(() => {
    return BLOCK_CLASSIFICATIONS.reduce(
      (acc, classification) => {
        const list = groupBy(blocks, 'classification')[classification].filter(
          (block) => {
            return (
              block.title.toLowerCase().includes(searchText.toLowerCase()) &&
              availableBlocksTypes.includes(block.type)
            );
          }
        );

        return {
          ...acc,
          [classification]: list
        };
      },
      {} as Record<string, typeof blocks>
    );
  }, [blocks, searchText, availableBlocksTypes]);
  const isEmpty = Object.values(groups).every((list) => !list.length);

  // 过滤暂时无用节点
  const renderGroup = useCallback(
    (classification: string) => {
      const list = groups[classification];
      return (
        <div
          key={classification}
          className="block-nodes-group mb-1 last-of-type:mb-0"
        >
          {/* {
          classification !== '-' && !!list.length && (
            <div className='nodes-group-title flex items-start px-3 h-[22px] text-xs font-medium text-text-tertiary'>
              {t(`workflow.tabs.${classification}`)}
            </div>
          )
        } */}
          {list.map((block) => (
            <Tooltip
              key={block.type}
              position="right"
              popupClassName="w-[200px] rounded-[12px] p-[16px]"
              popupContent={
                <div>
                  <div className="mb-[8px] flex items-center gap-x-[8px]">
                    <BlockIcon
                      size="md"
                      className="size-[20px]"
                      type={block.type}
                    />
                    <div className="system-md-medium text-[16px]/[24px] text-text-primary ">
                      {block.title}
                    </div>
                  </div>
                  <div className="system-xs-regular text-[12px]/[20px] text-[#6E7B8D] text-text-tertiary">
                    {nodesExtraData[block.type]?.about}
                  </div>
                </div>
              }
            >
              <div
                key={block.type}
                className="nodes-group-item flex h-8 w-full cursor-pointer items-center rounded-lg px-3 hover:bg-state-base-hover"
                onClick={() => onSelect(block.type)}
              >
                <BlockIcon
                  className="node-icon mr-[8px] h-[20px] w-[20px] shrink-0"
                  type={block.type}
                />
                <div className="node-title text-sm text-text-secondary">
                  {block.title}
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      );
    },
    [groups, nodesExtraData, onSelect, t]
  );

  return (
    <div className="block-nodes-list">
      {isEmpty && (
        <div className="flex h-[22px] items-center justify-center px-3 text-xs font-medium text-text-tertiary">
          未搜索到节点
        </div>
      )}
      {!isEmpty && BLOCK_CLASSIFICATIONS.map(renderGroup)}
    </div>
  );
};

export default memo(Blocks);
