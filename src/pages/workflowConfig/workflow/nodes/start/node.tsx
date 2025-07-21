import { FC, useEffect, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InputVarTypeIcon from '../_base/components/input-var-type-icon';
import type { StartNodeType } from './types';
import {
  BlockEnum,
  type NodeProps
} from '@/pages/workflowConfig/workflow/types';
import { RiArrowDownSFill } from '@remixicon/react';
import { getCatalogList } from '@/api/dataCatalog';
import useConfig from './use-config';
import { useNodeDataUpdate } from '@/pages/workflowConfig/workflow/hooks';
import { useStoreApi } from 'reactflow';

const i18nPrefix = 'workflow.nodes.start';

const Node: FC<NodeProps<StartNodeType>> = ({ id, data }) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { data_path_name, data_category, data_path_id } = data;
  const { updatePathName } = useConfig(id, data);
  const { handleNodeDataUpdateWithSyncDraft } = useNodeDataUpdate();
  const store = useStoreApi();

  const hasFileTypes =
    (data_category?.[0]?.enabled && data_category?.[0]?.format.length > 0) ||
    (data_category?.[1]?.enabled && data_category?.[1]?.format.length > 0) ||
    (data_category?.[2]?.enabled && data_category?.[2]?.format.length > 0) ||
    (data_category?.[3]?.enabled && data_category?.[3]?.format.length > 0);

  useEffect(() => {
    getCatalogList({ root_type: 1 }).then((res) => {
      const dirs: Record<string, any>[] = [];
      res.data.src.forEach((catalog) => {
        dirs.push(...(catalog.children?.volume || []));
      });
      const selectedDir = dirs.find((d) => d.id === data_path_id);
      if (selectedDir) {
        if (selectedDir.name !== data_path_name) {
          updatePathName(selectedDir.name);
        }
      } else {
        const { getNodes } = store.getState();
        const targetNodes = getNodes().filter((node: any) =>
          [
            BlockEnum.Pic,
            BlockEnum.Text,
            BlockEnum.Video,
            BlockEnum.Audio
          ].includes(node.data.type)
        );
        targetNodes.forEach((n: any) => {
          handleNodeDataUpdateWithSyncDraft({
            id: n.id,
            data: {
              ...n.data,
              selected_files_num: 0,
              files: []
            }
          });
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`wk-node-content`}>
      <div className={`input-section`}>
        <div className="input-header">
          <span className="txt">数据源目录</span>
        </div>
        <div className="input-list">
          {!!data_path_name && (
            <div className="input-var-item">
              <span className="key-txt !font-semibold">{data_path_name}</span>
            </div>
          )}
          {!data_path_name && (
            <div className="input-var-item">
              <span className="extra-info !font-semibold">未配置</span>
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
              <span className="extra-info !font-semibold">未配置</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Node);
