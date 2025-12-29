import {
  Button,
  Checkbox,
  Descriptions,
  Message,
  Modal,
  Table,
  Tabs
} from '@arco-design/web-react';
import React, { useEffect, useRef, useState } from 'react';
import noDataElement from '@/components/no-data';
import EllipsisPopoverCom from '@/components/ellipsis-popover-com';
import { IconCopy } from '@arco-design/web-react/icon';
import { useScrollTo } from '@/hooks/useScrollTo';
import styles from './viewFileModal.module.scss';
import { openDataGetApiDoc } from '@/api/dataApi';
import { useInViewport, useMemoizedFn } from 'ahooks';
import copy from 'copy-to-clipboard';

const TabPane = Tabs.TabPane;

interface ApiDocDetailResponse {
  apiInfo?: {
    description?: string;
    nameCn?: string;
    path?: string;
    name?: string;
  };
  inputParams?: [];
  outputParams?: [];
  example?: {
    request?: {};
    response?: {};
  };
  statusCode?: [];
}

export default function ViewFileModal({ visible, onCancel, id }) {
  const [viewFileDetailData, setViewFileDetailData] =
    useState<ApiDocDetailResponse>({});
  const [activeKey, setActiveKey] = useState('baseInfo');

  // 查看文档内容区域引用
  const viewFileContentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement[]>([]);

  // 定位到指定元素
  const scrollTo = useScrollTo();

  useEffect(() => {
    if (!id) {
      return;
    }
    handleViewDetail(id);
  }, [id]);

  const callback = useMemoizedFn((entry) => {
    if (entry.isIntersecting) {
      const active = entry.target.getAttribute('id') || '';
      setActiveKey(active);
    }
  });

  useInViewport(menuRef.current, {
    callback,
    root: () => viewFileContentRef.current,
    rootMargin: '0px 0px -95% 0px'
  });

  const handleViewDetail = async (id: string) => {
    const res = await openDataGetApiDoc({ id });
    if (res.code === '' && res.status === 200) {
      setViewFileDetailData(res.data || {});
    } else {
      Message.error(res.message || '查看文档失败');
    }
  };

  // 查看文档基本信息数据
  const viewFileBaseInfoData = [
    {
      label: 'API名称',
      value: (
        <EllipsisPopoverCom
          value={viewFileDetailData?.apiInfo?.nameCn || '-'}
        />
      )
    },
    {
      label: '路径',
      value: (
        <EllipsisPopoverCom value={viewFileDetailData?.apiInfo?.path || '-'} />
      )
    },
    {
      label: '请求方式',
      value: 'POST'
    },
    {
      label: '缓存方式',
      value: '关闭缓存'
    },
    {
      label: '缓存过期时长',
      value: '10s'
    },
    {
      label: '接口描述',
      value: (
        <EllipsisPopoverCom
          value={viewFileDetailData?.apiInfo?.description || '-'}
        />
      )
    },
    {
      label: '文档更新时间',
      value: '2025-05-05 05:05:05'
    }
  ];

  // 查看文档输入参数表列
  const inputParamsColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (text, record, index) => `${index + 1}`
    },
    {
      title: '参数英文名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '参数中文名称',
      dataIndex: 'nameCn',
      width: 200
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 100
    },
    {
      title: '参数类型',
      dataIndex: 'paramType',
      width: 150
    },
    {
      title: '数组',
      dataIndex: 'isArray',
      width: 80,
      render: (text, record) => <Checkbox checked={text} disabled />
    },
    {
      title: '必填',
      dataIndex: 'required',
      width: 80,
      render: (text, record) => <Checkbox checked={text} disabled />
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200
    }
  ];

  // 查看文档输出参数表列
  const outputParamsColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (text, record, index) => `${index + 1}`
    },
    {
      title: '参数英文名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '参数中文名称',
      dataIndex: 'nameCn',
      width: 200
    },
    {
      title: '参数类型',
      dataIndex: 'paramType',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200
    }
  ];

  // 查看文档状态码表列
  const statusCodesColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      render: (text, record, index) => `${index + 1}`
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      width: 100
    },
    {
      title: '码值英文说明',
      dataIndex: 'code',
      width: 300
    },
    {
      title: '码值说明',
      dataIndex: 'description',
      width: 200
    }
  ];

  return (
    <Modal
      className={styles.viewFileModal}
      visible={visible}
      title="API使用文档"
      onCancel={onCancel}
      focusLock={false}
    >
      <>
        <Tabs
          defaultActiveTab={activeKey}
          activeTab={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            scrollTo(`#${key}`, { smooth: true, align: 'start' });
          }}
        >
          <TabPane key="baseInfo" title="基础信息" />
          <TabPane key="inputParams" title="输入参数" />
          <TabPane key="outputParams" title="输出参数" />
          <TabPane key="requestExample" title="请求示例" />
          <TabPane key="outputExample" title="输出示例" />
          <TabPane key="statusCodes" title="状态码" />
        </Tabs>
        <div className={styles.viewFileContent} ref={viewFileContentRef}>
          <div
            id="baseInfo"
            ref={(el: HTMLDivElement) => {
              menuRef.current[0] = el;
            }}
          >
            <Descriptions
              colon=" :"
              layout="horizontal"
              title="基础信息"
              data={viewFileBaseInfoData}
              column={2}
            />
          </div>
          <div
            id="inputParams"
            ref={(el: HTMLDivElement) => {
              menuRef.current[1] = el;
            }}
          >
            <h1 className="mb-4 mt-3 text-sm font-medium">输入参数</h1>
            <Table
              border={false}
              columns={inputParamsColumns}
              data={viewFileDetailData?.inputParams || []}
              pagination={false}
              noDataElement={noDataElement({ description: '暂无数据' })}
              rowKey="name"
            />
          </div>
          <div
            id="outputParams"
            ref={(el: HTMLDivElement) => {
              menuRef.current[2] = el;
            }}
          >
            <h1 className="mb-4 mt-3 text-sm font-medium">输出参数</h1>
            <Table
              border={false}
              columns={outputParamsColumns}
              data={viewFileDetailData?.outputParams || []}
              pagination={false}
              noDataElement={noDataElement({ description: '暂无数据' })}
              rowKey="name"
            />
          </div>
          <div
            id="requestExample"
            ref={(el: HTMLDivElement) => {
              menuRef.current[3] = el;
            }}
          >
            <div className="mb-4 mt-3 flex items-center justify-between">
              <h1 className="mt-[1px] text-sm font-medium">请求示例(JSON)</h1>
              <Button
                type="outline"
                icon={<IconCopy />}
                className={styles.copyButton}
                onClick={() => {
                  const isSuccess = copy(
                    JSON.stringify(
                      viewFileDetailData?.example?.request,
                      null,
                      2
                    ) ?? ''
                  );
                  if (isSuccess) {
                    Message.success('内容复制成功');
                  } else {
                    Message.error('内容复制失败');
                  }
                }}
              >
                复制代码
              </Button>
            </div>
            <div className={styles.tableContent}>
              <pre>
                {viewFileDetailData?.example?.request
                  ? JSON.stringify(
                      viewFileDetailData?.example?.request,
                      null,
                      2
                    )
                  : '-'}
              </pre>
            </div>
          </div>
          <div
            id="outputExample"
            ref={(el: HTMLDivElement) => {
              menuRef.current[4] = el;
            }}
          >
            <h1 className="mb-4 mt-3 text-sm font-medium">输出示例(JSON)</h1>
            <div className={styles.tableContent}>
              <pre>
                {viewFileDetailData?.example?.response
                  ? JSON.stringify(
                      viewFileDetailData?.example?.response,
                      null,
                      2
                    )
                  : '-'}
              </pre>
            </div>
          </div>
          <div
            id="statusCodes"
            ref={(el: HTMLDivElement) => {
              menuRef.current[5] = el;
            }}
          >
            <h1 className="mb-4 mt-3 text-sm font-medium">状态码</h1>
            <Table
              border={false}
              columns={statusCodesColumns}
              data={viewFileDetailData?.statusCode || []}
              pagination={false}
              noDataElement={noDataElement({ description: '暂无数据' })}
              rowKey="key"
            />
          </div>
        </div>
      </>
    </Modal>
  );
}
