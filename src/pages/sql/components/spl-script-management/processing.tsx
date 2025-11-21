import React, { memo } from 'react';
import style from './processing.module.scss';
import { Button } from '@arco-design/web-react';
import { RadioGroup } from '@headlessui/react';
import { IconApps, IconInteraction } from '@arco-design/web-react/icon';
import ViewToggle, { ViewType } from '../ViewToggle';
import ScriptTable from '../SctiptTable';
import ScriptCard from '../SctiptCard';
const Processing: React.FC = memo(() => {
  const [processingNum, setProcessingNum] = React.useState<number>(100);
  const [iconActive, setIconActive] = React.useState<ViewType>(ViewType.LIST); // table表示表格，card表示卡片
  return (
    <div className={style['processing-wrapper']}>
      {/* 头部操作按钮 */}
      <div className={style['processing-header']}>
        <div className={style['processing-header-title']}>
          加工脚本({processingNum})
        </div>
        <div className={style['processing-header-icons-group']}>
          {iconActive === ViewType.TABLE && (
            <Button className={style['header-btn']}>下载全部</Button>
          )}
          <Button className={style['header-btn']}>新建脚本</Button>
          <ViewToggle
            className={style['processing-header-icons-options']}
            value={iconActive}
            onChange={setIconActive}
          />
        </div>
      </div>
      <div className={style['processing-content']}>
        {iconActive === ViewType.TABLE ? <ScriptTable /> : <ScriptCard />}
      </div>
    </div>
  );
});

export default Processing;
