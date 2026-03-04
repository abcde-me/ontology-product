import React from 'react';
import { UiSelect } from '@/pages/ontologyScene/modules/functionDetail/components';
import styles from './index.module.scss';
import { UiType } from '@/pages/ontologyScene/types/ontologyFunction';
import {
  DatePicker,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload
} from '@arco-design/web-react';
import { InputNumberWithLabel } from '@ceai-front/arco-material';
import {
  DateTimePicker,
  FunctionFileParam,
  MapPicker,
  ObjectInterfaceSelect,
  ObjectSet,
  ObjectTypeSelect
} from '@/pages/ontologyScene/componens';

type IValue = {
  uiType?: string;
  paramValue?: any;
};
export const DataWithUiSelect = (
  props: CustomFormItemCompProps<IValue> & {
    osid?: number;
  }
) => {
  const { value, onChange, disabled } = props;
  const renderComponentByUiType = (type: UiType) => {
    switch (type) {
      case UiType.TextArea:
        return (
          <Input.TextArea
            placeholder={'请输入'}
            className={`${styles['ui-comp']} ${styles['textarea-comp']}`}
            autoSize={{
              minRows: 1,
              maxRows: 5
            }}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.InputNumber:
        return (
          <InputNumberWithLabel
            placeholder={'请输入'}
            className={`${styles['ui-comp']} w-[160px]`}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.InputNumberFloat:
        return (
          <InputNumber
            placeholder={'请输入'}
            className={styles['ui-comp']}
            style={{
              width: '160px'
            }}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.Switch:
        return (
          <Select
            className={styles['ui-comp']}
            placeholder={'请选择'}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
            options={[
              {
                label: 'true',
                value: 'true'
              },
              {
                label: 'false',
                value: 'false'
              }
            ]}
          />
        );
      case UiType.Date:
        return (
          <DatePicker
            disabled={disabled}
            className={`min-w-[160px] ${styles['ui-comp']}`}
            showTime={false}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.Uploader:
        return (
          <FunctionFileParam
            disabled={disabled}
            onChange={(value) => changeValue({ paramValue: value })}
            value={value?.paramValue}
            className={styles['ui-comp']}
          />
        );
      case UiType.Geopoint:
        return (
          <MapPicker
            className={styles['ui-comp']}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.Timestamp:
        return (
          <DatePicker
            showTime
            className={styles['ui-comp']}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.ObjectOne:
        return (
          <ObjectInterfaceSelect
            className={'flex-1'}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
            mode={'single'}
          />
        );
      case UiType.ObjectSet:
        return (
          <ObjectInterfaceSelect
            className={'flex-1'}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
            mode={'multiple'}
          />
        );
      default:
        return (
          <Input
            placeholder={'请输入'}
            className={styles['ui-comp']}
            disabled={disabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
    }
  };

  const changeValue = (data: IValue) => {
    onChange?.({
      ...value,
      ...data
    });
  };

  return (
    <div className={styles['comp-wrapper']}>
      <UiSelect
        value={value?.uiType}
        onChange={(uiType) => {
          changeValue({
            uiType
          });
        }}
        disabled={disabled}
      />
      {!!value &&
        renderComponentByUiType(value.uiType!.split('_').pop() as UiType)}
    </div>
  );
};
