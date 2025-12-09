import React, { useEffect, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  Message,
  Modal,
  Pagination,
  Popover,
  Spin,
  Tooltip
} from '@arco-design/web-react';
import { useUserInfo } from '@/store/userInfoStore';
import Mock from 'mockjs';
import styles from './index.module.scss';
import { IconCopy, IconDelete } from '@arco-design/web-react/icon';
import {
  deleteDevelopScriptLogByVersion,
  listDevelopScriptLogByKeyApi,
  getDevelopScriptLogByVersion
} from '@/api/sql';
import noDataElement from '@/components/no-data';

// 版本类型 已发版 未发版 调度中
export const VersionType = {
  RELEASED: 2, // 已发版
  UNRELEASED: 1, // 未发版
  SCHEDULED: 3 // 调度中
} as const;

export enum VersionTypeEnum {
  RELEASED = '已发版',
  UNRELEASED = '未发版',
  SCHEDULED = '调度中'
}

interface ScriptCardProps {
  onToScriptList: (type: string) => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ onToScriptList }) => {
  const userInfo = useUserInfo();
  // 初始化搜索框value
  const [searchValue, setSearchValue] = useState('');
  // 初始化工作流列表数据
  const [workflowData, setWorkflowData] = useState([]);
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
  // mock数据 接口返回
  const [scriptCardList, setScriptCardList] = useState([]);
  const mockjsData = Mock.mock({
    'list|100': [
      {
        id: '@id',
        version: '@integer(1, 100)',
        title: '@ctitle(5,100)',
        content: '@cparagraph(1,60)',
        version_type: '@pick(["released", "unreleased", "scheduled"])'
      }
    ]
  });
  // 组件初始化
  useEffect(() => {
    if (userInfo) getCardList();
  }, [userInfo, current, pageSize]);

  // 清空搜索框
  useEffect(() => {
    if (isClickClear && searchValue === '') {
      getCardList();
      setIsClickClear(false);
    }
  }, [isClickClear, searchValue]);

  const getCardList = async () => {
    setLoading(true);
    try {
      const params: any = {
        search_content: searchValue,
        page: current,
        page_size: pageSize
      };
      const res = await listDevelopScriptLogByKeyApi(params);
      console.log(res);
      if (res.status !== 200) {
        Message.error(res?.message);
      }
      if (res.status === 200 && res.code === '') {
        setScriptCardList(res.data?.items || []);
        setTotal(res.data?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  //

  // 删除卡片脚本
  const deleteScript = (id: number, type: number) => {
    console.log(type, '123');
    if (type === VersionType.UNRELEASED) {
      Message.error('调度中的脚本不能删除');
      return;
    }
    if (type === VersionType.RELEASED) {
      Modal.confirm({
        title: (
          <span className={styles['workflow-list-modal-title']}>
            确认删除此脚本？
          </span>
        ),
        content: (
          <div className={styles['workflow-list-modal-content']}>
            删除后，该脚本不可恢复。
          </div>
        ),
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          deleteCardScript(id, type);
        }
      });
      return;
    }
  };
  // 删除脚本
  const deleteCardScript = async (id: number, type: number) => {
    const res = await deleteDevelopScriptLogByVersion({
      version: type,
      script_id: Number(id)
    });
    if (res.status === 200 && res.code === '') {
      Message.success({
        content: '删除成功'
      });
      getCardList();
    } else {
      Message.error({
        content: res?.message ?? '删除失败，请稍后重试'
      });
    }
  };
  // 查看脚本详情
  const handleViewScriptDetail = (id: number) => {
    // openNewPage(
    //     `/modaforge/tenant/compute/modaforge/workflowConfig?workflow_uuid=${workflow_uuid}&ds_workflow_id=${ds_workflow_id}`
    // );
  };
  // 判断状态 已发版 未发版 调度中
  const getVersionType = (version_type) => {
    switch (version_type) {
      case VersionType.RELEASED:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.RELEASED
                  ? styles['released-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.RELEASED}
            </div>
          </div>
        );
      case VersionType.UNRELEASED:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.UNRELEASED
                  ? styles['unreleased-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.UNRELEASED}
            </div>
          </div>
        );
      case VersionType.SCHEDULED:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.SCHEDULED
                  ? styles['scheduled-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.SCHEDULED}
            </div>
          </div>
        );
      default:
        return (
          <div className={styles['script-card-content-item-title-icon']}>
            <span
              className={
                version_type === VersionType.UNRELEASED
                  ? styles['unreleased-icon']
                  : ''
              }
            />
            <div className={styles['script-card-content-item-title-icon-text']}>
              {VersionTypeEnum.UNRELEASED}
            </div>
          </div>
        );
    }
  };
  // 查询脚本卡片列表
  const onToSearchScriptList = async () => {
    try {
      const res = await getDevelopScriptLogByVersion({
        script_context: searchValue
      });
      if (res.status === 200) {
        setScriptCardList(res.data?.items || []);
        setTotal(res.data?.total || 0);
      } else {
        setScriptCardList([]);
        setTotal(0);
        Message.error(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={styles['script-card-wrapper']}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '16px'
        }}
      >
        <Input
          allowClear
          onClear={() => {
            getCardList();
          }}
          onChange={(value) => {
            setSearchValue(value);
          }}
          onPressEnter={() => {
            onToSearchScriptList();
          }}
          style={{ width: '100%' }}
          placeholder="请输入脚本内容关键词"
        />
      </div>
      <Spin loading={loading} style={{ width: '100%' }}>
        <div className={styles['script-card-content']}>
          {scriptCardList?.length > 0
            ? scriptCardList.map((item: any) => (
                <div
                  key={item.script_id}
                  className={styles['script-card-content-item']}
                >
                  <div className={styles['script-card-content-item-title']}>
                    <div
                      className={styles['script-card-content-item-title-left']}
                    >
                      <div
                        onClick={() => {
                          onToScriptList('files');
                        }}
                        className={
                          styles['script-card-content-item-title-text']
                        }
                      >
                        <span>{item?.script_name || ''}</span>
                        <span>({item.version_name})</span>
                      </div>
                      {getVersionType(item.status)}
                    </div>
                    <div
                      className={styles['script-card-content-item-title-right']}
                    >
                      <Button
                        style={{ marginRight: 8 }}
                        className={styles['script-card-content-item-title-btn']}
                        icon={<IconCopy />}
                        onClick={() => {
                          onToScriptList('files');
                        }}
                      >
                        详情
                      </Button>
                      <Popover
                        content={
                          item?.version_type === VersionType.SCHEDULED
                            ? '调度中的脚本不可删除'
                            : ''
                        }
                      >
                        <Button
                          style={{
                            width: '68px',
                            height: '24px',
                            padding: '0px 8px'
                          }}
                          className={
                            styles['script-card-content-item-title-btns']
                          }
                          icon={<IconDelete />}
                          disabled={item.version_type === VersionType.SCHEDULED}
                          onClick={() =>
                            deleteScript(item.script_id, item.status)
                          }
                        >
                          删除
                        </Button>
                      </Popover>
                    </div>
                  </div>
                  <div className={styles['script-card-content-item-content']}>
                    {item?.script_context || ''}
                  </div>
                </div>
              ))
            : noDataElement({
                description: '暂无数据'
              })}
        </div>
      </Spin>
      {scriptCardList?.length > 0 && (
        <Pagination
          style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onChange={(current, pageSize) => {
            setCurrent(current);
            setPageSize(pageSize);
          }}
          total={total}
          showTotal
          showJumper
        />
      )}
    </div>
  );
};
export default ScriptCard;
