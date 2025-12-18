import {
  getAnnotationDownload,
  getAnnotationList,
  deleteRequirement
} from '@/api/dataAnnotation';
import CreatIcon from '@/assets/annotation/requirement-creat.svg';
import QualityIcon from '@/assets/annotation/requirement-quality.svg';
import AnnotationIcon from '@/assets/annotation/requirement-annotation.svg';
import ExportIcon from '@/assets/annotation/requirement-export.svg';
import EllipsisPopover from '@/components/ellipsis-popover-com';
import noDataElement from '@/components/no-data';
import { PermissionWrapper } from '@/components/PermissionGuard';
import { REQUIREMENT_PERMISSIONS } from '@/config/permissions';
import { useHasPermission, useUserInfo } from '@/store/userInfoStore';
import getLabelByValue from '@/utils/getLabelByValue';
import {
  Button,
  Form,
  Input,
  Link,
  Message,
  Pagination,
  PaginationProps,
  Table
} from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { IconPlus } from '@arco-design/web-react/icon';
import {
  DotStatus,
  ExpandableProcessFlow,
  ProcessStep,
  OperationMenu,
  ActionItem
} from '@ceai-front/arco-material';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { REQUIREMENT_STATUS_CONFIG } from './common';
import './index.scss';
import { RequirementStatus, RequirementType, RequirementTypeMap } from './type';

interface RequirementProcessStep extends Omit<ProcessStep, 'description'> {
  description: React.ReactNode;
}

