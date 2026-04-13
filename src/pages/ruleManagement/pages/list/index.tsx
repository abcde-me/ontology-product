import React, { useState } from 'react';
import styles from './index.module.scss';
import PageHeader from '@/components/PageHeader';
import {
  AddButton,
  DotStatus,
  GlobalTooltip,
  SearchTable
} from '@ceai-front/arco-material';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Space,
  TableColumnProps,
  Tag,
  Tooltip
} from '@arco-design/web-react';
import { EllipsisPopover } from '@ceai-front/arco-material';
import {
  AutoRuleDetail,
  AutoRuleItem,
  RULE_STATUS_MAP
} from '@/pages/ruleManagement/types';
import { useArcoTable, useHasPermission } from '@/hooks';
import {
  deleteAutoRule,
  getAutoRuleList,
  offlineAutoRule,
  onlineAutoRule,
  Order
} from '@/api/businessAutomation/list';
import { useHistory } from 'react-router-dom';
import { AutoRuleDrawer } from '@/pages/ruleManagement/components';
import { FunctionDetailDrawer } from '@/pages/ontologyScene/components/FunctionDetailDrawer';
import { AUTOMATION_PERMISSIONS } from '@/config/permissions';
import { PermissionWrapper } from '@/components/PermissionGuard';
import PermissionButton from '@/components/PermissionButton';
import { isNil } from 'lodash-es';

const TRIGGER_TYPE_MAP: Record<number, string> = {
  1: '定时触发',
  2: '变更触发'
};

