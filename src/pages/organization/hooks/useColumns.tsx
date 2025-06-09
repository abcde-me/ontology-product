// useColumns.tsx
import React from 'react';
import { Space, Button, Popconfirm, Tag } from '@arco-design/web-react';
import { useOrgEditor } from '../components/OrgProvider/Context';
import dayjs from 'dayjs';
import { render } from '@headlessui/react/dist/utils/render';
export function useColumns() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const columns = [
    {
      title: '成员',
      dataIndex: 'username',
      key: 'username'
    },
    // 账号状态
    {
      title: '账号状态',
      dataIndex: 'status',
      key: 'status',
        render: (status: string) => {
        return status === 'active' ? (
          <Tag color="#0AB58D">启用</Tag>
        ) : (
          <Tag color="#EF4D29">停用</Tag>
        );
      }
    },
    // 部门
    {
      title: '部门',
      dataIndex: 'organization_full',
      key: 'organization_full'
    },
    // 角色
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role'
    },
    // 手机号
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    // 时间
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => { 
        // 格式化时间，日期以-分隔
        // 例如：2023-10-01 12:00
        return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'operation',
      width: 160,
      fixed: 'right',
      render: (text: string, record: any) => {
        return (
          <Space>
         
     <Button type="text" onClick={() => {
                             orgStore.pauseMember(record);
                          }}>
                           {
                             record.status === 'active' ? '停用' : '启用'  
                           }
                          </Button>
            <Popconfirm
              focusLock
              title="确定要删除该用户吗?"
              content="删除用户将无法撤销，用户将无法登录系统，用户创建的资源不会被移除。"
              onOk={() => {
                       orgStore.deleteMember(record.id);
              }}
            >
              <Button type="text">删除</Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return columns;
}