export default function Requirement() {
  const [form] = Form.useForm();
  const FormItem = Form.Item;
  const history = useHistory();
  const userInfo = useUserInfo();
  const InputSearch = Input.Search;
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化需求列表数据
  const [requirementData, setRequirementData] = useState([]);
  // 当前的第几页
  const [current, setCurrent] = useState(1);
  // 每页展示数据的数据量
  const [pageSize, setPageSize] = useState(10);
  // 总数据量
  const [total, setTotal] = useState(10);
  // 添加loading状态控制
  const [loading, setLoading] = useState(false);
  // 区分是否点击按钮清空搜索框
  const [isClickClear, setIsClickClear] = useState(false);
  // 初始化筛选的值
  const [sortValue, setSortValue]: any = useState({});
  // 组件初始化
  useEffect(() => {
    if (userInfo) getList();
  }, [userInfo, current, pageSize, sortValue]);
  // 清空搜索框
  useEffect(() => {
    if (isClickClear && searchValue === '') {
      getList();
      setIsClickClear(false);
    }
  }, [isClickClear]);

  const getList = async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        page_size: number;
        order: string;
        filters: {
          keyword: string;
          label_type: number | string;
          status: number | string;
        };
      } = {
        page: current || 1, //第几页
        page_size: pageSize || 10, //每页个数
        order: sortValue.order,
        filters: {
          keyword: searchValue,
          label_type: sortValue.label_type,
          status: sortValue.status
        }
      };
      const res = await getAnnotationList(params);
      if (res.code === 'success' && res.data) {
        setRequirementData(res.data.result || []);
        setTotal(res.data?.total);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // 创建需求
  const handleCreateRequirement = (
    type: 'create' | 'copy' | 'edit',
    id?: number | string
  ) => {
    history.push(
      `/tenant/compute/modaforge/requirement/config?type=${type}${id ? `&id=${id}` : ''}`
    );
  };

  // 查看详情
  const viewDetailRequirement = (id: number | string, activeTab = 'detail') => {
    history.push(
      `/tenant/compute/modaforge/requirement/info?id=${id}&activeTab=${activeTab}`
    );
  };

  // 筛选排序操作
  const handleTableChange = (
    _pagination: PaginationProps,
    sorter: SorterInfo,
    filters: Partial<Record<string | number | symbol, string[]>>
  ) => {
    setCurrent(1);
    const sortdata = {
      status: filters?.status,
      label_type: filters?.label_type,
      order:
        sorter.direction === undefined
          ? 'desc'
          : sorter.direction === 'ascend'
            ? 'asc'
            : 'desc'
    };

    setSortValue(sortdata);
  };

  // table数据为空时展示-
  const renderEmptyPlaceholder = (value: string | null) => {
    return value === '' || value == null ? '-' : value;
  };

  // 查看需求详情权限
  const hasPermissionGetDetail = useHasPermission(REQUIREMENT_PERMISSIONS.GET);
  // 查询下载结果权限
  const hasPermissionGetDownload = useHasPermission(
    REQUIREMENT_PERMISSIONS.DOWNLOAD
  );

  // 删除需求
  const handleDeleteRequirement = async (record) => {
    try {
      const res = await deleteRequirement({ req_id: record.id });
      if (res.code === 'success') {
        Message.success('删除成功');
        getList();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error('删除失败');
    }
  };
  // table columns
  const columns: ColumnProps[] = [
    {
      title: '需求名称',
      dataIndex: 'name',
      width: 250,
      ellipsis: true,
      className: 'hover-change requirement-name',
      render: (_, record) => {
        return renderEmptyPlaceholder(record.name) !== '-' ? (
          // 查看需求详情权限判断
          hasPermissionGetDetail ? (
            <EllipsisPopover
              value={record.name}
              isEdit={false}
              isLink
              handleLink={() => {
                viewDetailRequirement(record.id, 'detail');
              }}
            />
          ) : (
            record.name
          )
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '需求ID',
      dataIndex: 'id',
      width: 80,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.id) !== '-' ? (
          <EllipsisPopover value={record.id} isEdit={false} />
        ) : (
          <span>-</span>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      filters: REQUIREMENT_STATUS_CONFIG,
      render: (_, record) => {
        return (
          <DotStatus
            text={getLabelByValue(REQUIREMENT_STATUS_CONFIG, record.status)}
            color={getLabelByValue(
              REQUIREMENT_STATUS_CONFIG,
              record.status,
              'color'
            )}
          />
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'label_type',
      width: 100,
      render: (_, record) => {
        return renderEmptyPlaceholder(record.label_type) !== '-' ? (
          <EllipsisPopover
            value={RequirementTypeMap[record.label_type]}
            isEdit={false}
          />
        ) : (
          <span>-</span>
        );
      },
      filters: [
        {
          text: '文本',
          value: RequirementType.Text
        },
        {
          text: '图片',
          value: RequirementType.Image
        },
        {
          text: '音频',
          value: RequirementType.Audio
        },
        {
          text: '视频',
          value: RequirementType.Video
        }
      ]
    },
    {
      title: '数据量',
      dataIndex: 'label_count', // Changed from 'user_name' to unique dataIndex
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.label_count)} // Updated to correct data field
          isEdit={false}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 220,
      render: (_, record) => (
        <span>
          {record.create_time == '' || record.create_time == null
            ? '-'
            : new Date(record.create_time).toLocaleString()}
        </span>
      ),
      sorter: true
    },
    {
      title: '创建人',
      dataIndex: 'create_by',
      key: `create_by+id`,
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <EllipsisPopover
          value={renderEmptyPlaceholder(record.create_by)}
          isEdit={false}
        />
      )
    },
    {
      title: '操作',
      dataIndex: 'operate',
      align: 'left',
      fixed: 'right',
      width: 160,
      render: (_, record) => {
        const actions: ActionItem[] = [
          ...(hasPermissionGetDetail
            ? [
                {
                  name: '详情',
                  priority: 1,
                  onClick: () => {
                    viewDetailRequirement(record.id, 'detail');
                  }
                }
              ]
            : []),
          // 发布成功、标注完成
          ...([2, 4].includes(record.status)
            ? [
                {
                  name: '编辑',
                  priority: 2,
                  tips:
                    userInfo?.name !== record.create_by
                      ? '仅需求创建人可操作'
                      : '',
                  disabled: userInfo?.name !== record.create_by,
                  onClick: () => {
                    handleCreateRequirement('edit', record.id);
                  }
                }
              ]
            : []),
          {
            name: '复制',
            priority: 3,
            onClick: () => {
              handleCreateRequirement('copy', record.id);
            }
          },
          // 发布成功、标注完成
          ...([2, 4].includes(record.status)
            ? [
                {
                  name: '进度',
                  priority: 4,
                  onClick: () => {
                    viewDetailRequirement(record.id, 'progress');
                  }
                },
                {
                  name: '明细',
                  priority: 5,
                  onClick: () => {
                    viewDetailRequirement(record.id, 'particular');
                  }
                }
              ]
            : []),
          // 标注完成
          ...(record.status !== 4
            ? [
                {
                  name: '删除',
                  priority: 6,
                  tips:
                    userInfo?.name !== record.create_by
                      ? '仅需求创建人可操作'
                      : '',
                  disabled: userInfo?.name !== record.create_by,
                  onClick: () => {
                    handleDeleteRequirement(record);
                  }
                }
              ]
            : [])
        ];
        return <OperationMenu actions={actions} />;
      }
    }
  ];

  const requirementProcess: RequirementProcessStep[] = [
    {
      icon: <CreatIcon />,
      title: '创建需求',
      description: (
        <>
          <span>选择标注工序、标注数据、配置标签、分配人员，</span>
          <Link
            type="text"
            onClick={() => handleCreateRequirement('create')}
            style={{ fontSize: '12px' }}
          >
            创建需求{'>'}
          </Link>
        </>
      )
    },
    {
      icon: <AnnotationIcon />,
      title: '数据标注',
      description: '对图、文、音、视等数据进行标注'
    },
    {
      icon: <QualityIcon />,
      title: '数据质检',
      description: '对标注结果进行质检，驳回错误数据'
    },
    {
      icon: <ExportIcon />,
      title: '导出结果',
      description: '下载标注结果到本地'
      // (
      //   <>
      //     <span>下载标注结果到本地，或在</span>
      //     <Link
      //       type="text"
      //       onClick={() => handleCreateRequirement('create')}
      //       style={{ fontSize: '12px' }}
      //     >
      //       数据集市
      //     </Link>
      //     <span>中查看</span>
      //   </>
      // )
    }
  ];

  return (
    <div className="requirement">
      <ExpandableProcessFlow
        title="需求管理"
        description=""
        toggleText="数据标注流程"
        defaultExpanded={true}
        steps={requirementProcess as any}
      />
      <div className="requirement-form">
        <Form
          form={form}
          autoComplete="off"
          layout="inline"
          validateMessages={{
            required: (_, { label }) => `必须填写 ${label}`
          }}
        >
          <FormItem label={null} field="name" style={{ margin: 0 }}>
            <InputSearch
              onClear={() => {
                setCurrent(1);
                setPageSize(10);
                setSearchValue('');
                setIsClickClear(true);
              }}
              onSearch={() => {
                getList();
                setCurrent(1);
              }}
              onPressEnter={() => {
                getList();
                setCurrent(1);
              }}
              onChange={(val) => {
                setSearchValue(val);
              }}
              placeholder="输入需求ID、名称、创建人搜索"
              allowClear
              style={{ width: 260 }}
            />
          </FormItem>
        </Form>
        {/* 创建需求权限判断 */}
        <PermissionWrapper permission={REQUIREMENT_PERMISSIONS.CREATE}>
          <Button
            type="primary"
            onClick={() => handleCreateRequirement('create')}
            loading={loading}
          >
            <IconPlus /> 创建需求
          </Button>
        </PermissionWrapper>
      </div>
      <Table
        border={false}
        columns={columns}
        data={requirementData}
        pagination={false}
        noDataElement={noDataElement({
          description: '暂无需求',
          btnText: (
            <>
              <IconPlus /> 创建需求
            </>
          ),
          perms: REQUIREMENT_PERMISSIONS.CREATE,
          handleBtn: () => handleCreateRequirement('create')
        })}
        rowKey="id"
        loading={loading}
        onChange={(pagination, sorter, filters) =>
          handleTableChange(pagination, sorter as SorterInfo, filters)
        }
      />
      {/* 分页 */}
      {requirementData && requirementData.length > 0 && (
        <Pagination
          current={current}
          pageSize={pageSize}
          onPageSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setCurrent(1);
          }}
          onChange={(page) => {
            setCurrent(page);
          }}
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          total={total}
          showJumper
          sizeCanChange
          style={{ justifyContent: 'flex-end', marginTop: '10px' }}
        />
      )}
    </div>
  );
}
