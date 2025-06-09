// useColumns.tsx
import React from 'react';
import { Button, Tag, Space } from '@arco-design/web-react';
import KnowIcon from '@/assets/know.svg';
import { useAgentEditor } from '@/pages/agentTwo/agentCreate/compontents/AgentProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { useParams } from '@/hooks/useParmas';
import { useHistory } from 'react-router-dom'


export function useColumns() {
  const history = useHistory()
  const agent = useAgentEditor();
  const { knowStore } = agent;
  const { selectedList } = knowStore.useGetState();
  const id = useParams('id');

  const isInSelectedList = (record: DataSet) => {
    return selectedList.some((item) => item.id === record.id);
  };

  const handleViewKnow = (record) => {
    const path = `/tenant/compute/appforge/configurationpage?id=${record?.id}`;
    history.push(path);
  }

  const columns = [
    {
      title: '知识库名称',
      dataIndex: 'name',
      key: 'name',
      width: '33%',
      render: (_, record) => {
        const { name, document_count, size } = record;
        return (
          <div className="flex">
            <div className="mr-2">
              <KnowIcon />
            </div>
            <div>
              <div>{name}</div>
              <div>
                <Tag className="border-radius-sm mr-2 border border-gray-300 bg-white text-black">
                  {document_count}个
                </Tag>
                <Tag className="border-radius-sm border border-gray-300 bg-white text-black">
                  {size / 1000} KB
                </Tag>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '33%',
      render: (created_at: string) => {
        // 转成 2025-05-14 10:00:00
        const date = new Date(created_at);
        return date
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          .replace(/\//g, '-');
      }
    },
    {
      title: '操作',
      key: 'operation',
      render: (_: any, record: DataSet) => {
        const isAdded = isInSelectedList(record);
        return (
          <Space className="flex justify-end">
            <Button onClick={() => handleViewKnow(record)}>查看</Button>
            <Button
              onClick={() => {
                if (isAdded) {
                  knowStore.removeFromKnowList(record.id);
                } else {
                  knowStore.addToKnowList(record);
                }
                agent.infoStore.updateAgentConfigData(id);
              }}
            >
              {isAdded ? '移除' : '添加'}
            </Button>
          </Space>
        );
      }
    }
  ];

  return columns;
}
