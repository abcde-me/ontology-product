import React, { useMemo } from 'react';
import { Button, Dropdown, Menu, Popover } from '@arco-design/web-react';
import { IconCodeBlock, IconDown } from '@arco-design/web-react/icon';
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
  props: CustomFormItemCompProps<string> & { readonly: boolean }
) => {
  const { value, onChange, disabled } = props;
  const currentIcon = useMemo(() => {
    const key = value ?? `${ParamType.String}_${UiType.Input}`;
    const Icon = TYPE_UI_OPTIONS[key];
    return <Icon />;
  }, [value]);

  const dropList = (
    <Menu
      className={styles['ui-menu']}
      onClickMenuItem={(e) => {
        onChange?.(e);
      }}
    >
      {Object.entries(TYPE2COMP_OPTIONS).flatMap(([type, options]) => {
        return options.map((option) => {
          return (
            <Menu.Item
              key={`${type}_${option.value}`}
              className={classNames({
                [styles['ui-item-selected']]:
                  value === `${type}_${option.value}`
              })}
            >
              <div className={styles['ui-item']}>
                <IconCodeBlock />
                {`${type}-${option.label}`}
              </div>
            </Menu.Item>
          );
        });
      })}
    </Menu>
  );

  return (
    <Popover content={props.readonly ? '该函数已被行为绑定，不可修改' : null}>
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
        >
          <ProButton className={styles['ui-select']} type={'outline'}>
            {currentIcon}
            <IconDown />
          </ProButton>
        </Dropdown>
      </div>
    </Popover>
  );
};
