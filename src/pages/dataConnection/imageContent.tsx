import { Button, Link, Space } from '@arco-design/web-react';
import React, { useState, useMemo } from 'react';
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
import { ImageDetailDrawer } from './imageDetailDrawer';
import homeImage from '@/assets/home_3.png';

function ImageContent(props: { selectedCatalog: Record<string, any> }) {
  const { selectedCatalog } = props;
  const [visible, setVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [showRowSelection, setShowRowSelection] = useState(false);
  const [tableData, setTableData] = useState([
    { name: '21', url: homeImage, status: 'success', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    { name: '22', url: homeImage, status: 'waiting', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    { name: '33', url: homeImage, status: 'failed', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
    { name: '44', url: homeImage, status: 'ongoing', source: '本地导入', uploadTime: '2023-09-25 17:04:33' },
  ])
  const [selectedItem, setDelectedItem] = useState<Record<string, any>>({});

  const columns = useMemo(() => {
    return [
      {
        title: '编号',
        dataIndex: 'name',
        width: 70
      },
      {
        title: '图片',
        dataIndex: 'url',
        render(_, item) {
          return <img src={item.url} style={{ width: '100px', height: 'auto' }} />
        },
        width: 200
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
                setDelectedItem(item)
                setDetailVisible(true)
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
    <div className="image-content-part">
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
      {detailVisible && (
        <ImageDetailDrawer
          tableData={tableData}
          currentItem={selectedItem}
          visible={detailVisible}
          setVisible={setDetailVisible}
        />
      )}
    </div>
  )
}

export default ImageContent;
