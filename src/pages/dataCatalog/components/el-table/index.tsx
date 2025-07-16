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
import './index.css';
import { IconDelete, IconDownload } from '@arco-design/web-react/icon';
import FormComponent from '@/components/data-catalog-content/components/popups-form';
// 导入统一的表格组件
import UnifiedDataTable from '@/components/data-catalog-content/unified-data-table';
import { useDataCatalog } from '../DataCatalogProvider/Context';
import { deleteTargetFile, deleteSourceFileBatch } from '@/api/dataCatalog';
import styles from '../../modal.module.css';
import {
  PopupsFormFrom,
  SourceDataItem,
  TargetDataItem
} from '@/components/data-catalog-content/components/popups-form/types';
import { Dataset } from '@/pages/datasetManagement';

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
  resetSelection: () => void;
  clearAllSelections?: () => void;
  handAllReset?: () => void;
  updateSelection?: (keys: React.Key[]) => void;
  getSelectedData?: () => {
    selectedRowKeys: React.Key[];
    selectedRows: Array<SourceDataItem & TargetDataItem>;
  };
}

export default function Eltable() {
  const dataCatalog = useDataCatalog();
  const { catalogTreeStore } = dataCatalog;
  const { activeTab, selectedKey, selectedPath } = catalogTreeStore.useGetState(
    ['activeTab', 'selectedKey', 'selectedPath']
  );

  // 通用状态管理
  const [selectedRows, setSelectedRows] = useState<
    Array<SourceDataItem & TargetDataItem>
  >([]); // 用于存储选中的行数据
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

  // 表格引用，用于调用表格内部方法
  const tableRef = React.useRef<TableRefType>(null);

  // 监听activeTab变化，在切换标签页时重置选中状态和日期选择器
  useEffect(() => {
    // 清空选中行数据
    setSelectedRows([]);
    // 清空日期选择器
    setDateRange([]);
    setStartTime('');
    setEndTime('');
    if (tableRef.current) {
      if (tableRef.current.clearAllSelections) {
        tableRef.current.clearAllSelections();
      } else if (tableRef.current.resetSelection) {
        tableRef.current.resetSelection();
      }
    }
  }, [activeTab]);
  useEffect(() => {
    const handleResetSearch = (event) => {
      const { tableType } = event.detail;
      console.log('接收到重置搜索输入的事件', tableType);
      // 重置日期范围
      setDateRange([]);
      setStartTime('');
      setEndTime('');
      if (tableType === 'source' || !tableType) {
        // 重置源表格搜索
        setSearchValue('');
        setInputValue('');
      }
      if (tableType === 'target' || !tableType) {
        // 重置目标表格搜索
        setSearchKeyword('');
        setSearchType('数据内容');
        setSearchCondition({
          type: '数据内容',
          keyword: '',
          isActive: false
        });
      }
    };
    window.addEventListener('resetSearchInputs', handleResetSearch);
    return () => {
      window.removeEventListener('resetSearchInputs', handleResetSearch);
    };
  }, []);

  // 监听搜索类型改变的事件
  useEffect(() => {
    const handleResetSearchKeyword = (event) => {
      const { tableType, searchType } = event.detail;
      if (tableType === 'target') {
        console.log('接收到搜索类型变化事件，重置关键词输入:', searchType);
        // 清空搜索关键词，保留搜索类型
        setSearchKeyword('');
        setSearchCondition((prev) => ({
          ...prev,
          keyword: '',
          isActive: false
        }));
      }
    };
    window.addEventListener('resetSearchKeyword', handleResetSearchKeyword);
    return () => {
      window.removeEventListener(
        'resetSearchKeyword',
        handleResetSearchKeyword
      );
    };
  }, []);

  // 通用的行选择处理函数
  const handleSelectionChange = (
    selectedRowKeys,
    selectedRowsData: Array<SourceDataItem & TargetDataItem & Dataset>
  ) => {
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
    const event = new CustomEvent('resetPageToFirst', {
      detail: { tableType: 'source' }
    });
    window.dispatchEvent(event);
  };

  // Source表格清空搜索
  const handleSourceClear = () => {
    setInputValue('');
    setSearchValue('');
    const event = new CustomEvent('resetPageToFirst', {
      detail: { tableType: 'source' }
    });
    window.dispatchEvent(event);
  };

  // ========== Target表格的搜索逻辑 ==========
  // Target表格搜索类型变化处理
  const handleSearchTypeChange = (value) => {
    setSearchType(value);
    setSearchCondition((prev) => ({
      ...prev,
      type: value,
      keyword: '',
      isActive: false
    }));
    setSearchKeyword('');
    const event = new CustomEvent('resetPageToFirst', {
      detail: { tableType: 'target' }
    });
    window.dispatchEvent(event);
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
      const event = new CustomEvent('resetPageToFirst', {
        detail: { tableType: 'target' }
      });
      window.dispatchEvent(event);
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

    const event = new CustomEvent('resetPageToFirst', {
      detail: { tableType: 'target' }
    });
    window.dispatchEvent(event);
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
    const event = new CustomEvent('resetPageToFirst', {
      detail: { tableType: 'target' }
    });
    window.dispatchEvent(event);
  };

  // 清除所有选择状态和缓存的函数
  const clearAllSelectionsAndCache = () => {
    setSelectedRows([]);
    if (tableRef.current) {
      if (tableRef.current.clearAllSelections) {
        tableRef.current.clearAllSelections();
      }
      if (tableRef.current.resetSelection) {
        tableRef.current.resetSelection();
      }
      const event = new CustomEvent('resetPageToFirst', {
        detail: { tableType: activeTab === 'src' ? 'source' : 'target' }
      });
      window.dispatchEvent(event);
      if (tableRef.current.getTableList) {
        tableRef.current.getTableList();
      }
    }
    setTimeout(() => {
      setSelectedRows([]);
      if (tableRef.current) {
        if (tableRef.current.clearAllSelections) {
          tableRef.current.clearAllSelections();
        }
        if (tableRef.current.resetSelection) {
          tableRef.current.resetSelection();
        }
        if (tableRef.current.getTableList) {
          tableRef.current.getTableList();
        }
      }
    }, 100);
  };

  // 通用的批量删除处理函数
  const handleDeleteMany = () => {
    const ids: Array<number> = [];
    try {
      Modal.confirm({
        title: '确认删除文件吗?',
        content: '删除后，文件不可恢复',
        onOk: async () => {
          if (activeTab === 'dst') {
            const idList = selectedRows.map((item: { id: number }) => item.id);
            ids.push(...idList);
            // 调用删除API
            if (selectedRows.length > 0 && selectedRows[0]?.full_path) {
              const res = await deleteTargetFile({
                full_path: selectedRows[0].full_path,
                file_ids: ids,
                path_id: selectedKey
              });
              if (res.code == '') {
                Message.success('删除成功');
                clearAllSelectionsAndCache();
              } else {
                Message.error('删除失败，请稍后重试');
              }
            }
          } else {
            const fileIds = selectedRows.map((item: { id: number }) => item.id);
            console.log(fileIds);

            ids.push(...fileIds);
            if (selectedRows.length > 0) {
              const res = await deleteSourceFileBatch({
                ids: ids
              });
              if (res.code == '') {
                Message.success('删除成功');
                clearAllSelectionsAndCache();
              } else {
                Message.error('删除失败，请稍后重试');
              }
            }
          }
        },
        className: styles['modalWrapper']
      });
    } catch {
      Message.error('删除失败，请稍后重试');
    }
  };
  // 批量导出
  const [defaultName, setDefaultName] = useState('');
  const handleExport = () => {
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
      const event = new CustomEvent('resetPageToFirst', {
        detail: { tableType: activeTab === 'src' ? 'source' : 'target' }
      });
      window.dispatchEvent(event);
    } else {
      setStartTime('');
      setEndTime('');
      setDateRange([]);
      const event = new CustomEvent('resetPageToFirst', {
        detail: { tableType: activeTab === 'src' ? 'source' : 'target' }
      });
      window.dispatchEvent(event);
    }
  }

  function onOk(dateString, date) {
    console.log('onOk: ', dateString, date);
  }

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
            border: 0
          }}
        >
          <Input.Search
            allowClear
            placeholder="输入文件名搜索"
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
              placeholder={`输入ID/关键字搜索`}
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
        <Popover content="请先选择文件" className="narrow-popover">
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
        <Popover content="请先选择文件" className="narrow-popover">
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
              handleExport();
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
            handleExport();
          }}
        >
          批量导出
        </Button>
      )}
    </Space>
  );

  return (
    <div style={{ flex: 1, overflowX: 'auto' }}>
      <div style={{ height: 'calc(100% - 50px)' }}>
        {/* 通用的顶部操作栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            background: '#fff'
          }}
        >
          <Space>
            {/* 根据active类型渲染不同的搜索区域 */}
            {renderSearchArea()}
            {/* 通用的时间范围选择器 */}
            <DatePicker.RangePicker
              style={{ width: 260 }}
              showTime={{
                defaultValue: ['00:00:00', '23:59:59'],
                format: 'HH:mm:ss'
              }}
              format="YYYY-MM-DD HH:mm:ss"
              onChange={onChange}
              onSelect={onSelect}
              onOk={onOk}
              value={dateRange.length > 0 ? dateRange : undefined}
              allowClear={true}
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
            searchCondition={activeTab === 'dst' ? searchCondition : undefined}
            startTime={startTime}
            endTime={endTime}
            tableType={activeTab === 'src' ? 'source' : 'target'}
            // 数据类型标识，默认为volume，可根据需要扩展
            dataType="volume"
            selectedFullPath={selectedPath}
            selectedKey={selectedKey}
            key={`${activeTab}-${selectedKey}-${selectedPath}`}
          />
        </div>
      </div>
      <FormComponent
        from={
          activeTab === 'src'
            ? PopupsFormFrom.SourceData
            : PopupsFormFrom.TargetData
        }
        onCancel={() => {
          setVisible(false);
          // 取消导出时不重置选中状态
        }}
        visible={visible}
        names={defaultName}
        exportdatas={
          selectedRows as Array<SourceDataItem & TargetDataItem & Dataset>
        }
        selectedPath={selectedPath}
        onExportSuccess={() => {}}
        resetSelectedData={clearAllSelectionsAndCache}
      />
    </div>
  );
}
