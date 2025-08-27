import { Table, Input, Button, Message } from '@arco-design/web-react';
import React, { useRef, useState } from 'react';
import { IconSearch, IconCopy } from '@arco-design/web-react/icon';
const InputSearch = Input.Search;
import '../index.scss';
import Pages from '../components/pages';

const data = [
  {
    key: '1',
    name: 'Jane Doe',
    salary: 23000,
    address: '32 Park Road, London',
    email: 'jane.doe@example.com'
  },
  {
    key: '2',
    name: 'Alisa Ross',
    salary: 25000,
    address: '35 Park Road, London',
    email: 'alisa.ross@example.com'
  },
  {
    key: '3',
    name: 'Kevin Sandra',
    salary: 22000,
    address: '31 Park Road, London',
    email: 'kevin.sandra@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  },
  {
    key: '4',
    name: 'Ed Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  },
  {
    key: '5',
    name: 'William Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  }
];
const Datas = [
  '第一条开啊苦啊阿夸开啊夸开开阿凯阿珂开阿克艾克艾克艾克哎卡艾克',
  '第二条',
  '第三条',
  '第四条',
  '第五条',
  '第六条',
  '第七条',
  '第八条',
  '第九条',
  '第十条',
  '第十一条',
  '第十二条',
  '第十三条',
  '第十四条',
  '第十五条'
];
export default function AutoDefine() {
  const inputRef = useRef(null);
  const fileType = [
    { text: 'INTEGER', value: 'INTEGER' },
    { text: 'VATRCHAR', value: 'VATRCHAR' }
  ];
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handlePageSizeChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const columns = [
    {
      title: '字段名',
      dataIndex: 'name',
      filterIcon: <IconSearch />,
      filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => {
        return (
          <div className="arco-table-custom-filter">
            <InputSearch
              allowClear
              placeholder="请输入项目名称搜索"
              style={{ width: 200 }}
            />
          </div>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'salary',
      filters: fileType
    },
    {
      title: '注释',
      dataIndex: 'address'
    }
  ];
  const handCopy = () => {
    Message.success('复制成功');
  };
  return (
    <div
      style={{ marginTop: '16px', textAlign: 'left' }}
      className="model_tables"
    >
      <p
        style={{
          fontWeight: 600,
          fontSize: '14px',
          marginTop: '2px',
          marginBottom: '12px',
          lineHeight: '22px'
        }}
      >
        表DDL
      </p>
      <div
        style={{
          height: '200px',
          width: '100%',
          backgroundColor: '#F8FAFD',
          position: 'relative',
          overflow: 'hidden',
          overflowY: 'auto'
        }}
      >
        <Button
          type="outline"
          style={{
            padding: '2px 12px',
            borderRadius: '4px',
            position: 'absolute',
            right: '12px',
            top: '12px',
            color: '#007DFA'
          }}
          onClick={handCopy}
        >
          <IconCopy />
          复制代码
        </Button>
        <div style={{ marginTop: '12px' }}>
          <ol className="ol-style">
            {Datas.map((item, index) => (
              <li key={index}>
                <span
                  style={{
                    display: 'inline-block',
                    marginRight: '24px',
                    marginLeft: '24px',
                    color: '#6E7B8D',
                    fontSize: '12px'
                  }}
                >
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p
        style={{
          fontWeight: 600,
          fontSize: '14px',
          marginTop: '16px',
          marginBottom: '12px',
          lineHeight: '22px'
        }}
      >
        字段信息
      </p>
      <div>
        <Table
          columns={columns as any}
          data={data}
          pagination={false}
          className="table_style"
        />
        {data.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px'
            }}
          >
            <span></span>
            <Pages
              current={currentPage}
              total={data.length}
              pageSize={pageSize}
              onChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
