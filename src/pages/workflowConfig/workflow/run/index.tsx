import type { FC } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useContext } from 'use-context-selector';
import { useTranslation } from 'react-i18next';
import OutputPanel from './output-panel';
import ResultPanel from './result-panel';
import TracingPanel from './tracing-panel';
import cn from '@/pages/workflowConfig/utils/classnames';
import { ToastContext } from '@/pages/workflowConfig/components/toast';
import Loading from '@/pages/workflowConfig/components/loading';
// import { fetchRunDetail, fetchTracingList } from '@/service/log'
import type { NodeTracing } from '@/pages/workflowConfig/types/workflow';
import type { WorkflowRunDetailResponse } from '@/pages/workflowConfig/models/log';
import { useStore as useAppStore } from '@/pages/workflowConfig/app/store';
export type RunProps = {
  hideResult?: boolean;
  activeTab?: 'RESULT' | 'DETAIL' | 'TRACING';
  runID: string;
  getResultCallback?: (result: WorkflowRunDetailResponse) => void;
};

const RunPanel: FC<RunProps> = ({
  hideResult,
  activeTab = 'RESULT',
  runID,
  getResultCallback
}) => {
  const { t } = useTranslation('plugin__console-plugin-appforge');
  const { notify } = useContext(ToastContext);
  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const appDetail = useAppStore((state) => state.appDetail);
  const [loading, setLoading] = useState<boolean>(true);
  const [runDetail, setRunDetail] = useState<WorkflowRunDetailResponse>();
  const [list, setList] = useState<NodeTracing[]>([]);

  const executor = useMemo(() => {
    if (runDetail?.created_by_role === 'account')
      return runDetail.created_by_account?.name || '';
    if (runDetail?.created_by_role === 'end_user')
      return runDetail.created_by_end_user?.session_id || '';
    return 'N/A';
  }, [runDetail]);

  const getResult = useCallback(
    (appID: string, runID: string) => {
      try {
        console.warn('API NOT IMPLEMENTED', 'fetchRunDetail');
        // const res = await fetchRunDetail({
        //   appID,
        //   runID,
        // })
        const res = {} as any;
        setRunDetail(res);
        if (getResultCallback) getResultCallback(res);
      } catch (err) {
        notify({
          type: 'error',
          message: `${err}`
        });
      }
    },
    [notify, getResultCallback]
  );

  const getTracingList = useCallback(
    (appID: string, runID: string) => {
      try {
        console.warn('API NOT IMPLEMENTED', 'fetchTracingList');
        // const { data: nodeList } = await fetchTracingList({
        //   url: `/apps/${appID}/workflow-runs/${runID}/node-executions`,
        // })
        const nodeList = [] as any;
        setList(nodeList);
      } catch (err) {
        notify({
          type: 'error',
          message: `${err}`
        });
      }
    },
    [notify]
  );

  const getData = (appID: string, runID: string) => {
    setLoading(true);
    getResult(appID, runID);
    getTracingList(appID, runID);
    setLoading(false);
  };

  const switchTab = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'RESULT') appDetail?.id && getResult(appDetail.id, runID);
    appDetail?.id && getTracingList(appDetail.id, runID);
  };

  useEffect(() => {
    // fetch data
    if (appDetail && runID) getData(appDetail.id, runID);
  }, [appDetail, runID]);

  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const adjustResultHeight = () => {
    if (ref.current) setHeight(ref.current?.clientHeight - 16 - 16 - 2 - 1);
  };

  useEffect(() => {
    adjustResultHeight();
  }, [loading]);

  return (
    <div className="relative flex grow flex-col">
      {/* tab */}
      <div className="flex shrink-0 items-center border-b-[0.5px] border-divider-subtle px-4">
        {!hideResult && (
          <div
            className={cn(
              'system-sm-semibold-uppercase mr-6 cursor-pointer border-b-2 border-transparent py-3 text-text-tertiary',
              currentTab === 'RESULT' &&
                '!border-util-colors-blue-brand-blue-brand-600 text-text-primary'
            )}
            onClick={() => switchTab('RESULT')}
          >
            {t('runLog.result')}
          </div>
        )}
        <div
          className={cn(
            'system-sm-semibold-uppercase mr-6 cursor-pointer border-b-2 border-transparent py-3 text-text-tertiary',
            currentTab === 'DETAIL' &&
              '!border-util-colors-blue-brand-blue-brand-600 text-text-primary'
          )}
          onClick={() => switchTab('DETAIL')}
        >
          {t('runLog.detail')}
        </div>
        <div
          className={cn(
            'system-sm-semibold-uppercase mr-6 cursor-pointer border-b-2 border-transparent py-3 text-text-tertiary',
            currentTab === 'TRACING' &&
              '!border-util-colors-blue-brand-blue-brand-600 text-text-primary'
          )}
          onClick={() => switchTab('TRACING')}
        >
          过程日志
        </div>
      </div>
      {/* panel detail */}
      <div
        ref={ref}
        className={cn(
          'relative h-0 grow overflow-y-auto rounded-b-2xl bg-components-panel-bg'
        )}
      >
        {loading && (
          <div className="flex h-full items-center justify-center bg-components-panel-bg">
            <Loading />
          </div>
        )}
        {!loading && currentTab === 'RESULT' && runDetail && (
          <OutputPanel
            outputs={runDetail.outputs}
            error={runDetail.error}
            height={height}
          />
        )}
        {!loading && currentTab === 'DETAIL' && runDetail && (
          <ResultPanel
            inputs={runDetail.inputs}
            outputs={runDetail.outputs}
            status={runDetail.status}
            error={runDetail.error}
            elapsed_time={runDetail.elapsed_time}
            total_tokens={runDetail.total_tokens}
            created_at={runDetail.created_at}
            created_by={executor}
            steps={runDetail.total_steps}
            exceptionCounts={runDetail.exceptions_count}
          />
        )}
        {!loading && currentTab === 'TRACING' && (
          <TracingPanel className="bg-background-section-burn" list={list} />
        )}
      </div>
    </div>
  );
};

export default RunPanel;
