import React, { useCallback, useEffect, useState } from 'react';
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
import { useUrlState } from '@/pages/sql/hooks/useUrlState';
import Mock from 'mockjs';
import styles from './index.module.scss';
import { IconCopy, IconDelete, IconSearch } from '@arco-design/web-react/icon';
import {
  deleteDevelopScriptLogByVersion,
  getDevelopScriptLogByVersion,
  listDevelopScriptLogByKeyApi
} from '@/api/sql-develop';
import noDataElement from '@/components/no-data';
import {
  ScriptStatus,
  ScriptStatusName,
  ListDevelopScriptLogByKeyItem
} from '@/types/sqlDevelopApi';
import VersionStatus from '../version-status';

// 版本类型 已发版 未发版 调度中
// 注意：0（编辑中）和 1（编辑完成）都代表"未发版"，但为了兼容现有代码，这里保留 1 作为 UNRELEASED 的值
export const VersionType = {
  RELEASED: ScriptStatus.Released, // 2 - 已发版
  UNRELEASED: ScriptStatus.EditCompleted, // 1 - 未发版（编辑完成），0（编辑中）也属于未发版
  SCHEDULED: ScriptStatus.Scheduling // 3 - 调度中
} as const;

export enum VersionTypeEnum {
  RELEASED = '已发版',
  UNRELEASED = '未发版',
  SCHEDULED = '调度中'
}

/**
 * 判断状态是否为"未发版"
 * 0（编辑中）和 1（编辑完成）都代表"未发版"
 */
export const isUnreleasedStatus = (status: number): boolean => {
  return (
    status === ScriptStatus.Editing || status === ScriptStatus.EditCompleted
  );
};

interface ScriptCardProps {
  onToScriptList: (type: string) => void;
  onTotalChange?: (total: number) => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({
  onToScriptList,
  onTotalChange
}) => {
  const userInfo = useUserInfo();
  const { updateUrlState } = useUrlState();
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
  const [scriptCardList, setScriptCardList] = useState<
    ListDevelopScriptLogByKeyItem[]
  >([]);
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
  // useEffect(() => {
  //   if (isClickClear && searchValue === '') {
  //     getCardList();
  //     setIsClickClear(false);
  //   }
  // }, [isClickClear, searchValue]);

  const getCardList = async (searchText?: string) => {
    setLoading(true);
    try {
      const params = {
        script_context: searchText !== undefined ? searchText : searchValue,
        page: current,
        page_size: pageSize
      };
      const res = await listDevelopScriptLogByKeyApi(params);
      if (res.status !== 200) {
        Message.error(res?.message);
        setScriptCardList([]);
        setTotal(0);
        onTotalChange?.(0);
        return;
      }
      const newTotal = res.data?.total || 0;
      console.log(res.data?.items, '123');
      setScriptCardList(res.data?.items || []);
      setTotal(newTotal);
      onTotalChange?.(newTotal);
    } finally {
      setLoading(false);
    }
  };

  //

  // 删除卡片脚本
  const deleteScript = (id: number, type: number) => {
    console.log(type, '123');
    // 0（编辑中）和 1（编辑完成）都代表"未发版"
    if (isUnreleasedStatus(type)) {
      Message.error('未发版的脚本不能删除');
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

  const handleToDetail = (scriptId: number | string) => {
    updateUrlState(
      {
        activeTab: 'files',
        activeDevelopScriptId: String(scriptId)
      },
      { method: 'push' }
    );
  };

  // 查询脚本卡片列表
  const onToSearchScriptList = async () => {
    try {
      const res = await getDevelopScriptLogByVersion({
        script_context: searchValue
      });
      if (res.status === 200) {
        const newTotal = res.data?.total || 0;
        setScriptCardList(res.data?.items || []);
        setTotal(newTotal);
        onTotalChange?.(newTotal);
      } else {
        setScriptCardList([]);
        setTotal(0);
        Message.error(res?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 高亮显示搜索关键词
  const highlightSearchKeyword = useCallback(
    (text: string, keyword: string) => {
      if (!keyword.trim()) return text;

      const lowerText = text.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      const index = lowerText.indexOf(lowerKeyword);

      if (index === -1) return text;

      const prefix = text.substring(0, index);
      const matchedText = text.substring(index, index + keyword.length);
      const suffix = text.substring(index + keyword.length);

      return (
        <span>
          {prefix}
          <span
            style={{
              color: '#007DFA'
            }}
          >
            {matchedText}
          </span>
          {suffix}
        </span>
      );
    },
    []
  );

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
            setSearchValue('');
            getCardList('');
          }}
          onChange={(value) => {
            setSearchValue(value);
          }}
          onPressEnter={() => {
            getCardList();
          }}
          suffix={
            <IconSearch
              style={{ cursor: 'pointer' }}
              onClick={() => {
                getCardList();
              }}
            />
          }
          style={{ width: '100%' }}
          placeholder="请输入脚本内容关键词"
        />
      </div>
      <Spin loading={loading} style={{ width: '100%' }}>
        <div className={styles['script-card-content']}>
          {scriptCardList?.length > 0
            ? scriptCardList.map((item) => (
                <div
                  key={`${item.script_id}${item.version}`}
                  className={styles['script-card-content-item']}
                >
                  <div className={styles['script-card-content-item-title']}>
                    <div
                      className={styles['script-card-content-item-title-left']}
                    >
                      <div
                        onClick={() => {
                          handleToDetail(item.script_id);
                        }}
                        className={
                          styles['script-card-content-item-title-text']
                        }
                      >
                        <span>{item?.script_name || ''}</span>
                        <span>({item.version_name})</span>
                      </div>
                      <VersionStatus status={item.status} />
                    </div>
                    <div
                      className={styles['script-card-content-item-title-right']}
                    >
                      <Button
                        style={{ marginRight: 8 }}
                        className={styles['script-card-content-item-title-btn']}
                        icon={<IconCopy />}
                        onClick={() => {
                          updateUrlState(
                            {
                              activeTab: 'files',
                              activeDevelopScriptId: String(item.script_id)
                            },
                            { method: 'push' }
                          );
                        }}
                      >
                        详情
                      </Button>
                      <Popover
                        content={
                          item?.status === VersionType.SCHEDULED
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
                          disabled={item.status === VersionType.SCHEDULED}
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
                    {highlightSearchKeyword(
                      item?.script_context || '',
                      searchValue
                    )}
                  </div>
                </div>
              ))
            : noDataElement({
                description: '暂无数据'
              })}
        </div>
      </Spin>
      {total > pageSize && (
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
          sizeOptions={[10, 20, 50, 100]}
          showTotal
          sizeCanChange
          showJumper
        />
      )}
    </div>
  );
};
export default ScriptCard;
