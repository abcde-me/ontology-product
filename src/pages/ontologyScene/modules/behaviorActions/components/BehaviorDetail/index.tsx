import React, { useState } from 'react';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import styles from './index.module.scss';
import { OsDrawer } from '@/pages/ontologyScene/componens';
import { Tabs } from '@arco-design/web-react';
import { IconEdit } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';

interface IProps {
  show: boolean;
  onClose: () => void;
  data?: BehaviorActionItem;
}

export const BehaviorDetail = (props: IProps) => {
  const { data, onClose, show } = props;
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('');
  return (
    <OsDrawer
      visible={show}
      footer={null}
      onCancel={onClose}
      className={styles['behavior-detail']}
      title={'行为详情'}
      maskClosable
      closable
      onEdit={() => {
        history.push(
          `/tenant/compute/modaforge/ontologyScene/detail/undefined/behaviorActions/edit/${data?.id}`
        );
      }}
    >
      <div className={'flex flex-col gap-3'}>
        <div>
          <div
            className={
              'mb-3 font-PingFangSc text-[14px] font-medium leading-[22px] text-[#0F131F]'
            }
          >
            基本信息
          </div>
          <div className={'flex w-full flex-wrap'}>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>行为名称：</div>
              <div className={styles['item-value']}>这是名称</div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>描述说明：</div>
              <div className={styles['item-value']}>这是描述</div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>所属对象类型：</div>
              <div className={styles['item-value']}>
                <div className={styles['icon-content']}>
                  <IconEdit />
                </div>
                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称这是名称
                </div>
              </div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>函数：</div>
              <div className={styles['item-value']}>函数</div>
            </div>
            <div className={styles['base-info-item']}>
              <div className={styles['item-field']}>id：</div>
              <div className={styles['item-value']}>id</div>
            </div>
          </div>
        </div>
        <div className={styles['behavior-other-info']}>
          <Tabs activeTab={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane title={'参数配置（5）'} key={'params'} />
            <Tabs.TabPane title={'校验规则（5）'} key={'rules'} />
            <Tabs.TabPane title={'函数'} key={'function'} />
          </Tabs>
          <div>正文</div>
        </div>
      </div>
    </OsDrawer>
  );
};
