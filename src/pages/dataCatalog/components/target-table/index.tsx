import React from 'react';
import { useState } from 'react';
import { Tabs, Typography, Select, DatePicker, Button, Modal, Message, Popover } from '@arco-design/web-react';
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

import Tables from '@/components/data-catalog-content/target-table';
// import SourceTable from '../source-table';
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const InputSearch = Input.Search;

export default function TargetTable(props) {
    const { selectedNode } = props;
    const [selectedRows, setSelectedRows] = useState([]); // 用于存储选中的行数据
    const [searchType, setSearchType] = useState('数据内容'); // 搜索类型状态
    const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键字状态
    const [searchCondition, setSearchCondition] = useState({
        type: '数据内容',
        keyword: '',
        isActive: false
    }); // 搜索条件状态，传递给子组件

    const handleSelectionChange = (selectedRowKeys, selectedRowsData) => {
        console.log('选中的行Keys:', selectedRowKeys);
        console.log('选中的行数据:', selectedRowsData);

        setSelectedRows(selectedRowsData || []);
    };

    // 处理搜索类型变化
    const handleSearchTypeChange = (value) => {
        setSearchType(value);
        // 更新搜索条件
        setSearchCondition(prev => ({
            ...prev,
            type: value
        }));
        // 如果有搜索关键字，重新执行搜索
        if (searchKeyword) {
            handleSearch(searchKeyword, value);
        }
    };

    // 处理搜索逻辑
    const handleSearch = (keyword, type = searchType) => {
        setSearchKeyword(keyword);

        if (!keyword.trim()) {
            // 如果搜索关键字为空，重置搜索条件
            console.log('清空搜索');
            setSearchCondition({
                type: type,
                keyword: '',
                isActive: false
            });
            return;
        }

        console.log(`按${type}搜索:`, keyword);

        // 更新搜索条件，传递给子组件
        const newSearchCondition = {
            type: type,
            keyword: keyword.trim(),
            isActive: true
        };

        setSearchCondition(newSearchCondition);

        if (type === '数据内容') {
            // 按数据内容搜索的逻辑
            handleContentSearch(keyword, newSearchCondition);
        } else if (type === 'ID') {
            // 按ID搜索的逻辑
            handleIdSearch(keyword, newSearchCondition);
        }
    };

    // 按数据内容搜索
    const handleContentSearch = (keyword, condition) => {
        console.log('执行数据内容搜索:', keyword);
        console.log('搜索条件:', condition);
        // 在这里添加按数据内容搜索的具体逻辑
        // 例如：调用API、处理数据过滤等
        // 子组件Tables会根据searchCondition来过滤显示数据
    };

    // 按ID搜索
    const handleIdSearch = (keyword, condition) => {
        console.log('执行ID搜索:', keyword);
        console.log('搜索条件:', condition);
        // 在这里添加按ID搜索的具体逻辑
        // 例如：调用API、处理数据过滤等
        // 子组件Tables会根据searchCondition来过滤显示数据
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
        } catch { Message.error('删除失败，请重试') }
    }
    //请除搜索
    const handleClear = () => {
        setSearchKeyword('');
        setSearchType('数据内容');
        setSearchCondition({
            type: '数据内容',
            keyword: '',
            isActive: false
        });
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
                            <Select
                                value={searchType}
                                style={{ width: '100px' }}
                                onChange={handleSearchTypeChange}
                            >
                                <Select.Option value='数据内容'>数据内容</Select.Option>
                                <Select.Option value='ID'>ID</Select.Option>
                            </Select>
                            <InputSearch
                                placeholder={`输入${searchType}搜索`}
                                style={{ width: '160px' }}
                                value={searchKeyword}
                                onChange={(value) => setSearchKeyword(value)}
                                onSearch={handleSearch}
                                onClear={handleClear}
                                allowClear
                            />
                        </Input.Group>
                    </div>
                    <RangePicker
                        style={{ width: 260 }}
                        placeholder={['开始日期', '结束日期']}
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
            <div>
                {/* <Table selectedNode={selectedNode} /> */}
                <Tables selectedNode={selectedNode} onSelectionChange={handleSelectionChange} searchCondition={searchCondition} />
            </div>
        </div>
    )
}
