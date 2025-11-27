import React, { memo } from 'react';
import style from './processing.module.scss';
import { Button } from '@arco-design/web-react';
import { RadioGroup } from '@headlessui/react';
import { IconApps, IconInteraction } from '@arco-design/web-react/icon';
import ViewToggle, { ViewType } from '../ViewToggle';
import ScriptTable from '../sctipt-table';
import ScriptCard from '../sctipt-card';

interface PaginationProps {
  onToScriptList: (type: string) => void;
}

const Processing: React.FC<PaginationProps> = memo(({ onToScriptList }) => {
  const [processingNum, setProcessingNum] = React.useState<number>(100);
  const [iconActive, setIconActive] = React.useState<ViewType>(ViewType.TABLE); // table表示表格，card表示卡片
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
          <Button
            className={style['header-btn']}
            onClick={() => {
              onToScriptList('files');
            }}
          >
            新建脚本
          </Button>
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
