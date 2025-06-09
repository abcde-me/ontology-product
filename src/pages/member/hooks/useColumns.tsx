// useColumns.tsx
import { Button, Popconfirm, Space, Tag } from '@arco-design/web-react';
import React from 'react';
import { useMemberEditor } from '../components/MemberProvider/Context';
import dayjs from 'dayjs';


export function useColumns() {
  const member = useMemberEditor();
  const { memberStore } = member;
  const columns = [
    {
      title: '姓名',
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
      width: 220,
      fixed: 'right',
      render: (text: string, record: any) => {
        const isSuperAdmin = record.role === '超级管理员';
        return (
          !isSuperAdmin && <Space>
            <Button
              type="text"
              onClick={() => {
                memberStore.setVisible(true);
                memberStore.setCurrentMember(record);
              }}
            >
              修改
            </Button>
                       <Button type="text" onClick={() => {
                          memberStore.pauseMember(record);
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
                memberStore.deleteMember(record.id);
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
