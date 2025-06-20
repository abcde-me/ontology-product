import React from "react";
import { useState } from 'react';
import { Tabs, Typography, Select, DatePicker, Button } from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import { IconPlus, IconDown, IconDragArrow, IconCaretDown, IconCaretRight, IconDelete, IconDownload } from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';
import Table from '@/components/data-catalog-content/index'

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
export default function SourceTable(props){
    return (
        <div>
            <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                background: '#fff'
            }}>
                <Space>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e6eb' }}>
                        <Input.Search
                            allowClear
                            placeholder="输入关键词搜索"
                            style={{ width: 260,height: 32,border: 'none', borderRadius: 0, background: 'transparent' }}
                        />
                    </div>
                    <RangePicker
                        style={{ width: 260 }}
                        placeholder={['开始日期', '结束日期']}
                    />
                </Space>
                <Space>
                    <Button icon={<IconDelete />} type="outline" style={{color:'#94A3B8'}}>批量删除</Button>
                    <Button icon={<IconDownload />} type="outline"  style={{color:'#94A3B8'}}>批量导出</Button>
                </Space>
            </div>
             <div className="data-catalog-content" style={{ width: '100%' }}>
                <Table />
            </div>
            </div>
        </div>
    )
}