import React from 'react';
import { Divider, Result } from '@arco-design/web-react';
import Nopermission from '@/assets/nopermission.svg';
/**
 * 403 无权限页面
 */
const Page403: React.FC = () => {
  return (
    <div className="m-5 flex h-[calc(100%-40px)] items-center justify-center rounded-xl bg-gray-50">
      <div className="text-center">
        <Result
          status="403"
          icon={null}
          subTitle={
            <div>
              <div style={{ height: '130px' }} className="mb-2">
                <Nopermission style={{ width: '130px', height: '130px' }} />
              </div>
              <div className="text-[20px] font-medium text-[#0F172A]">
                暂无权限
              </div>
              <div className="mb-3 mt-1 text-[14px] font-normal text-[#6E7B8D]">
                您当前没有被分配到该项目，请联系管理员获取访问权限
              </div>
              <div className="flex items-center justify-center text-[14px] font-normal leading-[22px] text-[var(--color-text-1)]">
                <div>姓名：张三</div>
                <Divider type="vertical" className="mx-2 h-[14px]" />
                <div>电话：13812345678</div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Page403;
