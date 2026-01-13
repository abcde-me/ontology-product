import React, { memo, useCallback, useState } from 'react';
import Textarea from 'rc-textarea';
import { useTranslation } from 'react-i18next';
import { Message } from '@arco-design/web-react';
import { useNodesReadOnly } from '../../../hooks/use-workflow';

type TitleInputProps = {
  value: string;
  onBlur: (value: string) => void;
  className?: string;
};

export const TitleInput = memo(
  ({ value, onBlur, className = '' }: TitleInputProps) => {
    const { getNodesReadOnly } = useNodesReadOnly();
    const { t } = useTranslation('plugin__console-plugin-appforge');
    const [localValue, setLocalValue] = useState(value);

    const handleBlur = (e) => {
      const localValue = e.target.innerText;
      if (!localValue.trim()) {
        Message.error('标题不能为空');
        setLocalValue('');
        onBlur(value);
        return;
      }
      // 正则表达式：只允许中文、英文、数字、下划线和连字符
      const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_-]*$/;
      if (!validPattern.test(localValue)) {
        setLocalValue(value);
        onBlur(value);
        Message.error({
          content: '标题只能包含中文、英文、数字、下划线和连字符！'
        });
        return;
      }

      if (localValue.length > 50) {
        setLocalValue(value);
        onBlur(value);
        Message.error({
          content: '标题过长！标题长度为1-50字符！'
        });
        return;
      }

      if (!localValue) {
        setLocalValue(value);
        onBlur(value);
        Message.error({
          content: '标题不可为空！'
        });
        return;
      }

      onBlur(localValue);
    };

    return (
      <div
        contentEditable={!getNodesReadOnly()}
        // onInput={(e) => {
        //   // @ts-ignore
        //   !getNodesReadOnly() && setLocalValue(e.target.innerText);
        // }}
        className={`
        system-xl-semibold h-7 min-w-0 appearance-none rounded-md border border-transparent px-1
        text-[#1E293B]
        text-text-primary outline-none focus:shadow-xs ${className} max-w-[280px] overflow-x-auto overflow-y-hidden whitespace-nowrap
      `}
        // style={{ width: ((localValue?.length || 0) + 1) * 16 }}
        style={{ fontWeight: 500 }}
        placeholder={t('workflow.common.addTitle') || ''}
        onBlur={handleBlur}
        onBeforeInput={(e) => {
          // @ts-ignore
          if (e.inputType === 'insertParagraph') {
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        {localValue || value}
      </div>
    );
  }
);
TitleInput.displayName = 'TitleInput';

type DescriptionInputProps = {
  value: string;
  onChange: (value: string) => void;
};
export const DescriptionInput = memo(
  ({ value, onChange }: DescriptionInputProps) => {
    const { t } = useTranslation('plugin__console-plugin-appforge');
    const [focus, setFocus] = useState(false);
    const handleFocus = useCallback(() => {
      setFocus(true);
    }, []);
    const handleBlur = useCallback(() => {
      setFocus(false);
    }, []);

    return (
      <div
        className={`
        leading-0 group flex max-h-[60px] overflow-y-auto rounded-lg
        bg-components-panel-bg py-[5px]
        ${focus && '!shadow-xs'}
      `}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={1}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
          w-full resize-none appearance-none bg-transparent text-xs
          leading-[18px] text-gray-900 caret-[#295EFF]
          outline-none placeholder:text-gray-400
        `}
          placeholder={t('workflow.common.addDescription') || ''}
          autoSize
          maxLength={200}
        />
      </div>
    );
  }
);
DescriptionInput.displayName = 'DescriptionInput';
