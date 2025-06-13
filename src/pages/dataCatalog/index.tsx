import React from 'react';
import './index.css';
import { Input, DatePicker, Space, Button } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import Table from '@/components/data-catalog-content/index'
const { RangePicker } = DatePicker;

const DataCatalog: React.FC = () => {
  const [searchValue, setSearchValue] = React.useState('')
  const [startTime, setStartTime] = React.useState('')
  const [endTime, setEndTime] = React.useState('')

  // 处理时间范围选择
  const handleTimeRangeChange = (dateStrings: string[]) => {
    setStartTime(dateStrings[0] || '')
    setEndTime(dateStrings[1] || '')
  }

  return (
    <div className="p-6">
      <div style={{ padding: '24px', borderRadius: '4px' }}>
        <div className='data-catalog-header'>
          <h1>数据目录</h1>
          <div>
            <Space>
              {/* 搜索框 */}
              <Input
                allowClear
                placeholder="搜索文件名"
                prefix={<IconSearch />}
                style={{ width: 200 }}
                value={searchValue}
                onPressEnter={()=>setSearchValue(searchValue)}
              />

              {/* 时间范围选择器 */}
              <RangePicker
                style={{ width: 300 }}
                placeholder={['输入开始时间', '输入结束时间']}
                showTime
                onChange={handleTimeRangeChange}
              />
            </Space>
          </div>
        </div>
        <div className='data-catalog-content'>
          <Table searchValue={searchValue} startTime={startTime} endTime={endTime}></Table>
        </div>
      </div>
    </div>
  );
};

export default DataCatalog; 