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
  ObjectInstanceSelect,
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
    onParamValueChange?: (v?: React.Key) => void;
    disabledConfig: {
      uiType: boolean;
      paramValue: boolean;
    };
    readonly: boolean;
  }
) => {
  const { value, onChange, disabledConfig } = props;
  const disabled = disabledConfig.uiType || disabledConfig.paramValue;
  const valueDisabled = disabledConfig.paramValue;

  const popupContainer = () => {
    return document.querySelector('#functionSettingContainer') || document.body;
  };

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
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.InputNumber:
        return (
          <InputNumberWithLabel
            placeholder={'请输入'}
            className={`${styles['ui-comp']} w-[160px]`}
            value={value?.paramValue}
            disabled={valueDisabled}
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
            disabled={valueDisabled}
            value={value?.paramValue}
            onChange={(value) => changeValue({ paramValue: value })}
          />
        );
      case UiType.Switch:
        return (
          <Select
            className={styles['ui-comp']}
            placeholder={'请选择'}
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
            getPopupContainer={popupContainer}
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
            className={`min-w-[160px] ${styles['ui-comp']}`}
            showTime={false}
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
            getPopupContainer={popupContainer}
          />
        );
      case UiType.Uploader:
        return (
          <FunctionFileParam
            onChange={(value) => changeValue({ paramValue: value })}
            value={value?.paramValue}
            disabled={valueDisabled}
            className={styles['ui-comp']}
            getPopupContainer={popupContainer}
          />
        );
      case UiType.Geopoint:
        return (
          <MapPicker
            className={styles['ui-comp']}
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
            getPopupContainer={popupContainer}
          />
        );
      case UiType.Timestamp:
        return (
          <DatePicker
            showTime
            className={styles['ui-comp']}
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
            getPopupContainer={popupContainer}
          />
        );
      case UiType.ObjectOne:
        return (
          <ObjectInstanceSelect
            className={'flex-1'}
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
            mode={'single'}
            getPopupContainer={popupContainer}
          />
        );
      case UiType.ObjectSet:
        return (
          <ObjectInstanceSelect
            className={'flex-1'}
            value={value?.paramValue}
            disabled={valueDisabled}
            onChange={(value) => changeValue({ paramValue: value })}
            mode={'multiple'}
            getPopupContainer={popupContainer}
          />
        );
      default:
        return (
          <Input
            placeholder={'请输入'}
            className={styles['ui-comp']}
            value={value?.paramValue}
            disabled={valueDisabled}
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
    props.onParamValueChange?.();
  };

  return (
    <div className={styles['comp-wrapper']}>
      <UiSelect
        readonly={props.readonly}
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
