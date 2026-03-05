import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';
import { isNil } from 'lodash-es';
import { testFunction } from '@/api/ontologySceneLibrary/ontologyFunction';
import { TestFunction } from '@/pages/ontologyScene/types/ontologyFunction';

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
  // 正在请求接口
  const [loading, setLoading] = useState<boolean>(false);

  const [runLogInfo, setRunLogInfo] = useState<RunStatus>(DefaultRunStatus);

  const { run, cancel } = useRequest(
    (data: TestFunction) => {
      return testFunction(data);
    },
    {
      manual: true,
      onSuccess(data: BehaviorLogItem[]) {
        if (isNil(data))
          return setRunLogInfo({
            run_status: 2,
            runLog: []
          });
        setRunLogInfo(buildRunLog(data));
        setLoading(false);
      }
    }
  );

  const buildRunLog = (data: BehaviorLogItem[]): RunStatus => {
    const res = DefaultRunStatus;
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
    cancel();
    setRunLogInfo((p) => {
      return {
        run_status: 4,
        runLog: p.runLog.map((item) => {
          return {
            ...item,
            run_status: 4,
            run_log: '停止运行'
          };
        })
      };
    });
    setLoading(false);
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
      setRunLogInfo(DefaultRunStatus);
      setLoading(false);
    }
  };
};
export default useTestFunction;
