import type { FC } from 'react'
import React, { useState } from 'react'
import type { CodeNodeType } from './types'
import type { NodeProps } from '@/pages/workflowConfig/workflow/types'
import { RiArrowDownSFill } from '@remixicon/react'
import { useStoreApi } from 'reactflow'
import { Tooltip } from '@arco-design/web-react';
import './date-cleaning.scss';
const Node: FC<NodeProps<CodeNodeType>> = (props) => {
  const { data_standardization } = props.data;

  const store = useStoreApi()
  console.log(data_standardization, 'data_standardization');
  const items = [
    '数据标准化',
    '数据过滤',
    '特殊字符删除',
    '特殊字符过滤',
    '去除敏感词',
    '数据去重',
    '相似度去重',
    '数据去毒化',
    '数据填补',
    '异常值处理'
  ];
  const MAX_VISIBLE_ITEMS = 2;
  const extraCount =
    data_standardization?.length - MAX_VISIBLE_ITEMS;
  const allItemsText = items.join('、');

  return (
    <div className={`wk-node-content data-cleaning-node`}>
      <span className="node-title">清洗类型</span>
      {/*  {data_category?.[0]?.enabled && data_category?.[0]?.format.length > 0 && <div>文档</div>} */}
      <div className="node-item-content">
        {data_standardization?.[0]?.enabled && (
          <div className="node-item">数据标准化</div>
        )}
        {data_standardization?.[1]?.enabled && (
          <div className="node-item">数据过滤</div>
        )}
        {data_standardization?.[2]?.enabled && (
          <div className="node-item">特殊字符删除</div>
        )}
        {data_standardization?.[3]?.enabled && (
          <div className="node-item">特殊字符过滤</div>
        )}
        {data_standardization?.[4]?.enabled && (
          <div className="node-item">去除敏感词</div>
        )}
        {data_standardization?.[5]?.enabled && (
          <div className="node-item">数据去重</div>
        )}
        {data_standardization?.[6]?.enabled && (
          <div className="node-item">相似度去重</div>
        )}
        {data_standardization?.[7]?.enabled && (
          <div className="node-item">数据去毒化</div>
        )}
        {data_standardization?.[8]?.enabled && (
          <div className="node-item">异常值处理</div>
        )}
        {data_standardization?.[9]?.enabled && (
          <div className="node-item">异常值处理</div>
        )}

        {/* {items.slice(0, MAX_VISIBLE_ITEMS).map((item, index) => (
          <span key={index} className="node-item">
            {item}
          </span>
        ))} */}
        {/* {extraCount > 0 && (
          <Tooltip content={allItemsText}>
            <span className="node-item">+{extraCount}</span>
          </Tooltip>
        )} */}
      </div>
    </div>
  );
}

export default React.memo(Node)
