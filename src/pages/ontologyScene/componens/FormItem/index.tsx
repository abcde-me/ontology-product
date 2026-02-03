import React, { ComponentProps } from 'react';
import { Form } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface IProps extends ComponentProps<typeof Form.Item> {
  labelWidth?: number;
}

export const FormItem = (props: IProps) => {
  const { labelWidth, className, ...otherProps } = props;
  return (
    <Form.Item
      {...otherProps}
      required
      className={classNames(
        className,
        styles['form-item'],
        styles[!otherProps.required ? 'item-partial' : 'item-required']
      )}
    />
  );
};
