import type { FC } from 'react'
import React, { useState } from 'react'
import type { CodeNodeType } from './types'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'
import { useStoreApi } from 'reactflow'
import { Tooltip } from '@arco-design/web-react';
import './date-cleaning.scss';
const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const { variables = [], outputs = [] } = props.data

  const store = useStoreApi()

  const items = [
    '数据标准化',
    '数据过滤',
    '特殊字符删除',
    '特殊字符过滤',
    '去除敏感词',
    '数据去重',
    '数据去毒化',
    '数据填补',
    '异常值处理',
  ];
  const MAX_VISIBLE_ITEMS = 2;
  const extraCount = items.length - MAX_VISIBLE_ITEMS;
  const allItemsText = items.join('、');

  return (
    <div className={`wk-node-content data-cleaning-node`}>
      <span className="node-title">清洗类型</span>
      <div className="node-item-content">
        {items.slice(0, MAX_VISIBLE_ITEMS).map((item, index) => (
          <span key={index} className="node-item">
            {item}
          </span>
        ))}
        {extraCount > 0 && (
          <Tooltip content={allItemsText}>
            <span className="node-item">+{extraCount}</span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default React.memo(Node)
