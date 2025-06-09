import React from 'react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ModelParameterRule } from '@/utils/type';
import { Radio, Select, Slider, Switch, Tooltip } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';

export const isNullOrUndefined = (value: any) => {
  return value === undefined || value === null;
};

export type ParameterValue = number | string | string[] | boolean | undefined;

type ParameterItemProps = {
  parameterRule: ModelParameterRule;
  value?: ParameterValue;
  onChange?: (value: ParameterValue) => void;
  className?: string;
  onSwitch?: (checked: boolean, assignValue: ParameterValue) => void;
};
const ParameterItem: FC<ParameterItemProps> = ({
  parameterRule,
  value,
  onChange,
  className,
  onSwitch
}) => {
  const [localValue, setLocalValue] = useState(value);
  const numberInputRef = useRef<HTMLInputElement>(null);

  const getDefaultValue = () => {
    let defaultValue: ParameterValue;

    if (parameterRule.type === 'int' || parameterRule.type === 'float')
      defaultValue = isNullOrUndefined(parameterRule.default)
        ? parameterRule.min || 0
        : parameterRule.default;
    else if (parameterRule.type === 'string')
      defaultValue = parameterRule.options?.length
        ? parameterRule.default || ''
        : parameterRule.default || '';
    else if (parameterRule.type === 'boolean')
      defaultValue = !isNullOrUndefined(parameterRule.default)
        ? parameterRule.default
        : false;
    else if (parameterRule.type === 'tag')
      defaultValue = !isNullOrUndefined(parameterRule.default)
        ? parameterRule.default
        : [];

    return defaultValue;
  };

  const renderValue = value ?? localValue ?? getDefaultValue();

  const handleInputChange = (newValue: ParameterValue) => {
    setLocalValue(newValue);

    if (
      onChange &&
      (parameterRule.name === 'stop' || !isNullOrUndefined(value))
    )
      onChange(newValue);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let num = +e.target.value;

    if (!isNullOrUndefined(parameterRule.max) && num > parameterRule.max!) {
      num = parameterRule.max as number;
      numberInputRef.current!.value = `${num}`;
    }

    if (!isNullOrUndefined(parameterRule.min) && num < parameterRule.min!)
      num = parameterRule.min as number;

    handleInputChange(num);
  };

  const handleNumberInputBlur = () => {
    if (numberInputRef.current)
      numberInputRef.current.value = renderValue as string;
  };

  const handleSlideChange = (num: number) => {
    if (!isNullOrUndefined(parameterRule.max) && num > parameterRule.max!) {
      handleInputChange(parameterRule.max);
      numberInputRef.current!.value = `${parameterRule.max}`;
      return;
    }

    if (!isNullOrUndefined(parameterRule.min) && num < parameterRule.min!) {
      handleInputChange(parameterRule.min);
      numberInputRef.current!.value = `${parameterRule.min}`;
      return;
    }

    handleInputChange(num);
    numberInputRef.current!.value = `${num}`;
  };

  const handleRadioChange = (v: number) => {
    handleInputChange(v === 1);
  };

  const handleStringInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e.target.value);
  };

  const handleSelect = (val) => {
    handleInputChange(val);
  };

  const handleTagChange = (newSequences: string[]) => {
    handleInputChange(newSequences);
  };

  const handleSwitch = (checked: boolean) => {
    if (onSwitch) {
      const assignValue: ParameterValue = localValue || getDefaultValue();

      onSwitch(checked, assignValue);
    }
  };

  useEffect(() => {
    if (
      (parameterRule.type === 'int' || parameterRule.type === 'float') &&
      numberInputRef.current
    )
      numberInputRef.current.value = `${renderValue}`;
  }, [parameterRule.type, renderValue, value]);

  const renderInput = () => {
    const numberInputWithSlide =
      (parameterRule.type === 'int' || parameterRule.type === 'float') &&
      !isNullOrUndefined(parameterRule.min) &&
      !isNullOrUndefined(parameterRule.max);

    if (parameterRule.type === 'int' || parameterRule.type === 'float') {
      let step = 100;
      if (parameterRule.max) {
        if (parameterRule.max < 10) step = 0.1;
        else if (parameterRule.max < 100) step = 1;
        else if (parameterRule.max < 1000) step = 10;
        else if (parameterRule.max < 10000) step = 100;
      }

      return (
        <>
          {numberInputWithSlide && (
            <Slider
              className="w-[120px]"
              value={renderValue as number}
              min={parameterRule.min}
              max={parameterRule.max}
              step={step}
              onChange={handleSlideChange}
            />
          )}
          <input
            ref={numberInputRef}
            className="text-gra-900 ml-4 block h-8 w-16 shrink-0 appearance-none rounded-lg bg-gray-100 pl-3 text-[13px] outline-none"
            type="number"
            max={parameterRule.max}
            min={parameterRule.min}
            step={
              numberInputWithSlide ? step : +`0.${parameterRule.precision || 0}`
            }
            onChange={handleNumberInputChange}
            onBlur={handleNumberInputBlur}
          />
        </>
      );
    }

    if (parameterRule.type === 'boolean') {
      return (
        <Radio.Group
          className="flex w-[200px] items-center"
          value={renderValue ? 1 : 0}
          onChange={handleRadioChange}
        >
          <Radio value={1} className="!mr-1 w-[94px]">
            True
          </Radio>
          <Radio value={0} className="w-[94px]">
            False
          </Radio>
        </Radio.Group>
      );
    }

    if (parameterRule.type === 'string' && !parameterRule.options?.length) {
      return (
        <input
          className="text-gra-900 flex h-8 w-[200px] appearance-none items-center rounded-lg bg-gray-100 px-3 text-[13px] outline-none"
          value={renderValue as string}
          onChange={handleStringInputChange}
        />
      );
    }

    if (parameterRule.type === 'string' && !!parameterRule?.options?.length) {
      return (
        <Select
          defaultValue={renderValue as string}
          onChange={handleSelect}
          options={parameterRule.options.map((option) => ({
            value: option,
            label: option
          }))}
        />
      );
    }

    if (parameterRule.type === 'tag') {
      return (
        <div className="w-[200px]">
          <Select
            allowCreate
            options={renderValue as string[]}
            onChange={handleTagChange}
          />
        </div>
      );
    }

    return null;
  };
  const language = 'zh_Hans';

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <div className="flex w-[200px] shrink-0 items-center">
          <div
            className="mr-0.5 truncate text-[13px] font-medium text-gray-700"
            title={parameterRule.label[language] || parameterRule.label.en_US}
          >
            {parameterRule.label[language] || parameterRule.label.en_US}
          </div>
          {parameterRule.help && (
            <Tooltip
              content={
                <div className="w-[200px] whitespace-pre-wrap">
                  {parameterRule.help[language] || parameterRule.help.en_US}
                </div>
              }
            >
              <IconQuestionCircle className="text-[16px]" />
            </Tooltip>
          )}
          {!parameterRule.required && parameterRule.name !== 'stop' && (
            <Switch
              checked={!isNullOrUndefined(value)}
              onChange={handleSwitch}
            />
          )}
        </div>
        {parameterRule.type === 'tag' && (
          <div className="w-[200px] text-xs font-normal text-gray-400">
            {parameterRule?.tagPlaceholder?.[language]}
          </div>
        )}
      </div>
      {renderInput()}
    </div>
  );
};

export default ParameterItem;
