import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { Link, Modal, Space, Spin, Tag, Message } from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import { Table } from '@ccf2e/arco-material';
import { cloneDeep } from 'lodash';
import {
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import { createApp, deleteApp, getAppsTableList } from '@/api/appsV2';
import Header from '@/components/list-header';
import EllipsisPopover from '@/components/EllipsisPopoverCom';

const INITIAL_SEARCH_PARAMS = {
  name: '',
  mode: 'agent-chat',
  page: 1,
  limit: 10,
  fresh: new Date().getTime()
};

const useInitialSearchParams = () => {
  const [searchParams, setSearchParams] = useState(INITIAL_SEARCH_PARAMS);
  const resetSearchParams = useCallback(() => {
    setSearchParams(cloneDeep(INITIAL_SEARCH_PARAMS));
  }, []);

  return { searchParams, setSearchParams, resetSearchParams };
};

const formatStatusTag = (status) => {
  switch (status) {
    case 'published':
      return (
        <Tag className="rounded-sm bg-[#DBF4EE]" icon={<IconCheckCircle />}>
          <span className="text-[#0AB58D]">已发布</span>
        </Tag>
      );
    case 'failed':
      return (
        <Tag className="rounded-sm bg-[#FFECE5]" icon={<IconCloseCircle />}>
          <span className="text-[#EF4D29]">发布失败</span>
        </Tag>
      );
    case 'unpublished':
      return (
        <Tag className="rounded-sm bg-[#FFECE5]" icon={<IconCloseCircle />}>
          <span className="text-[#EF4D29]">未发布</span>
        </Tag>
      );
    default:
      return (
        <Tag className="rounded-sm bg-[#F2F5F9]" icon={<IconClockCircle />}>
          <span className="text-[#84868C]">发布中</span>
        </Tag>
      );
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'YYYY-MM-DD HH:mm:ss');
};

function AppListPage() {
  const history = useHistory();

  const { searchParams, setSearchParams, resetSearchParams } =
    useInitialSearchParams();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  const getTableList = useCallback(async () => {
    setLoading(true);
    const { data } = await getAppsTableList(searchParams);
    const { data: list, total = '' } = data;
    setData(() => list || []);
    setTotalSize(() => total);
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    getTableList();
  }, [getTableList, searchParams]);

  const createAgent = async () => {
    const res = await createApp({
      name: '智能体应用名称',
      mode: 'agent-chat', // agent-chat表明是智能体应用
      description: '智能体应用描述'
    });
    history.push('/tenant/compute/appforge/agentCreate?id=' + res.data.id);
  };
  const onChildQuery = (value) => {
    setSearchParams((prevSearchParams) => {
      return {
        ...prevSearchParams,
        page: 1,
        limit: 10,
        name: value,
        fresh: new Date().getTime()
      };
    });
  };

  const doDelete = async (app) => {
    Modal.confirm({
      title: '确认删除智能体吗?',
      content:
        '删除智能体将无法撤销。用户将不能访问你的应用，所有 配置内容将一并被删除。',
      async onOk() {
        try {
          await deleteApp(app.id);
          Message.success('删除智能体成功！');
          resetSearchParams();
        } catch (err) {
          Message.error('删除智能体失败，请稍后重试');
        }
      }
    });
  };
  const doCopy = (data) => {};
  const doEdit = (app) => {
    history.push('/tenant/compute/appforge/agentCreate?id=' + app.id);
  };

  const onChangeTable = (value) => {
    setSearchParams((prev) => ({
      ...prev,
      page: value.current,
      limit: value.pageSize
    }));
  };

  const columns: any = [
    {
      title: '智能体名称',
      dataIndex: 'name',
      width: 220
    },
    {
      title: '发布状态',
      dataIndex: 'status',
      width: 200,
      render: (status) => formatStatusTag(status)
    },
    {
      title: '智能体描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      render: (col, record) => {
        return (
          <>
            <EllipsisPopover
              value={record.description}
              isEdit={false}
              preferTypography
            />
          </>
        );
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 182,
      render(dateString: string) {
        const formattedDate = formatDate(dateString);
        return formattedDate;
      }
    },
    {
      title: '操作',
      dataIndex: 'oper',
      // align: 'right',
      fixed: 'right',
      width: 200,
      render(_, app) {
        return (
          <Space>
            <Link onClick={() => doCopy(app)}>复制</Link>
            <Link onClick={() => doEdit(app)}>配置</Link>
            <Link onClick={() => doDelete(app)}>删除</Link>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="appforge-spin">
      <div className="h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              智能体
            </div>
          </div>
          <Header
            onButtonClick={createAgent}
            onChildQuery={(value) => onChildQuery(value)}
            onChildReset={resetSearchParams}
            placeholder="搜索智能体名称"
            rightname="创建智能体"
          ></Header>

          <Spin loading={loading}>
            <Table
              pagination={{
                current: searchParams.page,
                pageSize: searchParams.limit,
                total: totalSize
              }}
              onChange={onChangeTable}
              columns={columns}
              data={data}
              scroll={{ x: true }}
              rowKey="id"
            />
          </Spin>
        </div>
      </div>
    </div>
  );
}

export default observer(AppListPage);
