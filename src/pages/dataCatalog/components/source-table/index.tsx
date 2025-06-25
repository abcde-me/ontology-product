import React, { useEffect } from "react";
import { useState } from 'react';
import { Tabs, Typography, Select, DatePicker, Button, Popover, Modal, Message } from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import { IconPlus, IconDown, IconDragArrow, IconCaretDown, IconCaretRight, IconDelete, IconDownload } from '@arco-design/web-react/icon';
import { Tree } from '@arco-design/web-react';
import Table from '@/components/data-catalog-content/source-table'

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
export default function SourceTable(props) {
    const { selectedNode } = props;
    const [selectedRows, setSelectedRows] = useState([]); // 用于存储选中的行数据
    const handleSelectionChange = (selectedRowKeys, selectedRowsData) => {
        console.log('选中的行Keys:', selectedRowKeys);
        console.log('选中的行数据:', selectedRowsData);

        setSelectedRows(selectedRowsData || []);
    };

    // 判断是否有选中的行
    const hasSelectedRows = selectedRows.length > 0;
    const [searchValue, setSearchValue] = useState(''); // 实际用于搜索的值
    const [inputValue, setInputValue] = useState(''); // 输入框的值
    const [startTime, setStartTime] = React.useState('')
    const [endTime, setEndTime] = React.useState('')
    // 新增日期范围状态
    const [dateRange, setDateRange] = React.useState([]);

    // 搜索处理函数
    const handleSearch = (value) => {
        setSearchValue(value || inputValue);
        console.log('执行搜索:', value || inputValue);
    };

    // 清空搜索时也要清空输入框
    const handleClear = () => {
        setInputValue('');
        setSearchValue('');
    };

    // 调试信息
    console.log('SourceTable - 当前选中的行数:', selectedRows.length);
    console.log('SourceTable - 按钮是否可用:', hasSelectedRows);
    //批量删除
    const handleDeleteMany = () => {
        try {
            Modal.confirm({
                title: '确认删除文件吗?',
                content: '删除后，文件不可恢复',
                 onOk() {
                    // await deleteinterTuningUpdata(appid, e.id, {});
                    Message.success('删除成功');
                    // creatsuccess();
                }
            });
        } catch { Message.error('删除失败，请重试') }
    }
    //时间选择器】
    function onSelect(dateString, date) {
        console.log('onSelect', dateString, date);
    }

    function onChange(dateString, date) {
        console.log('onChange: ', dateString, date);
        // 更新日期范围状态
        if (dateString && dateString.length === 2) {
            setStartTime(dateString[0]);
            setEndTime(dateString[1]);
            setDateRange(dateString);
        } else {
            setStartTime('');
            setEndTime('');
            setDateRange([]);
        }
    }

    function onOk(dateString, date) {
        console.log('onOk: ', dateString, date);
    }
    return (
        <div>
            <div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                    background: '#fff',
                    // width: '100%'
                }}>
                    <Space>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e6eb' }}>
                            <Input.Search
                                allowClear
                                placeholder="输入关键词搜索"
                                value={inputValue}
                                onChange={(value) => setInputValue(value)}
                                onSearch={handleSearch}
                                onPressEnter={() => handleSearch(inputValue)}
                                onClear={handleClear}
                                style={{ width: 260, height: 32, border: 'none', borderRadius: 0, background: 'transparent' }}
                            />
                        </div>
                        <RangePicker
                            style={{ maxWidth: 260 }}
                            showTime={{
                                defaultValue: ['00:00', '04:05'],
                                format: 'HH:mm',
                            }}
                            format='YYYY-MM-DD HH:mm'
                            onChange={onChange}
                            onSelect={onSelect}
                            onOk={onOk}
                        />
                    </Space>
                    <Space>
                        {!hasSelectedRows ? <Popover

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
                        </Popover> :
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
                        {!hasSelectedRows ? <Popover
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
                        </Popover> : <Button
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
                <div className="data-catalog-content" >
                    <Table
                        selectedNode={selectedNode}
                        onSelectionChange={handleSelectionChange}
                        searchValue={searchValue}
                        startTime={startTime}
                        endTime={endTime}
                    />
                    {/* <Tables /> */}
                </div>
            </div>
        </div>
    )
}