import React, { useMemo, useState } from 'react';
import {
  Button,
  Input,
  Message,
  Pagination,
  Popconfirm,
  Table,
  Tag
} from '@arco-design/web-react';
import { useHistory } from 'react-router';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import TimeFormatting from '@/utils/timeFormatting';
import './index.css';
import {
  IconCheckCircleFill,
  IconClockCircle
} from '@arco-design/web-react/icon';
import noDataElement from '@/components/no-data';

const InputSearch = Input.Search;

export default function WorkflowList() {
  const history = useHistory();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化工作流列表数据
  const [workflowData, setWorkflowData] = useState([
    {
      id: '1',
      name: 'Jane Doe',
      operation: '单次运行',
      status: false,
      source: 'jane.doe@example.com',
      target: 'jane.doe@example.com',
      creater: 'Jane Doe',
      created_time: '1749627834576'
    },
    {
      id: '2',
      name: 'Alisa Ross',
      operation: '单次运行',
      status: true,
      source: 'alisa.ross@example.com',
      target: 'jane.doe@example.com',
      creater: 'Alisa Ross',
      created_time: '1749627876834'
    },
    {
      id: '3',
      name: 'Kevin Sandra',
      operation: '单次运行',
      status: false,
      source: 'kevin.sandra@example.com',
      target: 'jane.doe@example.com',
      creater: 'Kevin Sandra',
      created_time: '1749627812365'
    },
    {
      id: '4',
      name: '张三',
      operation: '单次运行',
      status: false,
      source: 'kevin.sandra@example.com',
      target: 'jane.doe@example.com',
      creater: '张三',
      created_time: '174962787645'
    },
    {
      id: '5',
      name: '李四',
      operation: '单次运行',
      status: false,
      source: 'kevin.sandra@example.com',
      target: 'jane.doe@example.com',
      creater: '李四',
      created_time: '1749627860783'
    }
  ]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);

  // 创建工作流
  const handleCreateWorkflow = () => {
    history.push(`/tenant/compute/modaforge/workflowConfig`);
  };

  // 查看详情
  const viewDetailWorkflow = (obj: object) => {
    console.log(obj);
  };

  // 复制工作流
  const handleCloneWorkflow = (obj: object) => {
    console.log(obj);
  };

  // 删除工作流
  const handleDeleteWorkflow = (id: string) => {
    const newWorkflowData = workflowData.filter((item) => {
      return item.id !== id;
    });
    setWorkflowData(newWorkflowData);
  };

  // table columns
  const columns: ColumnProps[] = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
      render: (_, record) => <span className="hover-change">{record.name}</span>
    },
    {
      title: '运行方式',
      dataIndex: 'operation',
      width: 130,
      filters: [
        {
          text: '单次运行',
          value: '单次运行'
        },
        {
          text: '多次运行',
          value: '多次运行'
        }
      ],
      onFilter: (value, row) => row.operation == value
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) =>
        record.status ? (
          <Tag color="green" icon={<IconCheckCircleFill />}>
            已上线
          </Tag>
        ) : (
          <Tag color="gray" icon={<IconClockCircle />}>
            未上线
          </Tag>
        ),
      filters: [
        {
          text: '未上线',
          value: false
        },
        {
          text: '已上线',
          value: true
        }
      ],
      onFilter: (value, row) => row.status == value
    },
    {
      title: '源数据目录',
      dataIndex: 'source',
      width: 230,
      ellipsis: true,
      render: (_, record) => (
        <span className="hover-change" title={record.source}>
          {record.source}
        </span>
      )
    },
    {
      title: '目标数据目录',
      dataIndex: 'target',
      width: 230,
      ellipsis: true,
      render: (_, record) => (
        <span className="hover-change" title={record.target}>
          {record.target}
        </span>
      )
    },
    {
      title: '创建人',
      dataIndex: 'creater',
      width: 100,
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      width: 150,
      render: (_, record) => <span>{TimeFormatting(record.created_time)}</span>,
      sorter: (a, b) => a.created_time.length - b.created_time.length
    },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 110,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            className="operate-text"
            onClick={() => {
              viewDetailWorkflow(record);
            }}
          >
            详情
          </span>
          <span
            className="operate-text"
            onClick={() => {
              handleCloneWorkflow(record);
            }}
          >
            复制
          </span>
          <Popconfirm
            focusLock
            title="确定删除工作流吗？"
            content="删除该工作流后，工作流中的内容将全部清除。"
            onOk={() => {
              handleDeleteWorkflow(record.id);
              Message.success({
                content: '删除成功'
              });
            }}
            onCancel={() => {
              Message.error({
                content: '删除失败，请稍后重试'
              });
            }}
          >
            <span className="operate-text">删除</span>
          </Popconfirm>
        </div>
      )
    }
  ];

  // 根据搜索条件过滤工作流
  const filterWorkflowData = useMemo(() => {
    return workflowData.filter((item) => {
      const query = searchValue.toLowerCase();
      return item.name.toLowerCase().includes(query);
    });
  }, [workflowData, searchValue]);

  return (
    <div className="workflow">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>工作流</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          margin: '15px 0'
        }}
      >
        <InputSearch
          placeholder="输入工作流名称搜索"
          style={{ width: 230 }}
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
          }}
        />
        <Button shape="round" type="primary" onClick={handleCreateWorkflow}>
          创建工作流
        </Button>
      </div>
      <Table
        border={false}
        columns={columns}
        data={filterWorkflowData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无工作流',
          btnText: '创建工作流',
          handleBtn: () => handleCreateWorkflow()
        })}
        rowKey="id"
      />
      {/* 分页 */}
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
        sizeOptions={[2, 5, 10, 20]}
        showTotal
        total={filterWorkflowData.length}
        showJumper
        sizeCanChange
        style={{ justifyContent: 'flex-end', marginTop: '10px' }}
      />
    </div>
  );
}