const RuleListPage = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  const [showRule, setShowRule] = useState<React.Key>();
  const [showFunction, setShowFunction] = useState<number>();
  const ruleInfoViewAble = useHasPermission(AUTOMATION_PERMISSIONS.GET);

  const routeToInfo = (pageType: string, ruleId?: number) => {
    if (!ruleId)
      return history.push(
        '/tenant/compute/onto/businessAutomation/management/info/create'
      );
    history.push(
      `/tenant/compute/onto/businessAutomation/management/info/${pageType}/${ruleId}`
    );
  };

  const handleDelete = (record: AutoRuleItem) => {
    Modal.confirm({
      title: '删除规则',
      content: `确定删除规则“${record.name || '-'}”吗？`,
      onOk: async () => {
        await deleteAutoRule(record.id!);
        Message.success('删除成功');
        refresh();
      }
    });
  };

  const handleToggleStatus = async (record: AutoRuleItem) => {
    if (!record.id) return;
    const isOnline = record.status === 1;
    await (isOnline ? offlineAutoRule(record.id) : onlineAutoRule(record.id));
    Message.success({
      content: isOnline ? '下线成功' : '上线成功',
      duration: 3000
    });
    refresh();
  };

  const columns: TableColumnProps<AutoRuleDetail>[] = [
    {
      title: '规则名称',
      dataIndex: 'name',
      width: 300,
      ellipsis: true,
      fixed: 'left',
      render: (value, record) => (
        <div
          onClick={() => {
            if (!ruleInfoViewAble) return;
            setShowRule(record.id);
          }}
          className={ruleInfoViewAble ? 'hover:cursor-pointer' : ''}
        >
          <GlobalTooltip.Ellipsis
            text={value || '-'}
            className={`${ruleInfoViewAble ? 'link-text' : ''} ${styles['rule-name']}`}
          />
        </div>
      )
    },
    {
      title: '描述说明',
      dataIndex: 'description',
      ellipsis: true,
      render: (value) => <GlobalTooltip.Ellipsis text={value || '-'} />
    },
    {
      title: '触发方式',
      dataIndex: 'triggerType',
      width: 120,
      filters: [
        { text: '定时触发', value: '1' },
        { text: '变更触发', value: '2' }
      ],
      filterMultiple: false,
      render: (value) => TRIGGER_TYPE_MAP[value as number] || '-'
    },
    {
      title: '条件函数',
      dataIndex: 'gateFunctionName',
      width: 140,
      ellipsis: true,
      render: (_, record) => {
        const functionName = record.gateConfig?.functionName || '-';
        return (
          <div
            className={'hover:cursor-pointer'}
            onClick={() => setShowFunction(record.gateConfig?.functionId)}
          >
            <GlobalTooltip.Ellipsis
              text={functionName}
              className={'link-text'}
            />
          </div>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (value) => {
        const { color, label } = RULE_STATUS_MAP[value]!;
        return <DotStatus color={color} text={label} />;
      },
      filters: [
        { text: '已上线', value: 1 },
        { text: '未上线', value: 0 }
      ],
      filterMultiple: false
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: true,
      width: 180,
      render: (value) => value || '-'
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size={16}>
          <PermissionButton
            permission={{
              permission: AUTOMATION_PERMISSIONS.MODIFY
            }}
            type="text"
            className={styles['table-action']}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 1 ? '下线' : '上线'}
          </PermissionButton>
          <PermissionButton
            permission={{
              permission: AUTOMATION_PERMISSIONS.MODIFY
            }}
            type="text"
            className={styles['table-action']}
            disabled={record.status === 1}
            onClick={() => routeToInfo('edit', record.id)}
          >
            <Tooltip content={record.status === 1 ? '请先下线再编辑' : ''}>
              编辑
            </Tooltip>
          </PermissionButton>
          <PermissionButton
            permission={{
              permission: AUTOMATION_PERMISSIONS.DELETE
            }}
            type="text"
            className={styles['table-action']}
            onClick={() => handleDelete(record)}
            disabled={record.status === 1}
          >
            <Tooltip content={record.status === 1 ? '请先下线再删除' : ''}>
              删除
            </Tooltip>
          </PermissionButton>
        </Space>
      )
    }
  ];

  const { onSubmit, refresh, tableProps } = useArcoTable<AutoRuleItem>(
    async ({ query, pagination, sorter, filters }) => {
      const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

      const triggerType = filters?.triggerType?.[0];
      const status = filters?.status?.[0];

      return getAutoRuleList({
        triggerType: triggerType ? Number(triggerType) : undefined,
        status: isNil(status) ? undefined : +status,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        orderBy: currentSorter?.field as string,
        filter: (query as any)?.filter,
        order:
          currentSorter?.direction === 'ascend'
            ? Order.Asc
            : currentSorter?.direction === 'descend'
              ? Order.Desc
              : undefined
      });
    },
    {
      form
    }
  );

  return (
    <div className={styles['rule-list-page']}>
      <PageHeader
        title={'规则管理'}
        subTitle={'基于函数条件的自动化规则引擎，支持定时与条件触发。'}
        className={'flex-shrink-0'}
      />
      <div className={styles['rule-list-page-content']}>
        <SearchTable
          searchForm={
            <Form form={form} autoComplete={'off'} className={'w-[200px]'}>
              <Form.Item noStyle field={'filter'}>
                <Input
                  placeholder={'请输入规则名称'}
                  allowClear
                  onChange={onSubmit}
                />
              </Form.Item>
            </Form>
          }
          addButton={
            <PermissionWrapper permission={AUTOMATION_PERMISSIONS.CREATE}>
              <AddButton
                onClick={() => {
                  routeToInfo('create');
                }}
              >
                创建规则
              </AddButton>
            </PermissionWrapper>
          }
          tableProps={{
            columns,
            ...tableProps,
            rowKey: 'id',
            scroll: { x: true }
          }}
        />
      </div>
      <AutoRuleDrawer
        visible={!!showRule}
        onCancel={() => setShowRule(undefined)}
        ruleId={showRule}
      />
      <FunctionDetailDrawer
        data={showFunction}
        visible={!!showFunction}
        onCancel={() => {
          setShowFunction(undefined);
        }}
        onEdit={() => {}}
      />
    </div>
  );
};

export default RuleListPage;
