import React from 'react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import DZY from './DZY.png'
export default function AgentHeader(props) {
  return (
    <div>
      <div className="h-[72px] pt-4 pr-3 pb-4 pl-3 gap-[10px] flex items-center">
        <div className='w-[904px] h-fit flex items-center gap-3'>
          <div>
          <IconArrowLeft />
          </div>
          <img src={DZY} alt="" style={{borderRadius:'10px',marginLeft:'5px'}} />
          <p className='font-[PingFang-SC] font-medium text-base leading-6 tracking-normal' >
            电子云小助手
          </p>
          <div className='w-fit h-5 rounded-[2px] py-[3px] px-[8px] gap-1 flex items-center' style={{backgroundColor:'#F2F3F5'}}>
            <span className='font-[PingFang-SC] font-normal text-xs leading-5 tracking-normal'>
              效率工具
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
