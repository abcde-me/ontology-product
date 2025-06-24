import React from 'react';
import { useState } from 'react';
import { Tabs, Typography, Select, DatePicker, Button,Modal,Message,Popover } from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import { IconPlus, IconDown, IconDragArrow, IconCaretDown, IconCaretRight, IconDelete, IconDownload } from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';

import Tables from '@/components/data-catalog-content/target-table';
// import SourceTable from '../source-table';
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const InputSearch = Input.Search;

export default function TargetTable(props) {
    const { selectedNode } = props;
    const [selectedRows, setSelectedRows] = useState([]); // 用于存储选中的行数据
    const handleSelectionChange = (selectedRowKeys, selectedRowsData) => {
        console.log('选中的行Keys:', selectedRowKeys);
        console.log('选中的行数据:', selectedRowsData);

        setSelectedRows(selectedRowsData || []);
    };

    // 判断是否有选中的行
    const hasSelectedRows = selectedRows.length > 0;

    // 调试信息
    console.log('SourceTable - 当前选中的行数:', selectedRows.length);
    console.log('SourceTable - 按钮是否可用:', hasSelectedRows);
    //批量删除
    const handleDeleteMany = () => {
        try {
            Modal.confirm({
              title: '确认删除文件吗?',
              content: '删除后，文件不可恢复',
              async onOk() {
                // await deleteinterTuningUpdata(appid, e.id, {});
                Message.success('删除成功');
                // creatsuccess();
              }
            });
          } catch {Message.error('删除失败，请重试')}
    }
    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                background: '#fff'
            }}>
                <Space>
                    <div style={{ display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e6eb', width: "260px" }}>
                        <Input.Group compact>
                            <Select defaultValue='数据内容' style={{ width: '100px' }}>
                                <Select.Option value='数据内容'>数据内容</Select.Option>
                                <Select.Option value='ID'>ID</Select.Option>
                            </Select>
                            <InputSearch placeholder='输入关键字搜索' style={{ width: '160px' }} />
                        </Input.Group>
                    </div>
                    <RangePicker
                        style={{ width: 260 }}
                        placeholder={['开始日期', '结束日期']}
                    />
                </Space>
                <Space>
                    {!hasSelectedRows?<Popover
                    
                    content={
                        <span>
                          请先选择文件
                        </span>
                    }
                    >
                    <Button
                            icon={<IconDelete />}
                            type="outline"
                            style={{
                                color: hasSelectedRows ? '#2563EB' : '#94A3B8',
                                cursor: hasSelectedRows ? 'pointer' : 'not-allowed',
                                borderColor: hasSelectedRows ? '#2563EB' : '#94A3B8'
                            }}
                            disabled={!hasSelectedRows}
                            onClick={() => {
                               handleDeleteMany()
                            }}
                        >
                            批量删除
                        </Button>
                    </Popover>:
                        <Button
                            icon={<IconDelete />}
                            type="outline"
                            style={{
                                color: hasSelectedRows ? '#2563EB' : '#94A3B8',
                                cursor: hasSelectedRows ? 'pointer' : 'not-allowed',
                                borderColor: hasSelectedRows ? '#2563EB' : '#94A3B8'
                            }}
                            disabled={!hasSelectedRows}
                            onClick={() => {
                                 handleDeleteMany()
                            }}
                        >
                            批量删除
                        </Button>}
                        {!hasSelectedRows?<Popover
                                content={
                                    <span>
                                    请先选择文件
                                    </span>
                                }
                                >
                            <Button
                            icon={<IconDownload />}
                            type="outline"
                            style={{
                                color: hasSelectedRows ? '#2563EB' : '#94A3B8',
                                cursor: hasSelectedRows ? 'pointer' : 'not-allowed',
                                borderColor: hasSelectedRows ? '#2563EB' : '#94A3B8'
                            }}
                            disabled={!hasSelectedRows}
                            onClick={() => {
                                
                            }}
                            >
                            批量导出
                            </Button>
                            </Popover>:<Button
                            icon={<IconDownload />}
                            type="outline"
                            style={{
                                color: hasSelectedRows ? '#2563EB' : '#94A3B8',
                                cursor: hasSelectedRows ? 'pointer' : 'not-allowed',
                                borderColor: hasSelectedRows ? '#2563EB' : '#94A3B8'
                            }}
                            disabled={!hasSelectedRows}
                            onClick={() => {
                                
                            }}
                        >
                            批量导出
                        </Button>}
                    </Space>
            </div>
            <div>
                {/* <Table selectedNode={selectedNode} /> */}
                <Tables selectedNode={selectedNode} onSelectionChange={handleSelectionChange}/>
            </div>
        </div>
    )
}