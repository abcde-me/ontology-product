import React, { ComponentProps } from 'react';
import { Form } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { EllipsisPopover } from '@/pages/ontologyScene/components';

interface IProps extends ComponentProps<typeof Form.Item> {
  labelWidth?: number;
}

export const FormItem = (props: IProps) => {
  const { labelWidth, className, label, ...otherProps } = props;
  return (
    <Form.Item
      {...otherProps}
      label={
        label ? (
          <EllipsisPopover
            value={label}
            className={'text-[var(--color-text-2)]'}
          />
        ) : null
      }
      required
      className={classNames(
        className,
        styles['form-item'],
        styles[!otherProps.required ? 'item-partial' : 'item-required']
      )}
    />
  );
};
