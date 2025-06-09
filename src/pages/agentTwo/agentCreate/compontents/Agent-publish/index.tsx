import { Button, InputTag } from '@arco-design/web-react';
import { IconArrowRight } from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useRef, useState } from 'react';
import EditorialPublishing from './EditorialPublishing/index';
import { useHistory } from 'react-router-dom';
import './index.css';
declare module '@arco-design/web-react' {
  interface InputTagProps<T> {
    maxTagCount?: number | 'responsive';
  }
}
function Agentpublish() {
  const history = useHistory();
  const childRef: any = useRef();
  const [loading1, setLoading1] = useState(false);
  const [typebutton, settypebutton] = useState('2');
  const [typeframe, settypeframe] = useState('1');
  const funcEditPublishing = () => {
    childRef.current.openEditFrom();
  };
  function onClickBtn1() {
    setLoading1(true);
    setTimeout(() => {
      setLoading1(false);
    }, 4000);
  }
  const funCreateApi = () => {
    const path = `/tenant/compute/appforge/apiKey`;
    history.push(path);
  };
  const qwe = () => {
    if (typebutton == '1') {
      console.log(123);
    }
  };
  return (
    <div className="publish p-5">
      {typebutton == '1' ? (
        <div className="flex flex-col">
          <div className=" font-[PingFang  SC] flex items-center text-[12px] font-normal">
            最新发布
          </div>
          <div className=" font-[PingFang SC] flex items-center text-[14px] font-medium leading-[22px]">
            2025/05/05 05:05:05
          </div>
        </div>
      ) : (
        <div>当前草稿未发布</div>
      )}
      <div className="mt-[8px] flex flex-col pb-[16px]">
        <Button
          className="h-[32px] w-[280px]"
          type="primary"
          loading={loading1}
          onClick={onClickBtn1}
        >
          {typebutton == '1' ? '更新' : null}发布
        </Button>
      </div>
      <div className={`${typebutton == '1' ? '' : 'opacity-50'}`}>
        <div
          className={`flex flex-col border-b border-t border-[#cbd5e1] py-4 `}
        >
          <div className="flex justify-between ">
            <div className="font-[PingFang SC] flex items-center text-[16px] font-medium">
              体验应用
            </div>
            <div
              className={`font-[PingFang SC] flex  items-center text-[12px] font-medium ${typebutton == '1' ? 'cursor-pointer ' : 'cursor-not-allowed '}`}
              onClick={qwe}
            >
              去体验
              <IconArrowRight />
            </div>
          </div>
        </div>
        <div className="flex flex-col ">
          <div className="flex justify-between  pb-[12px] pt-[16px]">
            <div className="font-[PingFang SC] flex items-center text-[16px] font-medium">
              API调用
            </div>
            <div className="font-[PingFang SC] flex cursor-pointer items-center text-[12px] font-medium">
              调用说明
              <IconArrowRight />
            </div>
          </div>
          <div
            className={`flex justify-between  ${typeframe == '1' ? '' : 'pb-[12px]'}`}
          >
            <div className="font-[PingFang SC] flex items-center text-[16px] font-medium">
              应用广场
            </div>
            <div className="font-[PingFang SC] flex cursor-pointer items-center text-[12px] font-medium">
              {typeframe == '1' ? '上架' : '下架'}
            </div>
          </div>
          {typeframe !== '1' ? (
            <div>
              <div className=" flex h-[28px] items-center">
                <div className="font-[PingFang SC] w-[30px] text-[14px] font-normal">
                  类型
                </div>{' '}
                <div className="flex-1">
                  {' '}
                  <InputTag
                    placeholder="Please input"
                    defaultValue={['1', '2', '3', '4', '5']}
                    maxTagCount={1}
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
              <div className=" flex h-[28px] items-center">
                <div className="font-[PingFang SC] w-[30px] text-[14px] font-normal">
                  范围
                </div>{' '}
                <div className="flex-1">
                  {' '}
                  <InputTag
                    placeholder="Please input"
                    defaultValue={['1', '2', '3', '4', '5']}
                    maxTagCount={1 as number} // 强制转换
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
              <div className="flex justify-between ">
                <Button
                  className="mt-[12px] h-[32px] flex-1 "
                  type="outline"
                  onClick={funcEditPublishing}
                >
                  更改配置
                </Button>
                {/* {typebutton == '1' ? <div className="w-[8px]"></div> : null}
          {typebutton == '1' ? (
            <Button className="mt-[12px] h-[32px] flex-1" type="outline">
              {typeframe == '1' ? '上架' : '下架'}
            </Button>
          ) : null} */}
              </div>
            </div>
          ) : null}
        </div>
        <EditorialPublishing ref={childRef}></EditorialPublishing>
      </div>
    </div>
  );
}
export default observer(Agentpublish);
