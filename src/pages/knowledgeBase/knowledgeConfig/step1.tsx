import FileIcon from '@/components/file-icon';
import { Checkbox, Popover, Radio, Tree } from '@arco-design/web-react';
import { IconCheckCircle, IconClockCircle, IconInfoCircle, IconLoading } from '@arco-design/web-react/icon';
import React, { useEffect, useMemo, useState } from 'react'
import { Table, useTable } from '@ccf2e/arco-material';

function Step1(props) {
  const { setNextStepEnabled, setStepData } = props

  const [dataFrom, setDataFrom] = useState('catalog')
  const [treeData, setTreeData] = useState([])
  const [checkedCatalogKeys, setCheckedCatalogKeys] = useState([]);
  const [checkedFileKeys, setCheckedFileKeys] = useState([]);
  const [kbGraph, setKBGraph] = useState(false);

  const [tableData, setTableData] = useState([
    { name: '111111.png', format: 'pdf', size: '2.38M', status: 'success', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    { name: '222.png', format: 'pdf', size: '2.38M', status: 'waiting', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    { name: '33.png', format: 'pdf', size: '2.38M', status: 'failed', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    { name: '44.png', format: 'pdf', size: '2.38M', status: 'ongoing', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },

  ])
  const columns = useMemo(() => {
    return [
      {
        title: '文件名称',
        dataIndex: 'name',
        width: 300
      },
      {
        title: '文件格式',
        dataIndex: 'format',
        render(_, item) {
          return <span className='flex align-middle'>
            <FileIcon name="xx.pdf" className='size-[16px]'/>
            <span className='ml-[4px]'>{item.format}</span>
          </span>
        },
        width: 100
      },
      {
        title: '文件大小',
        dataIndex: 'size',
        width: 100,
        sorter: (a, b) => -1,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        search: true,
        searchType: 'select',
        filterMultiple: false,
        filters: [
          {
            text: 'Main tenant',
            value: '1',
          },
          {
            text: 'Ordinary tenant',
            value: '0',
          },
          {
            text: 'Subtenant',
            value: '2',
          },
        ],
        render(_, item) {
          return <span className='flex align-middle'>
            { item.status === 'success' && <>
              <IconCheckCircle className='size-[16px] text-[#10B981]'/>
              <span className='ml-[4px]'>导入完成</span>
            </>}
            { item.status === 'waiting' && <>
              <IconClockCircle className='size-[16px] text-[#007DFA]'/>
              <span className='ml-[4px]'>待解析</span>
            </>}
            { item.status === 'failed' && <>
              <IconCheckCircle className='size-[16px] text-[#F5222D]'/>
              <span className='ml-[4px]'>解析失败</span>
            </>}
            { item.status === 'ongoing' && <>
              <IconLoading className='size-[16px] text-[#A3AFBE]'/>
              <span className='ml-[4px]'>解析中</span>
            </>}
            
          </span>
        },
      },
      {
        title: '数据来源',
        dataIndex: 'source',
        width: 100,
        sorter: (a, b) => 1,
      },
      {
        title: '上传时间',
        dataIndex: 'uploadTime',
        width: 150,
        sorter: true,
      },
    ];
  }, []);

  useEffect(() => {
    const data = [
      {
        title: 'Trunk 0-0',
        key: '0-0',
        children: [
          {
            title: 'Branch 0-0-2',
            key: '0-0-2',
            selectable: false,
          },
        ],
      },
      {
        title: 'Trunk 0-1',
        key: '0-1',
        children: [
          {
            title: 'Branch 0-1-1',
            key: '0-1-1',
          },
        ],
      },
      {
        title: 'Trunk 0-2',
        key: '0-2',
      },
      {
        title: 'Trunk 0-3',
        key: '0-3',
      },
      {
        title: 'Trunk 0-4',
        key: '0-4',
      },
      {
        title: 'Trunk 0-5',
        key: '0-5',
      },
      {
        title: 'Trunk 0-6',
        key: '0-6',
        children: [
          {
            title: 'Branch 0-6-1',
            key: '0-6-1',
          },
          {
            title: 'Branch 0-6-2',
            key: '0-6-2',
          },
          {
            title: 'Branch 0-6-3',
            key: '0-6-3',
          },
          {
            title: 'Branch 0-6-4',
            key: '0-6-4',
          },
        ],
      },
      {
        title: 'Trunk 0-7',
        key: '0-7',
        children: [
          {
            title: 'Branch 0-7-1',
            key: '0-7-1',
          },
          {
            title: 'Branch 0-7-2',
            key: '0-7-2',
          },
          {
            title: 'Branch 0-7-3',
            key: '0-7-3',
          },
          {
            title: 'Branch 0-7-4',
            key: '0-7-4',
          },
        ],
      },
      {
        title: 'Trunk 0-8',
        key: '0-8',
        children: [
          {
            title: 'Branch 0-8-1',
            key: '0-8-1',
          },
          {
            title: 'Branch 0-8-2',
            key: '0-8-2',
          },
          {
            title: 'Branch 0-8-3',
            key: '0-8-3',
          },
          {
            title: 'Branch 0-8-4',
            key: '0-8-4',
          },
        ],
      },
    ]
    setTreeData(data)
  }, [])

  useEffect(() => {
    if (dataFrom === 'catalog') {
      setCheckedFileKeys([])
    } else {
      setCheckedCatalogKeys([])
    }
  }, [dataFrom])

  useEffect(() => {
    setNextStepEnabled(d => ({ ...d, 1: !!(checkedCatalogKeys.length || checkedFileKeys.length) }))
  }, [setNextStepEnabled, checkedCatalogKeys, checkedFileKeys])

  useEffect(() => {
    setStepData(d => ({ ...d, 1: { dataFrom, checkedCatalogKeys, checkedFileKeys } }))
  }, [setStepData, dataFrom, checkedCatalogKeys, checkedFileKeys])

  const onSelect = (keys: string[], extra: any) => {
    // console.log('keys', keys);
    setTableData([
      { name: '111111.png', format: 'pdf', size: '2.38M', status: 'success', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
      { name: '222.png', format: 'pdf', size: '2.38M', status: 'waiting', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
      { name: '33.png', format: 'pdf', size: '2.38M', status: 'failed', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
      { name: '44.png', format: 'pdf', size: '2.38M', status: 'ongoing', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    ].map(d => ({ ...d, name: `${keys[0]}/${d.name}` })))
  }

  const onSelectFile = (keys: string[]) => {
    const dataKeys = tableData.map(d => d.name);
    const forDeleted = dataKeys.filter(d => !keys.includes(d));
    const forAdd = keys.filter(d => !checkedFileKeys.includes(d));
    setCheckedFileKeys(files => {
      const newFiles = [...files]
      forDeleted.forEach(d => newFiles.indexOf(d) > -1 && newFiles.splice(newFiles.indexOf(d), 1))
      forAdd.forEach(d => newFiles.push(d))
      return newFiles
    })
  }

  return <div className='step1'>
    <div className='data-selector-part'>
      <div className='sub-title'>选择数据</div>
      <div className='title-desc mb-[12px]'>从数据中心选择导入的数据，并构建知识库索引。新增文档请前往</div>
      <Radio.Group defaultValue={dataFrom} style={{ marginBottom: 24 }} onChange={(v) => setDataFrom(v)}>
        <Radio value='catalog'>选择类目</Radio>
        <Radio value='files'>选择文件</Radio>
      </Radio.Group>
      <div className='sub-title mb-[8px]'>{dataFrom === 'catalog' ? '请选择类目' : '请选择文件'}</div>
      <div className='selector-part'>
        <div className='catalog-tree'>
          <div className='tree-wrapper'>
            <Tree
              checkable={dataFrom === 'catalog'}
              treeData={treeData}
              onSelect={onSelect}
              defaultExpandedKeys={[]}
              checkedKeys={checkedCatalogKeys}
              onCheck={(value, extra) => {
                setCheckedCatalogKeys(value);
              }}
              renderExtra={(node) => {
                return (
                  <Popover content={<span>{node.title}--{node._level}</span>}>
                    <IconInfoCircle style={{ marginLeft: '8px', fontSize: 12 }} />
                  </Popover>
                );
              }}
            ></Tree>
          </div>
          <div className='default-catalog'>默认类目</div>
        </div>
        <div className='catalog-separator'></div>
        <div className='catalog-table'>
          <Table
            columns={columns}
            data={tableData || []}
            scroll={{ x: true }}
            rowSelection={dataFrom === 'files' && {
              type: 'checkbox',
              selectedRowKeys: checkedFileKeys,
              onChange: (selectedRowKeys: string[], selectedRows) => {
                console.log('onChange:', selectedRowKeys, selectedRows);
                onSelectFile(selectedRowKeys);
              },
            }}
            rowKey="name"
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
    <div className='sub-title mt-[12px]'>知识图谱</div>
    <div className='title-desc mb-[12px]'>知识图谱是结构化的语义知识库，用于表示实体、关系和知识的关联网络。</div>
    <div><Checkbox checked={kbGraph} onChange={val => setKBGraph(val)}>构建知识图谱</Checkbox></div>
  </div>
}

export default Step1;