import React from 'react';
import { useState } from 'react';
import {
  Tabs,
  Typography,
  Select,
  DatePicker,
  Button
} from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import {
  IconPlus,
  IconDown,
  IconDragArrow,
  IconCaretDown,
  IconCaretRight,
  IconDelete,
  IconDownload
} from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';
import Table from '@/components/data-catalog-content/index';
import Tables from '../table';
import SourceTable from '../source-table';
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const InputSearch = Input.Search;

export default function TargetTable(props) {
  const { selectedNode } = props;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          background: '#fff'
        }}
      >
        <Space>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid #e5e6eb',
              width: '260px'
            }}
          >
            <Input.Group compact>
              <Select defaultValue="Beijing" style={{ width: '100px' }}>
                <Select.Option value="Beijing">Beijing</Select.Option>
                <Select.Option value="Tianjin">Tianjin</Select.Option>
                <Select.Option value="Shanghai">Shanghai</Select.Option>
              </Select>
              <InputSearch
                placeholder="输入关键字搜索"
                style={{ width: '160px' }}
              />
            </Input.Group>
          </div>
          <RangePicker
            style={{ width: 260 }}
            placeholder={['开始日期', '结束日期']}
          />
        </Space>
        <Space>
          <Button
            icon={<IconDelete />}
            type="outline"
            style={{ color: '#94A3B8' }}
          >
            批量删除
          </Button>
          <Button
            icon={<IconDownload />}
            type="outline"
            style={{ color: '#94A3B8' }}
          >
            批量导出
          </Button>
        </Space>
      </div>
      <div>
        {/* <Table selectedNode={selectedNode} /> */}
        <Tables />
      </div>
    </div>
  );
}
