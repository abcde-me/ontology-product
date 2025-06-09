import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Upload, Message, Radio, TreeSelect } from '@arco-design/web-react';
import {
  IconLeft,
  IconRight
} from '@arco-design/web-react/icon';
import { get } from 'lodash';

type CommonModalProps = {
  visible: boolean;
  setVisible: any;
  tableData: any[];
  currentItem: Record<string, any>;
};

export const ImageDetailDrawer: React.FC<CommonModalProps> = (props) => {
  const { tableData, currentItem, visible, setVisible } = props;

  const [currentIdx, setCurrentIdx] = useState(tableData.findIndex(t => t.name === currentItem.name))

  return (
    <Drawer
      width={800}
      className="image-detail-drawer"
      title={'#' + (tableData[currentIdx]?.name || "")}
      visible={visible}
      footer={null}
      onCancel={() => setVisible(false)}
    >
      <div className='nav-bar'>
        <div className='cursor-pointer'>
          <Button onClick={() => setCurrentIdx(i => i - 1)} type='text' disabled={currentIdx <= 0} icon={<IconLeft className='size-[16px] text-[#334155] mr-[12px]'/>} />
          <Button onClick={() => setCurrentIdx(i => i + 1)} type='text' disabled={currentIdx >= tableData.length - 1} icon={<IconRight className='size-[16px] text-[#334155] mr-[12px]'/>} />
        </div>
        <div className="label-info">
          <span className='labeled'>已标注</span>
          <span className='checked'>已复核</span>
          <span className='unlabeled'>未标注</span>
        </div>
      </div>
      <div className='filename mt-[16px] mb-[16px]'>{tableData[currentIdx].name}</div>
      <div className='flex justify-center'>
        <img className="img-url" src={tableData[currentIdx].url} />
      </div>
      <div className='flex justify-between items-center'>
        <span className='label-txt'>标注信息</span>
        <div>
          <Button type="outline" className="primary">智能图生文</Button>
        </div>
      </div>
    </Drawer>
  );
};
