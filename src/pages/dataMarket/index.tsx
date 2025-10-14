import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Input,
  Message,
  Modal,
  Pagination,
  PaginationProps,
  Table,
  Tooltip
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import Success11Icon from '@/pages/workflowConfig/styles/images/op-icons/success1.svg';
import noDataElement from '@/components/no-data';
import { getWorkflowList } from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import {
  IconClockCircle,
  IconDelete,
  IconDownload,
  IconPlus
} from '@arco-design/web-react/icon';

import './index.scss';
import DatasetForm from '@/components/datasetform/AddDatasetForm';
import {
  batchDeleteDataset,
  createDataset,
  getTagList
} from '@/api/datasetManagement';
import { Dataset, datasetStorageType } from '../datasetManagement';
import FormComponent from '@/components/data-catalog-content/components/popups-form';
import {
  PopupsFormFrom,
  SourceDataItem,
  TargetDataItem
} from '@/components/data-catalog-content/components/popups-form/types';

const InputSearch = Input.Search;

export default function DataMarket() {
  const history = useHistory();
  const userInfo = useUserInfo();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化列表数据
  const [dataMarketData, setDataMarketData] = useState([]);
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
  const [sortValue, setSortValue] = useState({
    run_cycle: '',
    sort: ''
  });
  // 初始化新建数据集弹窗
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // 初始化标签列表
  const [tagList, setTagList] = useState<{ id: number; name: string }[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  ); // 选择行
  const [selectedRows, setSelectedRows] = React.useState<Array<Dataset>>([]); //选择行数据
  const [downloadData, setDownloadData] = React.useState<Dataset | null>(null); //导出弹窗相关
  const [visible, setVisible] = React.useState(false); // 导出弹框控制

  const childRef = useRef<{
    resetForm: () => void;
    setcreateTagDisabled: () => void;
  } | null>(null);

  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);

  // 清空搜索框
  useEffect(() => {
    if (isClickClear && searchValue === '') {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  useEffect(() => {
    getTagList()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setTagList(res.data);
        } else {
          console.error('标签列表数据格式错误:', res);
          setTagList([]);
        }
      })
      .catch((err) => {
        console.error('获取标签列表失败:', err);
        setTagList([]);
        Message.error('获取标签列表失败');
      });
  }, []);

  const getList = async () => {
    setLoading(true);
    try {
      const params = {
        uid: userInfo?.id,
        search_content: searchValue,
        page: current, //第几页
        page_size: pageSize, //每页个数
        ...sortValue
      };
      const res = await getWorkflowList(params);
      if (res.status === 200 && res.data) {
        setDataMarketData(res.data.list);
        setCurrent(res.data.page_info?.page);
        setPageSize(res.data.page_info?.page_size);
        setTotal(res.data.page_info?.total);
      }
    } finally {
      setLoading(false);
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要删除的数据集');
      return;
    }

    Modal.confirm({
      title: (
        <span
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            height: 24,
            display: 'inline-block'
          }}
        >
          确认删除
        </span>
      ),
      content: (
        <div
          style={{
            fontFamily: 'PingFang SC, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            marginTop: '10px',
            color: '#1D2129',
            height: 22,
            display: 'inline-block',
            marginLeft: '28px' // 左移一点
          }}
        >
          退出后，当前修改不会保存
        </div>
      ),
      okText: '确认删除',
      cancelText: '取消',
      onOk: () => {
        console.log('批量删除:', selectedRows);
        batchDeleteDataset({
          ids: selectedRowKeys.map((key) => Number(key))
        })
          .then((res) => {
            console.log('批量删除结果:', res);
            if (res.status === 200) {
              Message.success(`成功删除 ${selectedRowKeys.length} 个数据集！`);
              setSelectedRowKeys([]);
              setSelectedRows([]);
              getList();
            } else {
              Message.error('批量删除失败！');
            }
          })
          .catch((err) => {
            Message.error('批量删除失败！');
          });
      }
    });
  };

  // 批量导出，未选择或只选中数据库表类型时禁用
  const batchExportDisabled = useMemo(
    () =>
      selectedRows.filter(
        (row: Dataset) => row.storage_type !== datasetStorageType.table
      ).length === 0,
    [selectedRows]
  );

  // 批量导出
  const handleBatchExport = () => {
    const filteredRows = selectedRows.filter(
      (row) => row.storage_type !== datasetStorageType.table
    );
    const filteredRowKeys = filteredRows.map((row) => row.id);

    // 更新选中状态，移除不能导出的数据集
    setSelectedRows(filteredRows);
    setSelectedRowKeys(filteredRowKeys);

    setDownloadData(null);
    setVisible(true);
    console.log('批量导出(已过滤table类型):', filteredRows);

    // 如果过滤后有数据被移除，给用户提示
    const removedCount = selectedRows.length - filteredRows.length;
    if (removedCount > 0) {
      Message.info(`已自动过滤 ${removedCount} 个数据库表类型的数据集`);
    }
  };

  //清除选中状态函数
  const handClear = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      run_cycle:
        filters.run_cycle === undefined ? '' : filters.run_cycle.join(','),
      is_online:
        filters.is_online === undefined ? '' : filters.is_online.join(','),
      sort:
        sorter.direction === undefined
          ? ''
          : sorter.direction === 'ascend'
            ? 'create_time:ASC'
            : 'create_time:DESC'
    };

    setSortValue(sortdata);
  };

  // table数据为空时展示-
  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };

  // 提交表单数据,新建数据集
  const handleSubmit = async (formData: any) => {
    const submitData = {
      name: formData.name,
      description: formData.description,
      tag_names: formData.tags || [],
      storage_type: formData.storageType,
      src: formData.dataSource === 'volume' ? 1 : 2, // 1-目标数据目录，2-连接器
      src_extra:
        formData.dataSource === 'volume'
          ? {
              // path: fullPath,
              path_id: formData.targetDataSource?.[1]?.[1] ?? '',
              path_file_ids: formData.path_file_ids || []
            }
          : {
              connector_id: parseInt(formData?.targetDataSource) || 0,
              connector_file_ids: formData?.selectedFiles || []
            }
    };

    console.log('提交数据:', submitData);

    try {
      const createDatasetRes = await createDataset(submitData);

      if (createDatasetRes.status !== 200) {
        Message.error(createDatasetRes.message || '数据集创建失败！');
        childRef.current?.setcreateTagDisabled();
        return;
      }

      // 刷新数据列表
      getList();
      setModalVisible(false);

      //获取标签
      const tagListRes = await getTagList();

      try {
        if (tagListRes.data && Array.isArray(tagListRes.data)) {
          setTagList(tagListRes.data);
        } else {
          console.error('标签列表数据格式错误:', tagListRes);
          setTagList([]);
        }
      } catch {
        setTagList([]);
        Message.error('获取标签列表失败');
      }

      childRef.current?.resetForm();
      childRef.current?.setcreateTagDisabled();
      Message.success('数据集创建成功！');
    } catch {
      childRef.current?.setcreateTagDisabled();
      Message.error('数据集创建失败！');
    }
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '数据集名称',
      dataIndex: 'dataset_name',
      width: 280,
      ellipsis: true,
      className: 'hover-change data-market-name',
      render: (_, record) => {
        return (
          <EllipsisPopover
            value={record.dataset_name}
            isEdit={false}
            isLink
            handleLink={() => {
              history.push(
                `/tenant/compute/modaforge/dataMarketDetail/${record.id}`
              );
            }}
          />
        );
      }
    },
    {
      title: '应用分类',
      dataIndex: 'run_cycle',
      width: 120,
      render: (_, record) =>
        record.run_cycle ? <span>RAG知识库</span> : <span>其他</span>,
      filters: [
        {
          text: 'RAG知识库',
          value: 0
        },
        {
          text: '其他',
          value: 1
        }
      ]
    },
    {
      title: '数据集标签',
      dataIndex: 'is_online',
      width: 150,
      render: (_, record) =>
        record.is_online ? (
          <div className="publish-part published">
            <Success11Icon className="mr-[6px] size-[16px]" />
            <span>已上线</span>
          </div>
        ) : (
          <div className="publish-part not-published">
            <IconClockCircle className="mr-[6px] size-[16px]" />
            <span>未上线</span>
          </div>
        ),
      filters: [
        {
          text: '未上线',
          value: 0
        },
        {
          text: '已上线',
          value: 1
        }
      ]
    },
    {
      title: '格式类型',
      dataIndex: 'storage_type',
      width: 280,
      ellipsis: true,
      className: 'hover-change'
    },
    {
      title: '来源',
      dataIndex: 'target_path',
      width: 280,
      ellipsis: true,
      className: 'hover-change'
    },
    {
      title: '数据集状态',
      dataIndex: 'user_name',
      width: 180,
      ellipsis: true
    },
    {
      title: '描述说明',
      dataIndex: 'create_time',
      width: 160,
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 165,
      render: (_, record) => {
        const perms = record.perms || [];
        return (
          <div style={{ display: 'flex' }}>
            <span className="operate-text">编辑</span>
            <span className="operate-text">导出</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="data-market">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>数据集市</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: '15px 0'
        }}
      >
        <InputSearch
          placeholder="输入关键字搜索"
          style={{ width: 230 }}
          value={searchValue}
          allowClear
          onChange={(value) => {
            setSearchValue(value);
          }}
          onPressEnter={() => {
            current !== 1 ? setCurrent(1) : getList();
          }}
          onClear={() => {
            setCurrent(1);
            setSearchValue('');
            setIsClickClear(true);
          }}
        />
        <div className="flex items-center gap-[16px]">
          <Tooltip
            content={selectedRowKeys.length === 0 ? '请选择文件' : ''}
            disabled={selectedRowKeys.length > 0}
            style={{ fontSize: '14px' }}
          >
            <Button
              icon={<IconDelete />}
              className="batch-delete-btn operate-btn"
              disabled={selectedRowKeys.length === 0}
              onClick={handleBatchDelete}
              type="secondary"
            >
              批量删除
            </Button>
          </Tooltip>
          <Tooltip
            content={selectedRowKeys.length === 0 ? '请选择文件' : ''}
            disabled={selectedRowKeys.length > 0}
          >
            <Button
              icon={<IconDownload />}
              className="batch-export-btn operate-btn"
              disabled={batchExportDisabled}
              onClick={handleBatchExport}
            >
              批量导出
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => setModalVisible(true)}
          >
            新建数据集
          </Button>
        </div>
      </div>
      <Table
        border={false}
        columns={columns}
        data={dataMarketData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无数据集'
        })}
        rowKey="id"
        loading={loading}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            console.log('onChange:', selectedRowKeys, selectedRows);
            setSelectedRowKeys(selectedRowKeys);
          },
          onSelect: (selected, record, selectedRows) => {
            console.log('onSelect:', selected, record, selectedRows);
          }
        }}
        onChange={(pagination, sorter, filters) =>
          // @ts-expect-error
          handleTableChange(pagination, sorter, filters)
        }
      />
      {/* 分页 */}
      {dataMarketData && dataMarketData.length > 0 && (
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
      <DatasetForm
        visible={modalVisible}
        onSubmit={handleSubmit}
        onCancel={() => setModalVisible(false)}
        isDataMarket={true}
        ref={childRef}
      />
      {/* 导出数据集弹窗 */}
      <FormComponent
        from={PopupsFormFrom.DatasetManagement}
        exportdataset={downloadData}
        onCancel={() => setVisible(false)}
        visible={visible}
        exportdatas={
          selectedRows as Array<SourceDataItem & TargetDataItem & Dataset>
        }
        handlClear={handClear}
      />
    </div>
  );
}
