import React, { ComponentProps } from 'react';
import { Form } from '@arco-design/web-react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { GlobalTooltip } from '@ceai-front/arco-material';

interface IProps extends ComponentProps<typeof Form.Item> {
  /**
   * label宽度,暂不生效
   */
  labelWidth?: number;
  /**
   * 是否显示冒号
   */
  showColon?: boolean;
}

/**
 * 预留必填标识位置的Form.Item组件
 * 通过背景色来控制显隐transparent->rgb(var(--danger-6))
 * @param props
 * @constructor
 */
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
