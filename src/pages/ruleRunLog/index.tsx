import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { SearchTable } from '@ceai-front/arco-material';
import { Form, Input, Radio } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useArcoTable } from '@/hooks';
import { AutoExecLogItem, AutoExecLogTodayStats } from './types';
import {
  fetchRuleRunLogDetail,
  fetchRuleRunLogList,
  fetchRuleRunLogTodayStats
} from './services';
import { Order } from '@/api/businessAutomation/runLog';
import { LogDetailDrawer, StatsCard } from './components';
import { useColumns } from './hooks/useColumns';
import { AutoRuleDrawer } from '@/pages/ruleManagement/components';
import { BehaviorDetail } from '@/pages/ontologyScene/modules/behaviorActions/components';
import { getTimeRange, TimeRange } from './utils/timeRange';
import styles from './index.module.scss';
import totalIcon from './assets/total.svg';
import successIcon from './assets/success.svg';
import failedIcon from './assets/failed.svg';
import { set } from 'immer/dist/internal';

const RuleRunLog = () => {
  const [form] = Form.useForm();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [stats, setStats] = useState<AutoExecLogTodayStats>({});
  const [showRule, setShowRule] = useState<{
    mode?: 'view' | 'snapshot';
    ruleId?: number;
  }>();
  const [behaviorData, setBehaviorData] = useState<number | undefined>();
  const [logRecord, setLogRecord] = useState<AutoExecLogItem | undefined>();

  const openActionByLog = async (record: AutoExecLogItem) => {
    if (!record?.id) return;
    try {
      const detail = await fetchRuleRunLogDetail(record.id);
      const actionId = detail?.ruleSnapshot?.actionConfig?.actionId;
      if (actionId) {
        setBehaviorData(actionId);
      }
    } catch (error) {
      console.error('获取行为信息失败:', error);
    }
  };

  useEffect(() => {
    let active = true;
    fetchRuleRunLogTodayStats()
      .then((data) => {
        if (active) {
          setStats(data || {});
        }
      })
      .catch((error) => {
        console.error('获取今日统计失败:', error);
      });
    return () => {
      active = false;
    };
  }, []);

  const columns = useColumns({
    actionClassName: styles['table-action'],
    onViewLog: (record) => {
      setLogRecord(record);
    },
    onViewSnapshot: (record) => {
      setShowRule(
        record
          ? {
              mode: 'snapshot',
              ruleId: record.id
            }
          : undefined
      );
    },

    onViewRule: (record) => {
      setShowRule(
        record
          ? {
              ruleId: record.ruleId
            }
          : undefined
      );
    },
    onViewAction: (record) => {
      openActionByLog(record);
    }
  });

  const { onSubmit, tableProps } = useArcoTable<AutoExecLogItem>(
    ({ pagination, sorter, filters, query }) => {
      const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      const statusList = Array.isArray(filters?.status)
        ? filters?.status
            .map((status) => Number(status))
            .filter((status) => !Number.isNaN(status)) || []
        : [];

      const queryValue = query as Record<string, any> | undefined;

      return fetchRuleRunLogList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        statusList: statusList.length ? statusList : undefined,
        orderBy: currentSorter?.field as string,
        order:
          currentSorter?.direction === 'ascend'
            ? Order.Asc
            : currentSorter?.direction === 'descend'
              ? Order.Desc
              : undefined,
        ...queryValue
      });
    },
    {
      form,
      deps: [timeRange]
    }
  );

  return (
    <div className={styles['rule-run-log']}>
      <PageHeader
        title={'执行日志'}
        subTitle={'查看规则执行记录、状态与耗时'}
        className={'flex-shrink-0'}
      />

      <div className="mt-[8px] grid grid-cols-3 gap-[16px] px-[24px]">
        {[
          { title: '今日触发', value: stats.total ?? 0, icon: totalIcon },
          { title: '今日成功', value: stats.success ?? 0, icon: successIcon },
          { title: '今日失败', value: stats.failed ?? 0, icon: failedIcon }
        ].map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      <div className={styles['rule-run-log-content']}>
        <SearchTable
          searchForm={
            <Form
              form={form}
              autoComplete={'off'}
              layout="inline"
              className="inline-flex items-center"
              initialValues={{ timeRange: 'all' }}
            >
              <Form.Item noStyle field={'filter'}>
                <Input.Search
                  className={styles['search-input']}
                  placeholder={'请输入日志id或规则名称'}
                  allowClear
                  suffix={<IconSearch />}
                  onChange={onSubmit}
                  onSearch={onSubmit}
                />
              </Form.Item>
              <div className="ml-[8px]">
                <Form.Item noStyle field={'timeRange'}>
                  <Radio.Group
                    type="button"
                    value={timeRange}
                    className="aa-radio-group-tab rule-run-log-radio"
                    onChange={(value) => {
                      // setTimeRange(value as TimeRange);
                      onSubmit();
                    }}
                    options={[
                      { label: '全部', value: 'all' },
                      { label: '今天', value: 'today' },
                      { label: '近7天', value: 'last7days' }
                    ]}
                  />
                </Form.Item>
              </div>
            </Form>
          }
          tableProps={{
            columns,
            ...tableProps,
            rowKey: (record) => record.logId || record.id || '',
            scroll: { x: true }
          }}
        />
      </div>
      <AutoRuleDrawer
        visible={!!showRule}
        onCancel={() => setShowRule(undefined)}
        {...showRule}
      />
      <BehaviorDetail
        show={!!behaviorData}
        onClose={() => {
          setBehaviorData(undefined);
        }}
        actionItem={behaviorData}
      />
      <LogDetailDrawer
        visible={!!logRecord}
        onClose={() => {
          setLogRecord(undefined);
        }}
        record={logRecord}
      />
    </div>
  );
};

export default RuleRunLog;
