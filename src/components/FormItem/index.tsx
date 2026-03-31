import React, { ComponentProps } from 'react';
import { Form } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { GlobalTooltip } from '@ceai-front/arco-material';

interface IProps extends ComponentProps<typeof Form.Item> {
  labelWidth?: number;
  showColon?: boolean;
}

const FormItem = (props: IProps) => {
  const {
    labelWidth,
    className,
    label,
    showColon = true,
    ...otherProps
  } = props;
  return (
    <Form.Item
      {...otherProps}
      label={
        label ? (
          <GlobalTooltip.Ellipsis
            text={label as string}
            className={'text-[var(--color-text-2)]'}
          />
        ) : null
      }
      required
      className={classNames(
        className,
        styles['form-item'],
        styles[!otherProps.required ? 'item-partial' : 'item-required'],
        showColon ? styles['item-show-colon'] : ''
      )}
    />
  );
};
export default FormItem;
