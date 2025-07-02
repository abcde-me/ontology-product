import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  Select,
  DatePicker,
  Button,
  Popover,
  Modal,
  Message
} from '@arco-design/web-react';
import { Input, Space } from '@arco-design/web-react';
import { IconDelete, IconDownload } from '@arco-design/web-react/icon';
import FormComponent from '@/components/data-catalog-content/components/popups-form';
// 导入统一的表格组件
import UnifiedDataTable from '@/components/data-catalog-content/unified-data-table';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import { deleteTargetFile } from '@/api/dataCatalog';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const InputSearch = Input.Search;

// 定义表格行的接口
interface TableRow {
  full_path: string;
  id: string;
  file: string;
  content?: string;
  type?: string;
  createdAt?: string;
  workflowId?: string;
  file_type?: string;
}

// 定义表格引用类型
interface TableRefType {
  getTableList: () => void;
}

export default function Eltable() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;
  const { activeTab, selectedKey, selectedPath } = catalogTreeStore.useGetState(
    ['activeTab', 'selectedKey', 'selectedPath']
  );

  // 通用状态管理
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([]); // 用于存储选中的行数据
  const [startTime, setStartTime] = React.useState(''); // 开始时间
  const [endTime, setEndTime] = React.useState(''); // 结束时间
  const [dateRange, setDateRange] = React.useState([]); // 日期范围状态

  // Source表格特有的状态（简单搜索）
  const [searchValue, setSearchValue] = useState(''); // Source表格实际用于搜索的值
  const [inputValue, setInputValue] = useState(''); // Source表格输入框的值

  // Target表格特有的状态（高级搜索）
  const [searchType, setSearchType] = useState('数据内容'); // Target表格搜索类型状态
  const [searchKeyword, setSearchKeyword] = useState(''); // Target表格搜索关键字状态
  const [searchCondition, setSearchCondition] = useState({
    type: '数据内容',
    keyword: '',
    isActive: false
  }); // Target表格搜索条件状态，传递给子组件

  const [visible, setVisible] = useState(false); // 下载弹框控制
  const [downloadData, setDownloadData] = useState([]); // 下载的数据

  // 表格引用，用于调用表格内部方法
  const tableRef = React.useRef<TableRefType>(null);

  // 通用的行选择处理函数
  const handleSelectionChange = (selectedRowKeys, selectedRowsData: TableRow[]) => {
    console.log('选中的行Keys:', selectedRowKeys);
    console.log('选中的行数据:', selectedRowsData);
    setSelectedRows(selectedRowsData || []);
  };

  // 判断是否有选中的行
  const hasSelectedRows = selectedRows.length > 0;

  // ========== Source表格的搜索逻辑 ==========
  // Source表格的搜索处理函数（简单关键词搜索）
  const handleSourceSearch = (value) => {
    setSearchValue(value || inputValue);
    console.log('Source表格执行搜索:', value || inputValue);
  };

  // Source表格清空搜索
  const handleSourceClear = () => {
    setInputValue('');
    setSearchValue('');
  };

  // ========== Target表格的搜索逻辑 ==========
  // Target表格搜索类型变化处理
  const handleSearchTypeChange = (value) => {
    setSearchType(value);
    // 更新搜索条件
    setSearchCondition((prev) => ({
      ...prev,
      type: value
    }));
    // 如果有搜索关键字，重新执行搜索
    if (searchKeyword) {
      handleTargetSearch(searchKeyword, value);
    }
  };

  // Target表格的搜索逻辑（支持按类型搜索）
  const handleTargetSearch = (keyword, type = searchType) => {
    setSearchKeyword(keyword);

    if (!keyword.trim()) {
      // 如果搜索关键字为空，重置搜索条件
      console.log('Target表格清空搜索');
      setSearchCondition({
        type: type,
        keyword: '',
        isActive: false
      });
      return;
    }

    console.log(`Target表格按${type}搜索:`, keyword);

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

  // Target表格按数据内容搜索
  const handleContentSearch = (keyword, condition) => {
    console.log('执行数据内容搜索:', keyword);
    console.log('搜索条件:', condition);
    // 在这里添加按数据内容搜索的具体逻辑
  };

  // Target表格按ID搜索
  const handleIdSearch = (keyword, condition) => {
    console.log('执行ID搜索:', keyword);
    console.log('搜索条件:', condition);
    // 在这里添加按ID搜索的具体逻辑
  };

  // Target表格清除搜索
  const handleTargetClear = () => {
    setSearchKeyword('');
    setSearchType('数据内容');
    setSearchCondition({
      type: '数据内容',
      keyword: '',
      isActive: false
    });
  };

  // 通用的批量删除处理函数
  const handleDeleteMany = () => {
    const ids: Array<string> = []
    try {
      Modal.confirm({
        title: '确认删除文件吗?',
        content: '删除后，文件不可恢复',
        onOk: async () => {
          const idList = selectedRows.map((item: { id: string }) => item.id);
          ids.push(...idList);
          console.log(selectedRows[0].full_path,selectedKey, '打印selectedRows88888888888');

          // 调用删除API
          if (selectedRows.length > 0 && selectedRows[0]?.full_path) {
            await deleteTargetFile({
              full_path: selectedRows[0].full_path,
              file_ids: ids,
              path_id: selectedKey
            });
            Message.success('删除成功');

            // 清空选择
            setSelectedRows([]);

            // 刷新表格数据
            if (tableRef.current && tableRef.current.getTableList) {
              tableRef.current.getTableList();
            } else {
              // 如果无法调用方法，则强制刷新页面
              window.location.reload();
            }
          }
        }
      });
    } catch {
      Message.error('删除失败，请重试');
    }
  };
  // 批量导出
  const [defaultName, setDefaultName] = useState('');
  const handleExport = () => {
    // 根据当前标签页设置默认文件名
    const fileName = activeTab === 'source' ? '默认文件名称.zip' : '默认文件名称.json';
    setDefaultName(fileName);
    console.log('导出', selectedRows);
    setVisible(true);
  };

  // 通用的时间选择器事件处理
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

  // 调试信息
  console.log(`${activeTab}Table - 当前选中的行数:`, selectedRows.length);
  console.log(`${activeTab}Table - 按钮是否可用:`, hasSelectedRows);

  // 根据active类型渲染不同的搜索区域
  const renderSearchArea = () => {
    if (activeTab === 'src') {
      // Source表格的简单搜索区域
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f5f5f5',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #e5e6eb'
          }}
        >
          <Input.Search
            allowClear
            placeholder="输入关键词搜索"
            value={inputValue}
            onChange={(value) => setInputValue(value)}
            onSearch={handleSourceSearch}
            onPressEnter={() => handleSourceSearch(inputValue)}
            onClear={handleSourceClear}
            style={{
              width: 260,
              height: 32,
              border: 'none',
              borderRadius: 0,
              background: 'transparent'
            }}
          />
        </div>
      );
    } else {
      // Target表格的高级搜索区域（支持搜索类型选择）
      return (
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
            <Select
              value={searchType}
              style={{ width: '100px' }}
              onChange={handleSearchTypeChange}
            >
              <Select.Option value="数据内容">数据内容</Select.Option>
              <Select.Option value="ID">ID</Select.Option>
            </Select>
            <InputSearch
              placeholder={`输入${searchType}搜索`}
              style={{ width: '160px' }}
              value={searchKeyword}
              onChange={(value) => setSearchKeyword(value)}
              onSearch={handleTargetSearch}
              onClear={handleTargetClear}
              allowClear
            />
          </Input.Group>
        </div>
      );
    }
  };

  // 渲染通用的操作按钮区域
  const renderActionButtons = () => (
    <Space>
      {/* 批量删除按钮 */}
      {!hasSelectedRows ? (
        <Popover content={<span>请先选择文件</span>}>
          <Button
            icon={<IconDelete />}
            type="outline"
            style={{
              color: hasSelectedRows ? '#2563EB' : '#94A3B8',
              cursor: hasSelectedRows ? 'pointer' : 'not-allowed',
              borderColor: hasSelectedRows ? '#2563EB' : '#94A3B8'
            }}
            disabled={!hasSelectedRows}
            onClick={handleDeleteMany}
          >
            批量删除
          </Button>
        </Popover>
      ) : (
        <Button
          icon={<IconDelete />}
          type="outline"
          style={{
            color: hasSelectedRows ? '#2563EB' : '#94A3B8',
            cursor: hasSelectedRows ? 'pointer' : 'not-allowed',
            borderColor: hasSelectedRows ? '#2563EB' : '#94A3B8'
          }}
          disabled={!hasSelectedRows}
          onClick={handleDeleteMany}
        >
          批量删除
        </Button>
      )}

      {/* 批量导出按钮 */}
      {!hasSelectedRows ? (
        <Popover content={<span>请先选择文件</span>}>
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
              handleExport()
            }}
          >
            批量导出
          </Button>
        </Popover>
      ) : (
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
            handleExport()
          }}
        >
          批量导出
        </Button>
      )}
    </Space>
  );

  return (
    <div style={{ flex: 1, overflowX: 'auto' }}>
      <div>
        {/* 通用的顶部操作栏 */}
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
            {/* 根据active类型渲染不同的搜索区域 */}
            {renderSearchArea()}

            {/* 通用的时间范围选择器 */}
            <RangePicker
              style={{ width: 260 }}
              showTime={{
                defaultValue: ['00:00', '04:05'],
                format: 'HH:mm'
              }}
              format="YYYY-MM-DD HH:mm"
              onChange={onChange}
              onSelect={onSelect}
              onOk={onOk}
            />
          </Space>

          {/* 通用的操作按钮区域 */}
          {renderActionButtons()}
        </div>

        {/* 使用统一的数据表格组件，根据active类型动态切换 */}
        <div className="data-catalog-content">
          <UnifiedDataTable
            ref={tableRef}
            selectedNode={selectedKey}
            onSelectionChange={handleSelectionChange}
            // Source表格专用属性
            searchValue={activeTab === 'src' ? searchValue : undefined}
            // Target表格专用属性
            searchCondition={
              activeTab === 'dst' ? searchCondition : undefined
            }
            // 通用属性
            startTime={startTime}
            endTime={endTime}
            // 表格类型标识，根据active值决定
            tableType={activeTab === 'src' ? 'source' : 'target'}
            // 数据类型标识，默认为volume，可根据需要扩展
            dataType="volume"
            selectedFullPath={selectedPath}
            selectedKey={selectedKey}
          />
        </div>
      </div>
      <FormComponent
        downloadData={downloadData}
        onCancel={() => setVisible(false)}
        visible={visible}
        names={defaultName}
        exportdatas={selectedRows}
      />
    </div>
  );
}
