import React, { useState } from 'react';
import { OntologyFunctionDetail } from '@/pages/ontologyScene/types/ontologyFunction';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { OsModal, PyCodeContent } from '@/pages/ontologyScene/components';
import styles from './index.module.scss';
import { Tooltip } from '@arco-design/web-react';

export const FunctionInfo = ({
  functionInfo
}: {
  functionInfo?: OntologyFunctionDetail;
}) => {
  const [show, setShow] = useState(true);

  return (
    <>
      <div className={'flex w-full items-center gap-1 overflow-hidden'}>
        <div className={'w-max overflow-hidden'}>
          <GlobalTooltip.Ellipsis text={functionInfo?.name || '-'} />
        </div>
        <Tooltip content={'详情'}>
          <IconInfoCircle
            className={
              'flex-shrink-0 hover:cursor-pointer hover:text-[rgb(var(--primary-6))]'
            }
            onClick={() => setShow(true)}
          />
        </Tooltip>
      </div>
      <OsModal
        className={styles['function-modal']}
        style={{ width: 900, maxHeight: 600 }}
        title={functionInfo?.name || '-'}
        closable
        maskClosable
        footer={null}
        visible={show}
        onCancel={() => setShow(false)}
      >
        <div className={'h-max overflow-scroll'}>
          <PyCodeContent value={functionInfo?.content} />
        </div>
      </OsModal>
    </>
  );
};
