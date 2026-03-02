import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getBehaviorLogDetail } from '@/api/behaviorTest';
import { BehaviorLogItem } from '@/pages/ontologyScene/modules/behaviorLog/types';
import { isNil } from 'lodash-es';
import {
  stopTestFunction,
  testFunction
} from '@/api/ontologySceneLibrary/ontologyFunction';
import { TestFunction } from '@/pages/ontologyScene/types/ontologyFunction';

export interface TestFunctionInfo {
  // 运行详情
  runLog?: BehaviorLogItem;
  // 是否正在测试中
  testIng: boolean;
  // 开始测试
  startTest: (data: TestFunction) => void;
  // 停止测试
  stopTest: () => void;
  // 加载中
  loading: boolean;
}

const useTestFunction = (): TestFunctionInfo => {
  const { id: OSid } = useParams<Record<string, string>>();
  // 是否正在测试
  const [testIng, setTestIng] = useState(false);
  // 正在测试的函数 id
  const [testingFunction, setTestingFunction] = useState<number>();
  // 正在请求接口时，不允许再次点击测试
  const [loading, setLoading] = useState<boolean>(false);

  const [runLogInfo, setRunLogInfo] = useState<BehaviorLogItem>();

  const handelTestFunction = (functionTest: TestFunction) => {
    setLoading(true);
    setRunLogInfo(undefined);
    testFunction({ ...functionTest, id: +OSid }).then((res) => {
      if (isNil(res)) return;
      setTestingFunction(res);
      setTestIng(true);
      setLoading(false);
    });
  };

  const handelStopTestFunction = useCallback(() => {
    setLoading(true);
    stopTestFunction(testingFunction);
  }, [testingFunction]);

  // 轮询获取运行详情
  const { cancel } = useRequest(
    () => {
      return getBehaviorLogDetail({ id: testingFunction! }).then((res) => {
        return res.data as BehaviorLogItem;
      });
    },
    {
      ready: !isNil(testingFunction),
      pollingInterval: 3000,
      refreshDeps: [testingFunction],
      onSuccess(data: BehaviorLogItem) {
        // 不是运行中时，取消轮询
        if (data.run_status !== 1) {
          cancel();
        }
        setLoading(false);
        setTestIng(data.run_status === 1);
        setRunLogInfo(data);
      }
    }
  );
  return {
    // 运行详情
    runLog: runLogInfo,
    // 是否正在测试中
    testIng,
    // 开始测试
    startTest: handelTestFunction,
    // 停止测试
    stopTest: handelStopTestFunction,
    // 加载中
    loading
  };
};
export default useTestFunction;
