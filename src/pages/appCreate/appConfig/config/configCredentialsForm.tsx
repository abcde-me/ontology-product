import React, { useState } from 'react';
import type { FC } from 'react';
import cn from 'classnames';
import type {
  CredentialFormSchema,
  CredentialFormSchemaNumberInput,
  CredentialFormSchemaRadio,
  CredentialFormSchemaSecretInput,
  CredentialFormSchemaSelect,
  CredentialFormSchemaTextInput,
  FormValue
} from '@/utils/type';
import { FormTypeEnum } from '@/utils/type';
import { Input, Radio, Select, Tooltip } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
type FormProps = {
  value: FormValue;
  onChange: (val: FormValue) => void;
  formSchemas: CredentialFormSchema[];
  validating: boolean;
  validatedSuccess?: boolean;
  showOnVariableMap: Record<string, string[]>;
  isEditMode: boolean;
  readonly?: boolean;
  inputClassName?: string;
  isShowDefaultValue?: boolean;
  fieldMoreInfo?: (payload: CredentialFormSchema) => JSX.Element | null;
};

const ValidatingTip = '验证秘钥中……';

const Form: FC<FormProps> = ({
  value,
  onChange,
  formSchemas,
  validating,
  validatedSuccess,
  showOnVariableMap,
  isEditMode,
  readonly,
  inputClassName,
  isShowDefaultValue = false,
  fieldMoreInfo
}) => {
  const [changeKey, setChangeKey] = useState('');

  const handleFormChange = (key: string, val: string | boolean) => {
    if (isEditMode && (key === '__model_type' || key === '__model_name'))
      return;

    setChangeKey(key);
    const shouldClearVariable: Record<string, string | undefined> = {};
    if (showOnVariableMap[key]?.length) {
      showOnVariableMap[key].forEach((clearVariable) => {
        shouldClearVariable[clearVariable] = undefined;
      });
    }
    onChange({ ...value, [key]: val, ...shouldClearVariable });
  };

  const renderField = (formSchema: CredentialFormSchema) => {
    const tooltip = formSchema.tooltip;
    const tooltipContent = tooltip && (
      <span className="ml-1 pt-1.5">
        <Tooltip
          content={
            // w-[100px] caused problem
            <div className="">{tooltip['zh_Hans']}</div>
          }
        >
          <IconQuestionCircle className="text-[16px] text-[var(--color-text-3)]" />
        </Tooltip>
      </span>
    );
    if (
      formSchema.type === FormTypeEnum.textInput ||
      formSchema.type === FormTypeEnum.secretInput ||
      formSchema.type === FormTypeEnum.textNumber
    ) {
      const { variable, label, placeholder, required, show_on } = formSchema as
        | CredentialFormSchemaTextInput
        | CredentialFormSchemaSecretInput;

      if (
        show_on.length &&
        !show_on.every(
          (showOnItem) => value[showOnItem.variable] === showOnItem.value
        )
      )
        return null;

      const disabed =
        readonly ||
        (isEditMode &&
          (variable === '__model_type' || variable === '__model_name'));
      return (
        <div key={variable} className="py-3">
          <div className="py-2 text-[var(--color-text-2)]">
            {label['zh_Hans'] || label.en_US}
            {required && <span className="ml-1 text-red-500">*</span>}
            {tooltipContent}
          </div>
          <Input
            className={cn(
              inputClassName,
              `${disabed && 'cursor-not-allowed opacity-60'}`
            )}
            value={
              isShowDefaultValue &&
              ((value[variable] as string) === '' ||
                value[variable] === undefined ||
                value[variable] === null)
                ? formSchema.default
                : value[variable]
            }
            onChange={(val) => handleFormChange(variable, val)}
            placeholder={placeholder?.['zh_Hans'] || placeholder?.en_US}
            disabled={disabed}
            type={
              formSchema.type === FormTypeEnum.textNumber ? 'number' : 'text'
            }
            {...(formSchema.type === FormTypeEnum.textNumber
              ? {
                  min: (formSchema as CredentialFormSchemaNumberInput).min,
                  max: (formSchema as CredentialFormSchemaNumberInput).max
                }
              : {})}
          />
          {fieldMoreInfo?.(formSchema)}
          {validating && changeKey === variable && ValidatingTip}
          {validatedSuccess ? '验证成功' : ''}
        </div>
      );
    }

    if (formSchema.type === FormTypeEnum.radio) {
      const { options, variable, label, show_on, required } =
        formSchema as CredentialFormSchemaRadio;

      if (
        show_on.length &&
        !show_on.every(
          (showOnItem) => value[showOnItem.variable] === showOnItem.value
        )
      )
        return null;

      const disabed =
        isEditMode &&
        (variable === '__model_type' || variable === '__model_name');

      return (
        <div key={variable} className="py-3">
          <div className="py-2 text-sm text-gray-900">
            {label['zh_Hans'] || label.en_US}
            {required && <span className="ml-1 text-red-500">*</span>}
            {tooltipContent}
          </div>
          <div className={`grid grid-cols-${options?.length} gap-3`}>
            {options
              .filter((option) => {
                if (option.show_on.length)
                  return option.show_on.every(
                    (showOnItem) =>
                      value[showOnItem.variable] === showOnItem.value
                  );

                return true;
              })
              .map((option) => (
                <div
                  className={`
                    flex cursor-pointer items-center rounded-lg border border-gray-100 bg-gray-25 px-3 py-2
                    ${value[variable] === option.value && 'border-[1.5px] border-primary-400 bg-white shadow-sm'}
                    ${disabed && '!cursor-not-allowed opacity-60'}
                  `}
                  onClick={() => handleFormChange(variable, option.value)}
                  key={`${variable}-${option.value}`}
                >
                  <div
                    className={`
                    mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-gray-300
                    ${value[variable] === option.value && 'border-[5px] border-primary-600'}
                  `}
                  />
                  <div className="text-sm text-gray-900">
                    {option.label['zh_Hans']}
                  </div>
                </div>
              ))}
          </div>
          {fieldMoreInfo?.(formSchema)}
          {validating && changeKey === variable && ValidatingTip}
        </div>
      );
    }

    if (formSchema.type === 'select') {
      const { options, variable, label, show_on, required, placeholder } =
        formSchema as CredentialFormSchemaSelect;

      if (
        show_on.length &&
        !show_on.every(
          (showOnItem) => value[showOnItem.variable] === showOnItem.value
        )
      )
        return null;

      return (
        <div key={variable} className="py-3">
          <div className="py-2 text-sm text-gray-900">
            {label['zh_Hans'] || label.en_US}

            {required && <span className="ml-1 text-red-500">*</span>}
            {tooltipContent}
          </div>
          <Select
            className={cn(inputClassName)}
            disabled={readonly}
            defaultValue={
              isShowDefaultValue &&
              ((value[variable] as string) === '' ||
                value[variable] === undefined ||
                value[variable] === null)
                ? formSchema.default
                : value[variable]
            }
            options={options
              .filter((option) => {
                if (option.show_on.length)
                  return option.show_on.every(
                    (showOnItem) =>
                      value[showOnItem.variable] === showOnItem.value
                  );

                return true;
              })
              .map((option) => ({
                value: option.value,
                label: option.label['zh_Hans']
              }))}
            onChange={(value) => handleFormChange(variable, value as string)}
            placeholder={placeholder?.['zh_Hans']}
          />
          {fieldMoreInfo?.(formSchema)}
          {validating && changeKey === variable && ValidatingTip}
        </div>
      );
    }

    if (formSchema.type === 'boolean') {
      const { variable, label, show_on } =
        formSchema as CredentialFormSchemaRadio;

      if (
        show_on.length &&
        !show_on.every(
          (showOnItem) => value[showOnItem.variable] === showOnItem.value
        )
      )
        return null;

      return (
        <div key={variable} className="py-3">
          <div className="flex items-center justify-between py-2 text-sm text-gray-900">
            <div className="flex items-center space-x-2">
              <span>{label['zh_Hans'] || label.en_US}</span>
              {tooltipContent}
            </div>
            <Radio.Group
              className="flex items-center"
              value={value[variable] ? 1 : 0}
              onChange={(val) => handleFormChange(variable, val === 1)}
            >
              <Radio value={1} className="!mr-1">
                True
              </Radio>
              <Radio value={0}>False</Radio>
            </Radio.Group>
          </div>
          {fieldMoreInfo?.(formSchema)}
        </div>
      );
    }
  };

  return <div>{formSchemas.map((formSchema) => renderField(formSchema))}</div>;
};

export default Form;
