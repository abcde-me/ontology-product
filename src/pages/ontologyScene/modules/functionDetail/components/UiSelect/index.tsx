import React, { useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Menu,
  Popover,
  Tooltip
} from '@arco-design/web-react';
import { IconCodeBlock, IconDown, IconUp } from '@arco-design/web-react/icon';
import styles from './index.module.scss';
import {
  TYPE2COMP_OPTIONS,
  TYPE_UI_OPTIONS
} from '@/pages/ontologyScene/types/behaviorActions';
import { ProButton } from '@ceai-front/arco-material';
import {
  ParamType,
  UiType
} from '@/pages/ontologyScene/types/ontologyFunction';
import classNames from 'classnames';

export const UiSelect = (
  props: CustomFormItemCompProps<string> & {
    readonly: boolean;
    getPopupContainer?: (node: HTMLElement) => Element;
  }
) => {
  const { value, onChange, disabled } = props;
  const currentIcon = useMemo(() => {
    const key = value ?? `${ParamType.String}_${UiType.Input}`;
    const Icon = TYPE_UI_OPTIONS[key];
    return (
      <Icon
        width={16}
        height={16}
        color={'#23293B'}
        className={'text-[16px] text-[#23293B]'}
      />
    );
  }, [value]);

  const [menuVisible, setMenuVisible] = useState(false);

  const dropList = (
    <Menu
      className={styles['ui-menu']}
      onClickMenuItem={(e) => {
        onChange?.(e);
      }}
    >
      {Object.entries(TYPE2COMP_OPTIONS).flatMap(([type, options]) => {
        return options.map((option) => {
          const Icon = option.icon;
          return (
            <Menu.Item
              key={`${type}_${option.value}`}
              className={classNames({
                [styles['ui-item-selected']]:
                  value === `${type}_${option.value}`
              })}
            >
              <div className={styles['ui-item']}>
                <Icon
                  width={20}
                  height={20}
                  color={'#23293B'}
                  className={'text-[20px] text-[#23293B]'}
                />
                {`${type}-${option.label}`}
              </div>
            </Menu.Item>
          );
        });
      })}
    </Menu>
  );

  const popupContainer = () => {
    return document.querySelector('#functionSettingContainer') || document.body;
  };
  return (
    <Tooltip
      content={props.readonly ? '该函数已被行为绑定，不可修改' : null}
      getPopupContainer={popupContainer}
    >
      <div
        className={classNames([
          styles['ui-select-wrapper'],
          'ui-select-wrapper'
        ])}
      >
        <Dropdown
          droplist={dropList}
          trigger="click"
          position="bl"
          disabled={disabled}
          // disabled
          getPopupContainer={popupContainer}
          onVisibleChange={setMenuVisible}
          triggerProps={{
            updateOnScroll: true
          }}
        >
          <ProButton
            className={classNames([
              styles['ui-select'],
              {
                [styles['ui-select-active']]: menuVisible
              }
            ])}
            type={'outline'}
          >
            {currentIcon}
            {!menuVisible ? <IconDown className={'text-[12px]'} /> : <IconUp />}
          </ProButton>
        </Dropdown>
      </div>
    </Tooltip>
  );
};
