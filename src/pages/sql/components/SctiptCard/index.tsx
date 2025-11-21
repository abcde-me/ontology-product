import React, { useEffect, useState } from 'react';
import { Form, Input } from '@arco-design/web-react';
import { getWorkflowList } from '@/api/workflowList';
import { useUserInfo } from '@/store/userInfoStore';
import styles from './index.module.scss';

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

  const getCardList = async () => {
    setLoading(true);
    try {
      const params: any = {
        uid: userInfo?.id,
        search_content: searchValue,
        page: current, //第几页
        page_size: pageSize //每页个数
      };
      const res = await getWorkflowList(params);
      if (res.status === 200 && res.data) {
        setWorkflowData(res.data.list);
        setCurrent(res.data.page_info?.page);
        setPageSize(res.data.page_info?.page_size);
        setTotal(res.data.page_info?.total || 10);
      }
    } finally {
      setLoading(false);
    }
  };

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
        <Form autoComplete="off" layout="inline">
          <FormItem label={null}>
            <Input
              style={{ width: '100%' }}
              placeholder="请输入脚本内容关键词"
            />
          </FormItem>
        </Form>
      </div>
      <div className={styles['script-card-content']}>
        <div className={styles['script-card-content-item']}>
          <div className={styles['script-card-content-item-title']}>
            <div className={styles['script-card-content-item-title-text']}>
              脚本名称
            </div>
            <div className={styles['script-card-content-item-title-icon']}>
              <div
                className={styles['script-card-content-item-title-icon-item']}
              />
              <div className={styles['script-card-content-item-title-text']}>
                已发版
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScriptCard;
