import React from 'react';
import { Result } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';

/**
 * 403 无权限页面
 */
export const Page403: React.FC = () => {
  const history = useHistory();

  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <Result
          status="403"
          title="403"
          subTitle={
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-700">
                抱歉，您没有权限访问此页面
              </div>
              <div className="text-sm text-gray-500">
                请联系管理员获取相应权限，或返回其他页面
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Page403;
