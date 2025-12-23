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
import { throttle } from 'lodash-es';

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
}

export default function ViewFileModal({ visible, onCancel, id }) {
  const [viewFileDetailData, setViewFileDetailData] =
    useState<ApiDocDetailResponse>({});
  const [dataApiData, setDataApiData] = useState([]);
  const [activeKey, setActiveKey] = useState('baseInfo');

  // 查看文档内容区域引用
  const viewFileContentRef = useRef<HTMLDivElement>(null);
  // 基础信息标题引用
  const baseInfoRef = useRef<HTMLDivElement>(null);
  // 输入参数标题引用
  const inputParamsRef = useRef<HTMLDivElement>(null);
  // 输出参数标题引用
  const outputParamsRef = useRef<HTMLDivElement>(null);
  // 请求示例标题引用
  const requestExampleRef = useRef<HTMLDivElement>(null);
  // 输出示例标题引用
  const outputExampleRef = useRef<HTMLDivElement>(null);
  // 状态码标题引用
  const statusCodesRef = useRef<HTMLDivElement>(null);

  // 定位到指定元素
  const scrollTo = useScrollTo();

  useEffect(() => {
    if (!id) {
      return;
    }
    handleViewDetail(id);
  }, [id]);

  // 监听滚动事件，根据滚动位置更新选中的Tab
  useEffect(() => {
    const container = viewFileContentRef.current;

    if (!container) return;
    const handleScroll = () => {
      const parentRect = container.getBoundingClientRect();
      if (
        getIsRefTopNumberInViewTop(parentRect, baseInfoRef) &&
        baseInfoRef.current?.id
      ) {
        setActiveKey(baseInfoRef.current?.id);
      } else if (
        getIsRefTopNumberInViewTop(parentRect, inputParamsRef) &&
        inputParamsRef.current?.id
      ) {
        setActiveKey(inputParamsRef.current?.id);
      } else if (
        getIsRefTopNumberInViewTop(parentRect, outputParamsRef) &&
        outputParamsRef.current?.id
      ) {
        setActiveKey(outputParamsRef.current?.id);
      } else if (
        getIsRefTopNumberInViewTop(parentRect, requestExampleRef) &&
        requestExampleRef.current?.id
      ) {
        setActiveKey(requestExampleRef.current?.id);
      } else if (
        getIsRefTopNumberInViewTop(parentRect, outputExampleRef) &&
        outputExampleRef.current?.id
      ) {
        setActiveKey(outputExampleRef.current?.id);
      } else if (
        getIsRefTopNumberInViewTop(parentRect, statusCodesRef) &&
        statusCodesRef.current?.id
      ) {
        setActiveKey(statusCodesRef.current?.id);
      }
    };

    // 节流处理滚动事件，避免频繁触发
    const throttledHandleScroll = throttle(handleScroll, 100);
    // 监听滚轮事件
    container.addEventListener('scroll', throttledHandleScroll, {
      passive: false
    });
    // 在组件卸载时移除监听器
    return () => {
      container.removeEventListener('scroll', throttledHandleScroll);
      throttledHandleScroll.cancel(); // 清除节流计时器
    };
  }, [viewFileContentRef.current]);

  const getIsRefTopNumberInViewTop = (
    parentRect,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    const childRect = ref.current?.getBoundingClientRect();
    if (!childRect) return false;
    return (
      Number((childRect.top - parentRect.top).toFixed(0)) <= 0 &&
      Number((childRect.bottom - parentRect.top).toFixed(0)) > 0
    );
  };

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
        <EllipsisPopoverCom value={viewFileDetailData?.apiInfo?.nameCn || ''} />
      )
    },
    {
      label: '路径',
      value: (
        <EllipsisPopoverCom value={viewFileDetailData?.apiInfo?.path || ''} />
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
          value={viewFileDetailData?.apiInfo?.description || ''}
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
      dataIndex: 'englishName',
      width: 200
    },
    {
      title: '参数中文名称',
      dataIndex: 'chineseName',
      width: 200
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 100
    },
    {
      title: '参数类型',
      dataIndex: 'type',
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
      dataIndex: 'isRequired',
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
      dataIndex: 'statusCodeEnglish',
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
          <div id="baseInfo" ref={baseInfoRef}>
            <Descriptions
              colon=" :"
              layout="horizontal"
              title="基础信息"
              data={viewFileBaseInfoData}
              column={2}
            />
          </div>
          <div id="inputParams" ref={inputParamsRef}>
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
          <div id="outputParams" ref={outputParamsRef}>
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
          <div id="requestExample" ref={requestExampleRef}>
            <div className="mb-4 mt-3 flex items-center justify-between">
              <h1 className="mt-[1px] text-sm font-medium">请求示例(JSON)</h1>
              <Button
                type="outline"
                icon={<IconCopy />}
                className={styles.copyButton}
              >
                复制代码
              </Button>
            </div>
            <div className={styles.tableContent}>
              <pre>
                {JSON.stringify(viewFileDetailData?.example?.request, null, 2)}
              </pre>
            </div>
          </div>
          <div id="outputExample" ref={outputExampleRef}>
            <h1 className="mb-4 mt-3 text-sm font-medium">输出示例(JSON)</h1>
            <div className={styles.tableContent}>
              <pre>
                {JSON.stringify(viewFileDetailData?.example?.response, null, 2)}
              </pre>
            </div>
          </div>
          <div id="statusCodes" ref={statusCodesRef}>
            <h1 className="mb-4 mt-3 text-sm font-medium">状态码</h1>
            <Table
              border={false}
              columns={statusCodesColumns}
              data={dataApiData}
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
