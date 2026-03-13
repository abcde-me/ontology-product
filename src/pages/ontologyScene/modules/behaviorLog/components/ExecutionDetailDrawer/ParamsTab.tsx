import React, { useRef, useState, useEffect } from 'react';
import { Table, TableColumnProps, Tooltip } from '@arco-design/web-react';
import { NoDataCard } from '@ceai-front/arco-material';
import { ObjectTypeTagList } from '@/pages/ontologyScene/componens';
import { ParamItem, OutputParamItem } from './types';
import dayjs from 'dayjs';
import { getOntologyObjectTypeDetail } from '@/api/ontologySceneLibrary/objectType';
import { OBJECT_TYPE_ICON_OPTIONS } from '@/pages/ontologyScene/common/constants';

// 溢出检测组件
const EllipsisTextWithTooltip: React.FC<{ text: string }> = ({ text }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    const element = textRef.current;
    if (element) {
      const isOverflow = element.scrollWidth > element.clientWidth;
      setShowTooltip(isOverflow);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <Tooltip content={text} popupVisible={showTooltip}>
      <div
        ref={textRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          cursor: 'default'
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};

// ObjectRef 渲染组件
const ObjectRefRenderer: React.FC<{ value: string }> = ({ value }) => {
  const [displayContent, setDisplayContent] = useState<React.ReactNode>('-');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObjectTypeDetail = async () => {
      try {
        // 解析 ObjectRef 字符串: ObjectRef(object_type="user0123456789", pk="张三")
        // 使用更灵活的解析方式
        if (!value.startsWith('ObjectRef(') || !value.endsWith(')')) {
          setDisplayContent(value);
          setLoading(false);
          return;
        }

        // 提取括号内的内容
        const content = value.slice(10, -1); // 去掉 "ObjectRef(" 和 ")"

        // 分割参数，处理可能包含引号的情况
        const params = content.split(',').map((param) => param.trim());

        let objectTypeId = '';
        let pk = '';

        // 解析每个参数
        for (const param of params) {
          if (param.startsWith('object_type=')) {
            objectTypeId = param.split('=')[1].replace(/"/g, '').trim();
          } else if (param.startsWith('pk=')) {
            pk = param.split('=')[1].replace(/"/g, '').trim();
          }
        }

        if (!objectTypeId || !pk) {
          setDisplayContent(value);
          setLoading(false);
          return;
        }

        const response = await getOntologyObjectTypeDetail({
          code: objectTypeId
        });

        if (response.data) {
          const { icon } = response.data;

          // 匹配图标
          const iconOption = OBJECT_TYPE_ICON_OPTIONS.find(
            (option) => option.value === icon
          );

          const IconComponent =
            iconOption?.icon ?? OBJECT_TYPE_ICON_OPTIONS[0].icon;

          // 渲染：图标 + 名称 / pk
          setDisplayContent(
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span>
                {objectTypeId} / {pk}
              </span>
            </div>
          );
        } else {
          console.log('No response.data from API');
          setDisplayContent(value);
        }
      } catch (error) {
        console.error('Failed to fetch ObjectRef detail:', error);
        setDisplayContent(value);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectTypeDetail();
  }, [value]);

  if (loading) {
    return <span>加载中...</span>;
  }

  return <>{displayContent}</>;
};

// 参数值渲染组件
const ParamValueRenderer: React.FC<{ value: any; record: ParamItem }> = ({
  value,
  record
}) => {
  // 如果数据类型是 ObjectSet 或 Attachment，使用 ObjectTypeTagList 渲染
  if (record.type === 'ObjectSet' || record.type === 'Attachment') {
    // 如果是字符串格式，需要先解析
    let objectTypeList: any[] = [];

    if (typeof value === 'string') {
      // 处理 Attachment("path/to/file.jpg") 格式
      if (record.type === 'Attachment') {
        const attachmentMatch = value.match(/Attachment\("([^"]+)"\)/);
        if (attachmentMatch) {
          const filePath = attachmentMatch[1];
          // 提取文件名（路径的最后一部分）
          const fileName = filePath.split('/').pop() || filePath;
          objectTypeList = [
            {
              name: fileName,
              ontologyObjectTypeName: fileName,
              id: filePath,
              ontologyObjectTypeId: filePath
            }
          ];
        }
      }
      // 处理 ObjectSet([{...}]) 格式
      else if (record.type === 'ObjectSet') {
        const objectSetMatch = value.match(/ObjectSet\((\[.+\])\)/);
        if (objectSetMatch) {
          try {
            // 解析 JSON 数组
            let jsonStr = objectSetMatch[1];

            // 修复 pk 值没有引号的问题
            // 将 "pk":值 替换为 "pk":"值"
            jsonStr = jsonStr.replace(/"pk":([^,}\]]+)/g, (match, pkValue) => {
              // 如果值已经有引号，不处理
              if (pkValue.trim().startsWith('"')) {
                return match;
              }
              // 否则给值加上引号
              return `"pk":"${pkValue.trim()}"`;
            });

            const parsedArray = JSON.parse(jsonStr);
            objectTypeList = parsedArray.map((item: any) => ({
              name: item.pk || '',
              ontologyObjectTypeName: item.pk || '',
              id: item.object_type,
              ontologyObjectTypeId: String(item.object_type),
              // icon 字段可以从 item 中获取，如果没有则不传
              ontologyObjectTypeIcon: item.icon || undefined
            }));
          } catch (error) {
            console.error('Failed to parse ObjectSet:', error);
          }
        }
      }
    } else if (Array.isArray(value)) {
      objectTypeList = value;
    }

    if (objectTypeList.length === 0) {
      return <span>-</span>;
    }

    // 转换为 ObjectTypeTagList 需要的格式
    const tags = objectTypeList.map((item: any) => ({
      ontologyObjectTypeName: item.name || item.ontologyObjectTypeName || '',
      ontologyObjectTypeId: item.id || item.ontologyObjectTypeId,
      ontologyObjectTypeIcon:
        record.type === 'Attachment'
          ? 'attachment-icon'
          : item.icon || item.ontologyObjectTypeIcon,
      onClick: () => {
        console.log('Click object type:', item);
      }
    }));

    return <ObjectTypeTagList tags={tags} />;
  }

  // 如果数据类型是 Timestamp，转换时间戳为可读格式
  if (record.type === 'Timestamp') {
    if (!value || value === '-') {
      return <span>-</span>;
    }

    const timestamp = Number(value);
    if (!isNaN(timestamp)) {
      const formattedDate = dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
      return <EllipsisTextWithTooltip text={formattedDate} />;
    }
  }

  // 如果数据类型是 ObjectRef，使用 ObjectRefRenderer 渲染
  if (record.type === 'ObjectRef') {
    if (!value || value === '-') {
      return <span>-</span>;
    }

    if (typeof value === 'string') {
      return <ObjectRefRenderer value={value} />;
    }

    return <span>{String(value)}</span>;
  }

  // 如果数据类型是 Geopoint，提取坐标值
  if (record.type === 'Geopoint') {
    if (!value || value === '-') {
      return <span>-</span>;
    }

    const stringValue = String(value);
    // 使用正则匹配 GeoPoint(lat, lng) 格式
    const geoPointMatch = stringValue.match(/GeoPoint\(([\d.]+),\s*([\d.]+)\)/);
    if (geoPointMatch) {
      const [, lat, lng] = geoPointMatch;
      const formattedValue = `[${lat}, ${lng}]`;
      return <EllipsisTextWithTooltip text={formattedValue} />;
    }
    // 如果不匹配，返回原始值
    return <EllipsisTextWithTooltip text={stringValue} />;
  }

  // 对象类型的值渲染
  if (typeof value === 'object' && value !== null) {
    return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
  }

  // 其他类型的值渲染
  const stringValue = value ? String(value) : '-';
  return stringValue !== '-' ? (
    <EllipsisTextWithTooltip text={stringValue} />
  ) : (
    <span>-</span>
  );
};

interface ParamsTabProps {
  params: ParamItem[];
  outputParams: OutputParamItem[];
  loading?: boolean;
}

export const ParamsTab: React.FC<ParamsTabProps> = ({
  params,
  outputParams,
  loading
}) => {
  const inputColumns: TableColumnProps<ParamItem>[] = [
    {
      title: '入参名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      width: 150
    },
    {
      title: '值',
      dataIndex: 'value',
      ellipsis: true,
      tooltip: true,
      width: 300,
      render: (value, record) => (
        <ParamValueRenderer value={value} record={record} />
      )
    }
  ];

  const outputColumns: TableColumnProps<OutputParamItem>[] = [
    {
      title: '出参名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '出参类型',
      dataIndex: 'type',
      width: 150
    }
  ];

  return (
    <div className="mt-4 space-y-6">
      {/* 入参详情 */}
      <div>
        <div className="mb-3 text-[14px] font-medium text-[#1E293B]">
          入参详情
        </div>
        <Table
          loading={loading}
          columns={inputColumns}
          data={params}
          rowKey="name"
          border={false}
          pagination={{
            pageSize: 5,
            showTotal: false,
            simple: false
          }}
          noDataElement={<NoDataCard title="暂无数据" />}
          className="[&_.arco-table-th]:bg-[#f7f8fa]"
        />
      </div>

      {/* 出参详情 */}
      <div>
        <div className="mb-3 text-[14px] font-medium text-[#1E293B]">
          出参详情
        </div>
        <Table
          loading={loading}
          columns={outputColumns}
          data={outputParams}
          rowKey="name"
          border={false}
          pagination={{
            pageSize: 5,
            showTotal: false,
            simple: false
          }}
          noDataElement={<NoDataCard title="暂无数据" />}
          className="[&_.arco-table-th]:bg-[#f7f8fa]"
        />
      </div>
    </div>
  );
};
