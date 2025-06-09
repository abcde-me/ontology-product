import {
  Empty,
  Link,
  Modal,
  Input,
  Space,
  Spin,
  Tag,
  Message
} from '@arco-design/web-react';
import { format } from 'date-fns';
import EllipsisPopover from '@/components/EllipsisPopoverCom';
import {
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from '@ccf2e/arco-material';
import Header from '@/components/list-header';
import { deleteApp, getAppsList } from '@/api/appsV2';
function AppListPage(props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState<any>({
    page: 1, // 当前页码
    limit: 10, // 每页显示的数据条数
    name: '',
    mode: 'workflow'
  });
  const history = useHistory();
  useEffect(() => {
    funcAppList({ ...pagination });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //工作流应用列表
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const funcAppList = async (params) => {
    console.log(params, 'params');

    try {
      setLoading(true);
      const item = await getAppsList('', params);
      const { data = [], total = '', page = '', limit = '' } = item.data;
      setData(data || []);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: total
      }));
      // 其他处理逻辑
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  //策略配置
  const doEditPolicy = (app: any) => {
    window.open(location.href.replace('workflowList', 'workflowConfig') + '?id=' + app.id, '_blank')
  };
  //
  //创建工作流
  const handleButtonClick = () => {
    window.open(location.href.replace('workflowList', 'workflowConfig'), '_blank')
  };
  //删除工作流
  const doDelete = useCallback((app) => {
    Modal.confirm({
      title: '确认删除工作流吗?',
      content:
        '删除工作流将无法撤销。用户将不能访问你的应用，所有 配置内容将一并被删除。',
      async onOk() {
        await deleteApp(app.id);
        funcAppList({
          ...pagination,
          page: 1,
          limit: 10
        });
        Message.success('删除工作流成功！');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //查询
  const onChildQuery = (value) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
      name: value
    }));
    funcAppList({
      ...pagination,
      page: 1,
      name: value
    });
  };
  //重置
  const onChildReset = () => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: 1,
      limit: 10,
      name: ''
    }));
    funcAppList({
      page: 1,
      limit: 10,
      name: '',
      mode: 'workflow'
    });
  };
  const docope = (data) => {};
  const columns: any = useMemo(() => {
    return [
      {
        title: '工作流名称',
        dataIndex: 'name',
        width: 220
      },
      {
        title: '发布状态',
        dataIndex: 'status',
        width: 200,
        render(a, b) {
          if (a === 'published') {
            return (
              <Tag
                className="rounded-sm bg-[#DBF4EE] "
                icon={<IconCheckCircle />}
              >
                <span style={{ color: '#0AB58D ' }}>已发布</span>
              </Tag>
            );
          } else if (a === 'failed') {
            return (
              <Tag
                className="rounded-sm bg-[#FFECE5]"
                icon={<IconCloseCircle />}
              >
                <span style={{ color: '#EF4D29' }}>发布失败</span>
              </Tag>
            );
          } else if (a === 'unpublished') {
            return (
              <Tag
                className="rounded-sm bg-[#FFECE5]"
                icon={<IconCloseCircle />}
              >
                <span style={{ color: '#EF4D29' }}>未发布</span>
              </Tag>
            );
          } else {
            return (
              <Tag
                className="rounded-sm bg-[#F2F5F9]"
                icon={<IconClockCircle />}
              >
                <span style={{ color: '#84868C' }}>发布中</span>
              </Tag>
            );
          }
        }
      },
      {
        title: '工作流描述',
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
        render(i, app) {
          const date = new Date(i);
          const formattedDate = format(date, 'YYYY-MM-DD HH:mm:ss');

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
              <Link onClick={() => docope(app)}>复制</Link>
              <Link onClick={() => doEditPolicy(app)}>配置</Link>
              <Link onClick={() => doDelete(app)}>删除</Link>
            </Space>
          );
        }
      }
    ];
  }, [doDelete]);
  //分页
  const onChangeTable = (value) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      page: value.current,
      limit: value.pageSize
    }));
    funcAppList({
      ...pagination,
      page: value.current,
      limit: value.pageSize
    });
  };
  return (
    <div className="appforge-spin">
      <div className="h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              工作流
            </div>
          </div>

          <Header
            onButtonClick={handleButtonClick}
            onChildQuery={(value) => onChildQuery(value)}
            onChildReset={onChildReset}
            placeholder="搜索工作流名称"
            rightname="创建工作流"
          ></Header>

          <Spin loading={loading}>
            <Table
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total
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
