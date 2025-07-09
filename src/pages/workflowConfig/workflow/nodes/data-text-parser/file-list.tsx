import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BlockEnum } from '@/pages/workflowConfig/workflow/types';
import { Table, Input } from '@arco-design/web-react';
import { useNodes, type Node } from 'reactflow';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import EmptyIcon from '@/assets/empty.svg';
import { IconSearch } from '@arco-design/web-react/icon';
import { StartNodeType } from '../start/types';
import { getLoadTaskFiles } from '@/api/loadApi';
import { useUnmountedRef } from 'ahooks';
import { formatFileSize } from '@/utils/format';

type FileListProps = {
  catetoryId: number;
  fileTypes: string[];
  files: string[];
  selectedFilesNum: number;
  readOnly: boolean;
  handleFilesChange: (files: string[], selectedCount: number) => void;
};

function FileList({
  catetoryId,
  readOnly,
  fileTypes,
  files,
  selectedFilesNum,
  handleFilesChange
}: FileListProps) {
  const unmountedRef = useUnmountedRef();
  const nodes = useNodes();
  const startNode = nodes.find(
    (node: any) => node.data.type === BlockEnum.Start
  ) as unknown as Node<StartNodeType>;
  const [filesData, setFilesData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0
  });
  const [searchers, setSearchers] = useState<Record<string, any>>({});

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const columns: any[] = [
    {
      title: '文件名',
      dataIndex: 'file_name',
      width: 170,
      filterIcon: <IconSearch />,
      filterDropdown: ({ filterKeys, setFilterKeys, confirm }) => {
        return (
          <div className="arco-table-custom-filter">
            <Input.Search
              ref={inputRef}
              placeholder="输入文件名搜索"
              value={filterKeys[0] || ''}
              onChange={(value) => {
                setFilterKeys(value ? [value] : []);
              }}
              onSearch={() => {
                confirm();
              }}
            />
          </div>
        );
      },
      onFilter: (value, row) =>
        value ? row.file_name.indexOf(value) !== -1 : true,
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => inputRef.current?.focus(), 150);
        }
      },
      render(col, record) {
        return (
          <>
            <EllipsisPopover value={col} isEdit={false} preferTypography />
          </>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'file_type',
      filters: fileTypes
        .join('/')
        .split('/')
        .map((f) => ({ text: f.toLowerCase(), value: f.toLowerCase() })),
      onFilter: (value, row) => value.includes(row.file_type)
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      render(col, record) {
        return <>{formatFileSize(+col)}</>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'task_load_start_time',
      sorter: (a, b) =>
        a.task_load_start_time.localeCompare(b.task_load_start_time)
    }
  ];

  const loadFiles = async (params: any) => {
    const fileConfig = startNode?.data.data_category.find(
      (c) => c.id === catetoryId
    );

    try {
      setLoading(true);
      let result;
      if (fileConfig?.enabled && fileConfig.format.length) {
        const formats = fileConfig.format
          .join('/')
          .split('/')
          .map((f) => f.toLowerCase());
        const sourcePath = startNode?.data.data_path_id;
        // result = {
        //   data: {
        //     items: [...new Array(5)].map((_, index) => {
        //       return {
        //         id: 1000 * params.page + index,
        //         file_name:
        //           String(1000 * params.page + index) +
        //           'Jane DoeJane DoeJane DoeJane DoeJane DoeJane Doe ',
        //         file_type: index % 2 === 0 ? 'docx' : 'pdf',
        //         file_size: 39089,
        //         task_load_start_time: '2025-05-05 05:05:05' + index
        //       };
        //     }),
        //     total: 100
        //   }
        // };
        result = await getLoadTaskFiles({
          data_path_id: sourcePath,
          file_type: formats,
          file_size: 2 * 1024 * 1024 * 1024 - 1, // 过滤掉2G以上文件
          page_size: pagination.limit,
          page: params.page
        });
      } else {
        result = {
          data: {
            items: [],
            total: 0
          }
        };
      }
      if (unmountedRef.current) return;
      // console.log('列表数据:', item);
      const { items = [], total = 0 } = result.data;
      setFilesData(items || []);
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: total
      }));

      const keysSet = new Set([...selectedRowKeys]);
      items
        .filter((d) => !files?.includes(d.id))
        .forEach((d) => {
          keysSet.add(d.id);
        });
      setSelectedRowKeys(Array.from(keysSet));
      console.log('loadFiles', total, files);
      handleFilesChange(files, total - files.length);
    } catch (error) {
      setFilesData([]);
    } finally {
      if (unmountedRef.current) return;
      setLoading(false);
    }
  };

  const onChangeTable = (pagination, sorter, filters, extra) => {
    console.log('表格变化:', { pagination, sorter, filters, extra });

    if (extra.action === 'paginate') {
      setPagination((prev) => ({
        ...prev,
        page: pagination.current,
        limit: pagination.pageSize
      }));
      loadFiles({
        ...pagination,
        page: pagination.current,
        limit: pagination.pageSize
      });
      return;
    }
  };

  useEffect(() => {
    loadFiles({
      page: pagination.page,
      limit: pagination.limit
    });
  }, []);

  return (
    <Table
      className="files-table"
      loading={loading}
      columns={columns}
      pagePosition="br"
      pagination={{
        showTotal: true,
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total
      }}
      onChange={onChangeTable}
      rowSelection={{
        selectedRowKeys,
        checkAll: !readOnly,
        checkboxProps: (record) => {
          return {
            disabled: readOnly
          };
        },
        onSelect: (selected, record, selectedRows) => {
          console.log('onSelect:', selected, record, selectedRows);
          if (selected) {
            if (!selectedRowKeys.includes(record.id)) {
              setSelectedRowKeys([...selectedRowKeys, record.id]);
            }
            if (files.includes(record.id)) {
              handleFilesChange(
                files.filter((f) => f !== record.id),
                selectedFilesNum + 1
              );
            }
          } else {
            if (selectedRowKeys.includes(record.id)) {
              setSelectedRowKeys((old) =>
                old.filter((key) => key !== record.id)
              );
            }
            if (!files.includes(record.id)) {
              handleFilesChange([...files, record.id], selectedFilesNum - 1);
            }
          }
        },
        onSelectAll: (selected) => {
          console.log('onSelectAll:', selected);
          const currentPageFileIds = filesData.map((f) => f.id);
          if (selected) {
            setSelectedRowKeys(
              Array.from(new Set([...selectedRowKeys, ...currentPageFileIds]))
            );
            let counter = 0;
            currentPageFileIds.forEach((id) => {
              if (files.includes(id)) {
                counter++;
              }
            });
            handleFilesChange(
              files.filter((f) => !currentPageFileIds.includes(f)),
              selectedFilesNum + counter
            );
          } else {
            setSelectedRowKeys((oldKeys) =>
              oldKeys.filter((key) => !currentPageFileIds.includes(key))
            );
            let counter = 0;
            currentPageFileIds.forEach((id) => {
              if (!files.includes(id)) {
                counter++;
              }
            });
            handleFilesChange(
              Array.from(new Set([...files, ...currentPageFileIds])),
              selectedFilesNum - counter
            );
          }
        }
      }}
      data={filesData}
      rowKey="id"
      noDataElement={
        <div className="flex flex-col items-center justify-center">
          <EmptyIcon className="size-[48px]"></EmptyIcon>
          <span className="text-[#6E7B8D]">请先选择源数据目录</span>
        </div>
      }
    />
  );
}

export default FileList;
