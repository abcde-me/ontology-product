import { Table, Input, Button, Message } from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';
import { IconSearch, IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
const InputSearch = Input.Search;
import '../index.scss';

export default function AutoDefine(props) {
  const { dataList } = props;
  console.log(dataList, 'table组件接收到的dataList');
  const Datas =
    dataList && dataList.ddl ? dataList.ddl.tableInfo.split('\n') : [];
  // 搜索过滤状态，用于根据字段名筛选表格
  const [nameFilter, setNameFilter] = useState<string>('');
  const ddlRef = useRef<HTMLDivElement | null>(null);
  const [dbFilterType, setDbFilterType] = useState<
    { text: string; value: string }[]
  >([]);
  const getTypes = (dataList) => {
    // 提取所有 type，过滤掉空值，去重并格式化为 {text, value}
    const types = (dataList?.ddl?.columns || [])
      .map((item) => item.type)
      .filter((t) => t !== undefined && t !== null && String(t).trim() !== '');
    const unique = Array.from(new Set(types));
    const formatted = unique.map((t) => ({
      text: String(t),
      value: String(t)
    }));
    setDbFilterType(formatted);
  };
  useEffect(() => {
    getTypes(dataList);
  }, [dataList]);

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
              placeholder="请输入字段名搜索"
              style={{ width: 200 }}
              value={
                filterKeys && filterKeys[0] !== undefined
                  ? filterKeys[0]
                  : nameFilter
              }
              onChange={(value: string) => {
                setFilterKeys(value ? [value] : []);
                if (!value) {
                  setNameFilter('');
                  // if (confirm) confirm();
                }
              }}
              onSearch={(val: string) => {
                const v = val || '';
                setNameFilter(v);
                if (confirm) confirm();
              }}
            />
          </div>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      filters: dbFilterType,
      onFilter: (value, record) => {
        return record.type === value;
      }
    },
    {
      title: '注释',
      dataIndex: 'comment'
    }
  ];
  // 根据 nameFilter 过滤表格数据（不区分大小写）
  const filteredData = (dataList?.ddl?.columns || []).filter((row) => {
    if (!nameFilter) return true;
    const v = String(row?.name || '');
    return v.toLowerCase().includes(nameFilter.toLowerCase());
  });
  const handCopy = () => {
    const rawText = dataList?.ddl?.tableInfo;
    let textToCopy = '';
    if (rawText) {
      textToCopy = rawText;
    } else if (ddlRef.current) {
      // 从容器中提取文本并保留换行
      textToCopy = Array.from(ddlRef.current.querySelectorAll('li'))
        .map((li) => li.textContent || '')
        .join('\n');
    }
    if (!textToCopy) {
      Message.error('没有可复制的内容');
      return;
    }

    try {
      const success = copy(textToCopy);
      if (success) {
        Message.success('复制成功');
      } else {
        Message.error('复制失败');
      }
    } catch (err) {
      Message.error('复制失败');
    }
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
        ref={ddlRef}
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
          data={filteredData}
          pagination={false}
          border={false}
          className="table_style"
        />
      </div>
    </div>
  );
}
