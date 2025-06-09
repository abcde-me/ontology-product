// useColumns.tsx
import React from 'react';
import { Button, Space } from '@arco-design/web-react';
import WorkflowIcon from '@/assets/workflow.svg';
import { useAgentEditor } from '@/pages/agentTwo/agentCreate/compontents/AgentProvider/Context';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { useParams } from '@/hooks/useParmas';
import { useHistory } from 'react-router-dom'
export function useColumns() {
  const history = useHistory();
  const agent = useAgentEditor();
  const { workflowStore } = agent;
  const { selectedList } = workflowStore.useGetState();
  const id = useParams('id');

  const isInSelectedList = (record: DataSet) => {
    return selectedList.some((item) => item.id === record.id);
  };

  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        const { name } = record;
        return (
          <div className="flex items-center">
            <div className="mr-2">
              <WorkflowIcon />
            </div>
            <div>{name}</div>
          </div>
        );
      }
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
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
          <Space>
            <Button onClick={() => {
              history.push(`/tenant/compute/appforge/workflowConfig?id=${record.id}`)
            }}>查看</Button>
            <Button
              onClick={() => {
                if (isAdded) {
                  workflowStore.removeFromKnowList(record.id);
                } else {
                  workflowStore.addToKnowList(record);
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
