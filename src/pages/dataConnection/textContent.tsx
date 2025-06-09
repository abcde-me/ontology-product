import { Button, Link, Space } from '@arco-design/web-react';
import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Table, useTable } from '@ccf2e/arco-material';
import {
  IconCheckCircle,
  IconClockCircle,
  IconCloseCircle,
  IconLoading
} from '@arco-design/web-react/icon';
import PdfIcon from '@/assets/file/pdf.svg';
import ContentHeader from './contentHeader'
import { ImportDrawer } from './importDrawer';

function TextContent(props: { selectedCatalog: Record<string, any> }) {
  const { selectedCatalog } = props;
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [showRowSelection, setShowRowSelection] = useState(false);
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
            <PdfIcon className='size-[16px]'/>
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
      {
        title: '操作',
        dataIndex: 'oper',
        width: 150,
        fixed: 'right' as any,
        render(_, item) {
          return (
            <Space>
              <Link onClick={() => {
                history.push(`/tenant/compute/appforge/textDetailPage`);
              }}>详情</Link>
              <Link onClick={() => {}}>标签</Link>
              <Link onClick={() => {}}>删除</Link>
            </Space>
          );
        }
      }
    ];
  }, []);

  return (
    <div className="text-content-part">
      <ContentHeader
        onSearch={() => {}}
        onImport={() => setVisible(true)}
        onBatch={() => setShowRowSelection(s => !s)}
        searchConfig={[{
          key: 'name',
          label: '文件名称',
          type: 'input',
          placeholder: '请输入文件名称以模糊查询'
        }
      ]}/>
      <Table
        columns={columns}
        data={tableData || []}
        scroll={{ x: true }}
        showRowSelection={showRowSelection}
        showBottomCheckBox={showRowSelection}
        rowKey="name"
        onChange={() => {}}
        renderPaginationLabel={(selectedRowKeys) => showRowSelection ? (
          <Space>
            <Button
              type='outline'
              className="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={() => {}}
            >
              批量删除
            </Button>
          </Space>
        ) : null}
      />
      {visible && (
        <ImportDrawer
          visible={visible}
          setVisible={setVisible}
          selectedCatalog={selectedCatalog}
          submit={() => {}}
        />
      )}
    </div>
  )
}

export default TextContent;
