import { FC, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InputVarTypeIcon from '../_base/components/input-var-type-icon';
import type { StartNodeType } from './types';
import type { NodeProps } from '@/pages/workflowConfig/workflow/types';
import { RiArrowDownSFill } from '@remixicon/react';

const i18nPrefix = 'workflow.nodes.start';

const Node: FC<NodeProps<StartNodeType>> = ({ data }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { source_path, data_category } = data;

  const hasFileTypes =
    data_category?.[0]?.enabled ||
    data_category?.[1]?.enabled ||
    data_category?.[2]?.enabled ||
    data_category?.[3]?.enabled;

  console.log('variables', data_category);
  return (
    <div className={`wk-node-content`}>
      <div className={`input-section`}>
        <div className="input-header">
          <span className="txt">数据源目录</span>
        </div>
        <div className="input-list">
          {!!source_path && (
            <div className="input-var-item">
              <span className="key-txt">{source_path}</span>
            </div>
          )}
          {!source_path && (
            <div className="input-var-item">
              <span className="extra-info">未配置</span>
            </div>
          )}
        </div>
      </div>
      <div className={`input-section`}>
        <div className="input-header">
          <span className="txt">文件类型</span>
        </div>
        <div className="input-list">
          {!!hasFileTypes && (
            <div className="input-var-item flex !justify-normal gap-x-[4px] *:rounded-[4px] *:bg-[#E2E8F0] *:px-[4px] *:text-[12px]/[18px] *:text-[#0F172A]">
              {data_category?.[0]?.enabled &&
                data_category?.[0]?.format.length > 0 && <div>文档</div>}
              {data_category?.[1]?.enabled &&
                data_category?.[1]?.format.length > 0 && <div>图片</div>}
              {data_category?.[2]?.enabled &&
                data_category?.[2]?.format.length > 0 && <div>音频</div>}
              {data_category?.[3]?.enabled &&
                data_category?.[3]?.format.length > 0 && <div>视频</div>}
            </div>
          )}
          {!hasFileTypes && (
            <div className="input-var-item">
              <span className="extra-info">未配置</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
