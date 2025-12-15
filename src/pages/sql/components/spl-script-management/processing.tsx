import React, { memo, useEffect, useState } from 'react';
import style from './processing.module.scss';
import { Button, Message } from '@arco-design/web-react';
import { RadioGroup } from '@headlessui/react';
import { IconApps, IconInteraction } from '@arco-design/web-react/icon';
import ViewToggle, { ViewType } from '../ViewToggle';
import ScriptTable from '../sctipt-table';
import ScriptCard from '../sctipt-card';
import { downloadDevelopScript } from '@/api/sql';

interface PaginationProps {
  onToScriptList: (type: string) => void;
  curActiveTab: string;
}

const Processing: React.FC<PaginationProps> = memo(
  ({ onToScriptList, curActiveTab }) => {
    const [processingNum, setProcessingNum] = React.useState<number>(100);
    const [iconActive, setIconActive] = React.useState<ViewType>(
      ViewType.TABLE
    ); // table表示表格，card表示卡片
    const [isShowAll, setIsShoAll] = useState(false);

    useEffect(() => {
      setIsShoAll(isShowAll);
    }, [isShowAll]);
    const handleDownloadAll = async () => {
      try {
        const res = (await downloadDevelopScript()) as unknown as Blob;
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `加工脚本.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('下载脚本失败', error);
        Message.error('下载脚本失败');
      }
    };
    return (
      <div className={style['processing-wrapper']}>
        {/* 头部操作按钮 */}
        <div className={style['processing-header']}>
          <div className={style['processing-header-title']}>
            加工脚本({processingNum})
          </div>
          <div className={style['processing-header-icons-group']}>
            {(iconActive === ViewType.TABLE && isShowAll) ||
              (iconActive === ViewType.TABLE && (
                <Button
                  onClick={() => {
                    handleDownloadAll();
                  }}
                  className={style['header-btn']}
                >
                  下载全部
                </Button>
              ))}
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
          {iconActive === ViewType.TABLE ? (
            <ScriptTable
              curActiveTab={curActiveTab}
              isAll={setIsShoAll}
              onToScriptList={onToScriptList}
              onTotalChange={setProcessingNum}
            />
          ) : (
            <ScriptCard
              onToScriptList={onToScriptList}
              onTotalChange={setProcessingNum}
            />
          )}
        </div>
      </div>
    );
  }
);

export default Processing;
