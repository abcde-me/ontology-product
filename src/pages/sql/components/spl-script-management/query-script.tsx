import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  PaginationProps,
  Popover,
  Select,
  Table
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import { NoDataCard } from '@ceai-front/arco-material';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { SQL_PERMISSIONS } from '@/config/permissions';
import { IconClockCircle, IconRefresh } from '@arco-design/web-react/icon';
import styles from './query-script.module.scss';
import { createSqlScript, deleteSqlFile, listSqlFile } from '@/api/sql';
import { useUrlState } from '../../hooks/useUrlState';
import dayjs from 'dayjs';
import generateSqlDefaultName from '../../utils/generateSqlDefaultName';

interface QueryScriptProps {
  curActiveTab: string;
}

const QueryScript: React.FC<QueryScriptProps> = ({ curActiveTab }) => {
  const FormItem = Form.Item;
  const [form] = Form.useForm();
  const Option = Select.Option;
  const options = ['全部', '已发布', '未发布', '草稿'];

  const [formData, setFormData] = useState({
    script_name: '',
    update_account: '',
    update_time: []
  });
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化查询脚本列表数据
  const [queryScriptData, setQueryScriptData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue] = useState<
    { order_flag: string; column: string }[]
  >([]);
  const [queryNum, setQueryNum] = useState<number>(0);
  const [createScriptLoading, setCreateScriptLoading] = useState(false);
  // 组件初始化
  useEffect(() => {
    getList();
  }, [current, pageSize, sortValue, curActiveTab]);

  const { updateUrlState, clearUrlState } = useUrlState();

  // 清空搜索框
  useEffect(() => {
    if (isClickClear && searchValue === '') {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: current, //第几页
        page_size: pageSize, //每页个数
        script_name: formData?.script_name,
        update_account: formData?.update_account,
        update_time_start: formData?.update_time?.[0],
        update_time_end: formData?.update_time?.[1],
        orders: sortValue
      };
      const res = await listSqlFile(params);
      if (res.status === 200 && res.data) {
        setQueryScriptData(res?.data?.items);
        setTotal(res.data?.total || 0);
        setQueryNum(res.data?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  // 点击删除操作弹窗
  const handleDelete = (script_id: number) => {
    Modal.confirm({
      title: (
        <span className={styles['workflow-list-modal-title']}>
          确认删除此脚本？
        </span>
      ),
      content: (
        <div className={styles['workflow-list-modal-content']}>
          删除此脚本后，脚本将无法恢复。
        </div>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        handleDeleteWorkflow(script_id);
      }
    });
  };

  // 删除工作流
  const handleDeleteWorkflow = async (script_id: number) => {
    const res = await deleteSqlFile(script_id);
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '删除成功'
      });
      getList();
    } else {
      Message.error({
        content: res?.message ?? '删除失败，请稍后重试'
      });
    }
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const orders =
      sorter?.direction && sorter.field
        ? [
            {
              order_flag: sorter.direction === 'ascend' ? 'asc' : 'desc',
              column: sorter.field as string
            }
          ]
        : [];

    setSortValue(orders);
  };

  const handleToDetail = (scriptId: number | string) => {
    console.log('handleToDetail', scriptId);
    // clearUrlState();
    updateUrlState(
      {
        activeTab: 'data',
        activeScriptId: String(scriptId)
      },
      { method: 'push' }
    );
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '序号',
      dataIndex: 'script_id',
      width: 100
    },
    {
      title: '脚本名称',
      dataIndex: 'script_name',
      width: 320,
      ellipsis: true,
      className: styles['hover-change'],
      sorter: true,
      render: (_, record) => (
        <EllipsisPopover
          value={record.script_name || '-'}
          isEdit={false}
          isLink
          handleLink={() => handleToDetail(record.script_id)}
        />
      )
    },
    {
      title: '脚本说明',
      dataIndex: 'script_desc',
      width: 320,
      render: (_, record) => (
        <EllipsisPopover value={record.script_desc || '-'} />
      )
    },
    {
      title: '更新人',
      dataIndex: 'update_account',
      width: 134,
      ellipsis: true,
      className: styles['hover-change']
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 180,
      sorter: true,
      render: (_, record) => (
        <span>{dayjs(record.update_time).format('YYYY-MM-DD HH:mm:ss')}</span>
      )
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const perms = record.perms || [];
        return (
          <div style={{ display: 'flex' }}>
            <PermissionWrapper permission={SQL_PERMISSIONS.QUERY_SCRIPT_GET}>
              <span
                className={styles['operate-text']}
                onClick={() => {
                  handleToDetail(record.script_id);
                }}
              >
                详情
              </span>
            </PermissionWrapper>
            <PermissionWrapper permission={SQL_PERMISSIONS.QUERY_SCRIPT_DELETE}>
              <span
                className={
                  record.is_online
                    ? styles['disabled-text']
                    : styles['operate-text']
                }
                onClick={() => handleDelete(record.script_id)}
              >
                删除
              </span>
            </PermissionWrapper>
          </div>
        );
      }
    }
  ];

  // 点击搜索按钮
  const handleSearch = () => {
    setCurrent(1);
    setLoading(true);
    getList();
  };
  // 重置搜索框
  const handleReset = () => {
    setCurrent(1);
    setSearchValue('');
    setIsClickClear(true);
    form.resetFields();
  };
  const handleFormChange = (value) => {
    console.log(value, '123');
    const allFormValues = form.getFieldsValue();
    setFormData({
      script_name: allFormValues?.script_name,
      update_account: allFormValues?.update_account,
      update_time: allFormValues?.update_time
    });
  };
  const handleCreateQueryScript = async () => {
    setCreateScriptLoading(true);
    try {
      const createRes = await createSqlScript({
        script_name: generateSqlDefaultName(new Date()),
        script_file_id: String(Date.now()),
        script_content: '',
        script_desc: ''
      });
      if (createRes.status !== 200) {
        Message.error(createRes.message ?? '新建失败, 请稍后重试');
        return;
      }

      Message.success('新建成功');
      handleToDetail(createRes.data.script_id);
    } catch (error) {
      console.error('新建失败', error);
      Message.error('新建失败,请稍后重试');
    } finally {
      setCreateScriptLoading(false);
    }
  };
  return (
    <div className={styles['query-script-wrapper']}>
      <div className="flex items-center justify-between py-[16px]">
        <div className="text-[16px] font-[600] text-[var(--text-color-text-1)]">
          查询脚本({queryNum})
        </div>
        <PermissionWrapper permission={SQL_PERMISSIONS.QUERY_SCRIPT_CREATE}>
          <Button
            type="outline"
            loading={createScriptLoading}
            onClick={handleCreateQueryScript}
          >
            新建脚本
          </Button>
        </PermissionWrapper>
      </div>
      <div className="mb-[16px] flex items-center justify-between overflow-x-auto whitespace-nowrap border-b border-[var(--color-border-2)] pb-[16px]">
        <Form
          onValuesChange={(values) => {
            handleFormChange(values);
          }}
          form={form}
          autoComplete="off"
          layout="inline"
          className="flex flex-1 flex-nowrap items-center gap-[16px] [&_.arco-form-item-wrapper]:flex-1 [&_.arco-form-item]:mr-0 [&_.arco-form-item]:flex-1"
        >
          <FormItem label="脚本名称:" field="script_name">
            <Input className="w-full" placeholder="输入脚本名称搜索" />
          </FormItem>
          <FormItem label="更新人:" field="update_account">
            <Input className="w-full" placeholder="输入更新人搜索" />
          </FormItem>
          <FormItem label="更新时间:" field="update_time">
            <DatePicker.RangePicker className="w-full" />
          </FormItem>
        </Form>
        <div className="flex items-center whitespace-nowrap">
          <Button
            type="text"
            onClick={handleReset}
            icon={<IconRefresh />}
            className="ml-[16px] mr-[12px] px-[0px]"
          >
            重置
          </Button>
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </div>
      </div>
      <Table
        border={false}
        columns={columns}
        data={queryScriptData}
        pagination={false}
        noDataElement={
          <div className="w-full py-[100px]">
            <NoDataCard title="暂无数据" />
          </div>
        }
        rowKey="script_id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          // @ts-expect-error
          handleTableChange(pagination, sorter, filters)
        }
      />
      {/* 分页 */}
      {total > pageSize && (
        <Pagination
          current={current}
          pageSize={pageSize}
          onPageSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrent(1);
          }}
          onChange={(page) => {
            setCurrent(page);
          }}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={total}
          showJumper
          sizeCanChange
          style={{ justifyContent: 'flex-end', marginTop: '10px' }}
        />
      )}
    </div>
  );
};

export default QueryScript;
