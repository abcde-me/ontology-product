import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Pagination } from '@arco-design/web-react';
import { getWorkflowList } from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import Mock from 'mockjs';
import styles from './index.module.scss';
import { IconCopy, IconDelete } from '@arco-design/web-react/icon';
import { mock } from 'node:test';

// 版本类型 已发版 未发版 调度中
export const VersionType = {
  RELEASED: 'released', // 已发版
  UNRELEASED: 'unreleased', // 未发版
  SCHEDULED: 'scheduled' // 调度中
} as const;

export enum VersionTypeEnum {
  RELEASED = '已发版',
  UNRELEASED = '未发版',
  SCHEDULED = '调度中'
}

const ScriptCard: React.FC = () => {
  const FormItem = Form.Item;
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
        title: '@ctitle(5,10)',
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
  }, [isClickClear]);

  const getCardList = () => {
    setLoading(true);
    try {
      const params: any = {
        uid: userInfo?.id,
        search_content: searchValue,
        page: current, //第几页
        page_size: pageSize //每页个数
      };
      // const res = await getWorkflowList(params);
    } finally {
      setLoading(false);
    }
  };

  //

  // 删除卡片脚本
  const deleteScript = async (id: string) => {
    // history.push(
    //     `/tenant/compute/modaforge/dataCatalog/list?root_type=${root_type}&id=${id}&parent_id=${parent_id}`
    // );
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
        <Input style={{ width: '100%' }} placeholder="请输入脚本内容关键词" />
      </div>
      <div className={styles['script-card-content']}>
        {mockjsData.list.map((item) => (
          <div key={item.id} className={styles['script-card-content-item']}>
            <div className={styles['script-card-content-item-title']}>
              <div className={styles['script-card-content-item-title-left']}>
                <div className={styles['script-card-content-item-title-text']}>
                  <span>{item.title}</span>
                  <span>(V{item.version})</span>
                </div>
                {getVersionType(item.version_type)}
              </div>
              <div className={styles['script-card-content-item-title-right']}>
                <Button
                  style={{ marginRight: 8 }}
                  className={styles['script-card-content-item-title-btn']}
                  icon={<IconCopy />}
                >
                  详情
                </Button>
                <Button
                  className={styles['script-card-content-item-title-btn']}
                  icon={<IconDelete />}
                >
                  删除
                </Button>
              </div>
            </div>
            <div className={styles['script-card-content-item-content']}>
              {item.content}
            </div>
          </div>
        ))}
      </div>
      <Pagination total={total} showTotal showJumper />
    </div>
  );
};
export default ScriptCard;
