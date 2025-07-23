// useColumns.tsx
import React from 'react';
import {
  Space,
  Tooltip,
  Tag,
  Avatar,
  Message,
  Modal
} from '@arco-design/web-react';
import { OperationColumn } from '@ccf2e/arco-material';
import {
  IconCheckCircleFill,
  IconCloseCircleFill
} from '@arco-design/web-react/icon';
import { useOrgEditor } from '../components/OrgProvider/Context';
import dayjs from 'dayjs';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { preDelUser } from '@/api/user';

export function useColumns() {
  const org = useOrgEditor();
  const { orgStore } = org;
  const columns = [
    {
      title: '姓名/用户名',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      minWidth: 200,
      render: (username: string, item: any) => {
        return (
          <div>
            <Space size="medium">
              <Avatar className="ai-avatar">
                {item?.username[0]?.toLocaleUpperCase()}
              </Avatar>
              <Space
                direction="vertical"
                size="mini"
                style={{ width: '100px' }}
              >
                {/* <Typography.Text  ellipsis={{ 
                    showTooltip: true,
                  }}
                  >{item.username}</Typography.Text>
                <Typography.Text  ellipsis={{ 
                    showTooltip: true,
                  }}
                  >{item.account}</Typography.Text> */}
                <EllipsisPopover
                  value={item.username}
                  isEdit={false}
                  preferTypography
                />
                <EllipsisPopover
                  value={item.account}
                  isEdit={false}
                  preferTypography
                />
              </Space>
            </Space>
          </div>
        );
      }
    },
    // 账号状态
    {
      title: '账号状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return status === 'active' ? (
          <Tag style={{
            width: '62px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: '#DBF4EE',
            color: '#0AB58D',
            padding: '0 11px 0 8px',
          }} size='medium' icon={<IconCheckCircleFill />} color="green">
            启用
          </Tag>
        ) : (
          <Tag
            style={{
              width: '62px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: '#FFECE5',
              color: '#EF4D29',
              padding: '0 11px 0 8px',

            }}
            size='medium' icon={<IconCloseCircleFill />} color="orange">
            停用
          </Tag>
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
      key: 'phone',
      render: (text: string) => {
        return text || '-';
      }
    },
    // 职位
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      render: (text: string) => {
        return text || '-';
      }
    },
    // 描述
    {
      title: '备注',
      dataIndex: 'mark',
      key: 'mark',
      render: (item) => {
        if (!item) return '-';
        // 增加截断，tooltip
        if (item.length > 10) {
          return (
            <Tooltip content={item}>
              <div>{item.slice(0, 10)}...</div>
            </Tooltip>
          );
        }
        return <div>{item}</div>;
      }
    },
    // 时间
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 200,
      render: (text: string) => {
        if (!text) return '-';
        // 格式化时间，日期以-分隔
        // 例如：2023-10-01 12:00
        return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: (_, row, index) => {
        const config: any = [
          {
            label: '停用',
            hiddenMatching: [
              {
                matchingCallback: (row) => row.status !== 'active'
              }
            ],
            onClick: (row, index) => {
              Modal.confirm({
                title: '确定要停用该用户吗?',
                content: '停用后用户将无法登录系统。',
                async onOk() {
                  const res = await orgStore.pauseMember(row);
                  if (res.success) {
                    Message.success('停用成功');
                  }
                }
              });
            }
          },
          {
            label: '启用',
            hiddenMatching: [
              {
                matchingCallback: (row) => row.status === 'active'
              }
            ],
            onClick: async (row, index) => {
              const res = await orgStore.pauseMember(row);
              if (res.success) {
                Message.success('启用成功');
              }
            }
          },
          {
            label: '删除',
            onClick: async (row, index) => {
              const res = await preDelUser({ userId: row.id });
              if (!res.data.access) {
                orgStore.setPreDeleteUserVisible(true);
                return;
              }
              Modal.confirm({
                style: { width: '400px' },
                title: '确定要删除该用户吗?',
                content: (
                  <div className="pl-6">
                    删除用户将无法撤销，用户将无法登录系统，用户创建的资源不会被移除。
                  </div>
                ),
                async onOk() {
                  const res = await orgStore.deleteMember(row.id);
                  if (res.success) {
                    Message.success('删除成功');
                  }
                }
              });
            }
          }
        ];

        return (
          <OperationColumn
            row={row}
            index={index}
            config={config}
            extendFont="更多"
          />
        );
      }
    }
  ];

  return columns;
}
