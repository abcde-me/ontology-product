import React from 'react';
import classNames from 'classnames';
import { GlobalTooltip } from '@ceai-front/arco-material';
import { getActionList } from '@/api/ontologySceneLibrary/ontologyAction';
import { FetchDataSelect } from '@/components/FetchDataSelect';
import { BehaviorActionItem } from '@/pages/ontologyScene/types/behaviorActions';
import styles from './index.module.scss';
import { ObjectTypeTag } from '@/pages/ontologyScene/components';

export interface ActionSelectProps {
  placeholder?: string;
  objectTypeId?: number;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  actionData?: BehaviorActionItem;
  onChange?: (
    value: React.Key | undefined,
    action?: BehaviorActionItem
  ) => void;
  disabled?: boolean;
  value?: React.Key;
  className?: string;
  wrapperClassName?: string;
  id?: string;
}

/** 行为下拉选择 */
export const ActionSelect = (props: ActionSelectProps) => {
  const {
    placeholder,
    getPopupContainer,
    actionData,
    onChange,
    disabled,
    value,
    className,
    wrapperClassName,
    id = 'autoRuleActionSelect'
  } = props;

  return (
    <FetchDataSelect<BehaviorActionItem>
      id={id}
      value={value}
      disabled={disabled}
      className={classNames(styles['instance'], className)}
      wrapperClassName={classNames(styles['ins-sel-wrapper'], wrapperClassName)}
      placeholder={'请选择或搜索行为'}
      getPopupContainer={getPopupContainer}
      renderValue={() => (
        <GlobalTooltip.Ellipsis text={actionData?.name || '-'} />
      )}
      virtualListProps={{
        itemHeight: 60,
        maxHeight: 400
      }}
      renderOption={(option) => {
        return (
          <div
            className={
              'flex h-[60px] w-full flex-col justify-center gap-1 overflow-hidden'
            }
          >
            <div className={styles['action-sel-item-name']}>
              <GlobalTooltip.Ellipsis
                text={option.name || '-'}
                className={styles['ellipsis-text']}
              />
              (id:
              <GlobalTooltip.Ellipsis
                text={option.code || '-'}
                className={styles['ellipsis-text']}
              />
              )
            </div>
            <div className={'flex h-max items-center gap-4 overflow-hidden'}>
              <div className={styles['action-sel-item-info']}>
                <div className={`flex-shrink-0 ${styles['default-text']}`}>
                  本体场景：
                </div>
                <GlobalTooltip.Ellipsis
                  text={option.ontologyModelName || '-'}
                  className={styles['default-text']}
                />
              </div>
              <div className={styles['action-sel-item-info']}>
                <div className={`flex-shrink-0 ${styles['default-text']}`}>
                  绑定对象类型：
                </div>
                <ObjectTypeTag
                  className={styles['action-obj-type']}
                  hoverClassName={styles['action-obj-type-name']}
                  ontologyObjectTypeName={option.objectTypeName || '全局行为'}
                  ontologyObjectTypeId={option.objectTypeId}
                  ontologyObjectTypeIcon={option.objectTypeIcon}
                />
              </div>
            </div>
          </div>
        );
      }}
      fetchData={async ({ search, pageNo, pageSize }) => {
        const response = await getActionList({
          pageNum: pageNo,
          pageSize,
          filter: search
        });
        return response.items || [];
      }}
      onChange={(nextValue, option) => {
        if (nextValue !== undefined) {
          onChange?.(nextValue, option);
        } else {
          onChange?.(nextValue as any, option);
        }
      }}
    />
  );
};
