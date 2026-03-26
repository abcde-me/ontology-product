import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';
import { cloneDeep, isNil } from 'lodash-es';
import {
  batchGetExecuteTestLog,
  stopTestFunction,
  testFunction
} from '@/api/ontologySceneLibrary/ontologyFunction';
import { TestFunction } from '@/pages/ontologyScene/types/ontologyFunction';
import { Message } from '@arco-design/web-react';

export interface RunStatus {
  // 初始化，运行中，成功，失败，KILL
  run_status: 0 | 1 | 2 | 3 | 4;
  runLog:
    | (Partial<BehaviorLogItem> & Pick<BehaviorLogItem, 'run_status'>)[]
    | BehaviorLogItem[];
}

export interface TestFunctionInfo {
  // 运行详情
  runLog: RunStatus;
  // 是否正在测试中
  testIng: boolean;
  // 开始测试
  startTest: (data: TestFunction) => void;
  // 停止测试
  stopTest: () => void;
  // 清空数据
  clear: () => void;
  // 加载中
  loading: boolean;
}

const DefaultRunStatus: RunStatus = {
  run_status: 0,
  runLog: []
};

const useTestFunction = (): TestFunctionInfo => {
  const { id: OSid } = useParams<Record<string, string>>();
  const [runningLog, setRunningLog] = useState<React.Key[]>();
  // 正在请求接口
  const [loading, setLoading] = useState<boolean>(false);

  const [runLogInfo, setRunLogInfo] = useState<RunStatus>(DefaultRunStatus);

  const { run: getRunLogs, cancel: cancelGetRunLogs } = useRequest(
    () => {
      return batchGetExecuteTestLog(runningLog).then((res) => {
        if (res.message !== 'ok') {
          return Promise.reject(res.message);
        }
        return res.data as BehaviorLogItem[];
      });
    },
    {
      refreshDeps: [runningLog, runLogInfo],
      manual: true,
      pollingInterval: 3000,
      ready: !!runningLog?.length,
      onSuccess(res: BehaviorLogItem[]) {
        setRunLogInfo(buildRunLog(res));
        const running = res.some(({ run_status }) => run_status === 1);
        const fail = res.some(({ run_status }) => run_status === 3);
        const kill = res.some(({ run_status }) => run_status === 4);
        if (!running) {
          cancelGetRunLogs();
          setLoading(false);
        }
        setRunLogInfo({
          run_status: running ? 1 : fail ? 3 : kill ? 4 : 2,
          runLog: res.map(({ run_status, run_log, ...other }) => {
            return {
              ...other,
              run_status,
              run_log: run_status === 4 ? '已被手动停止' : run_log
            };
          })
        });
      },
      onError(e) {
        setRunLogInfo({
          run_status: 4,
          runLog: runLogInfo.runLog?.map((log) => {
            return {
              ...log,
              run_status: 4,
              run_log: e.message
            };
          })
        });
        cancelGetRunLogs();
        setLoading(false);
      }
    }
  );

  const { run, cancel } = useRequest(
    (data: TestFunction) => {
      return testFunction(data).then((res) => {
        if (res.message !== 'ok') {
          return Promise.reject(res.message);
        }
        return res.data;
      });
    },
    {
      manual: true,
      onSuccess(data: BehaviorLogItem[]) {
        setRunningLog(data.map(({ id }) => id));
        setRunLogInfo(buildRunLog(data));
        getRunLogs();
      },
      onError(e) {
        Message.error(e.message);
        setLoading(false);
        setRunLogInfo({
          run_status: 4,
          runLog: [
            {
              run_status: 4,
              run_log: e.message
            }
          ]
        });
      }
    }
  );

  const buildRunLog = (data: BehaviorLogItem[]): RunStatus => {
    const res = cloneDeep(DefaultRunStatus);
    res.runLog = data;
    const testing = data.some(({ run_status }) => run_status === 1);
    const fail = data.some(({ run_status }) => run_status === 3);
    res.run_status = testing ? 1 : fail ? 3 : 2;
    return res;
  };

  const initTestRunLog = (data: TestFunction): RunStatus => {
    const { list_data } = data;
    return {
      run_status: 1,
      runLog: list_data.map((item) => {
        return {
          pk: item.pk,
          run_status: 1
        };
      })
    };
  };

  const handelTestFunction = (functionTest: TestFunction) => {
    setLoading(true);
    setRunLogInfo(initTestRunLog(functionTest));
    run({ ...functionTest, id: +OSid });
  };

  const handelStopTestFunction = () => {
    stopTestFunction(runningLog?.[0]).then((res) => {
      cancelGetRunLogs();
      getRunLogs();
    });
  };

  return {
    // 运行详情
    runLog: runLogInfo,
    // 是否正在测试中
    testIng: loading,
    // 开始测试
    startTest: handelTestFunction,
    // 停止测试
    stopTest: handelStopTestFunction,
    // 加载中
    loading,
    clear: () => {
      cancel();
      cancelGetRunLogs();
      setRunLogInfo(DefaultRunStatus);
      setLoading(false);
    }
  };
};
export default useTestFunction;
