import React, { useEffect, useState } from 'react';
import './index.less';
import {
  IconDriveFile,
  IconEdit,
  IconLeft,
  IconMore
} from '@arco-design/web-react/icon';
import { Radio, Tooltip } from '@arco-design/web-react';
import BaseListIcon from '@/assets/baselist.png';
import { useHistory } from 'react-router-dom';
import brother from '../brother';
import { formatNumber } from '@/utils/format';
function Header(props) {
  const history = useHistory();
  const { selectedValue, onSelectedValueChange, detailsdata } = props;
  const { name, size, updated_at, document_count } = detailsdata;
  const RadioGroup = Radio.Group;

  const handleChange = (event) => {
    const newValue = event;
    onSelectedValueChange(newValue);
  };
  const backRouter = () => {
    history.push(`/tenant/compute/appforge/knowledge`);
  };
  const editFuncHeader = () => {};
  const timeFunc = (tm) => {
    const date = new Date(tm);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
  };
  const editFuncFrom = () => {
    brother.emit('editFuncFrom');
  };
  return (
    <div className="configurationPage-header">
      <div className="box-one">
        <div className="left-one" onClick={backRouter}>
          <IconLeft className="h-4 w-4" />
        </div>
        <div className="left-two">
          <img src={BaseListIcon} alt="" />
        </div>
        <div className="left-three">
          <div className="left-top">
            <Tooltip position="bottom" trigger="hover" content={name}>
              <div className="left-top-name max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap  leading-[20px]">
                {name}
              </div>
            </Tooltip>
            <div className="left-top-icon" onClick={editFuncFrom}>
              <IconEdit onClick={editFuncHeader} />
            </div>
          </div>
          <div className="left-buttom">
            <div className="min-box">
              {document_count ? document_count : 0}个
            </div>

            <div className="min-box">
              {size
                ? size > 1000
                  ? `${formatNumber((size / 1000).toFixed(1))}K`
                  : `${size}KB`
                : '--'}
            </div>
            <div className="min-box">自动保存于 {timeFunc(updated_at)}</div>
          </div>
        </div>
      </div>
      <div className="box-two">
        <RadioGroup
          size="small"
          type="button"
          name="lang"
          defaultValue="true"
          value={selectedValue}
          onChange={handleChange}
        >
          <Radio value="true">文件分段</Radio>
          <Radio value="false">命中测试</Radio>
        </RadioGroup>
      </div>
      <div className="box-three"></div>
    </div>
  );
}
export default Header;
