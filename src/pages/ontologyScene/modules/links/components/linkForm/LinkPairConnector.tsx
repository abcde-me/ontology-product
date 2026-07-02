import React from 'react';
import { Form, Input, Popover } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { LinkDirection } from '../../../../types/link';
import {
  ONTOLOGY_IDENTIFIER_EXTRA,
  ontologyIdentifierValidatorRule
} from '@/utils/ontologyIdentifier';
import { buildLinkPairConnectorBackground } from './utils/objectTypeIconColor';

const FormItem = Form.Item;
const LINK_LINE_COLOR = '#4672F5';

interface LinkPairConnectorProps {
  fieldPrefix: string;
  linkDirection: LinkDirection;
  sourceIcon?: string;
  targetIcon?: string;
  onChange: (direction: LinkDirection) => void;
  disabled?: boolean;
}

const DashedSegment = ({ className = '' }: { className?: string }) => (
  <div
    className={`h-0 flex-1 border-t border-dashed ${className}`}
    style={{ borderColor: LINK_LINE_COLOR }}
  />
);

const ArrowHead = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    className="shrink-0"
    style={{ color: LINK_LINE_COLOR }}
  >
    {direction === 'right' ? (
      <path d="M0 0L10 6L0 12V0Z" fill="currentColor" />
    ) : (
      <path d="M10 0L0 6L10 12V0Z" fill="currentColor" />
    )}
  </svg>
);

export default function LinkPairConnector({
  fieldPrefix,
  linkDirection,
  sourceIcon,
  targetIcon,
  onChange,
  disabled = false
}: LinkPairConnectorProps) {
  const isBidirectional = linkDirection === LinkDirection.BIDIRECTIONAL;
  const directionLabel = isBidirectional ? '双向' : '单向';
  const directionTip = isBidirectional ? '点击切换为单向' : '点击切换为双向';
  const connectorBackground = buildLinkPairConnectorBackground(
    sourceIcon,
    targetIcon
  );

  const handleToggleDirection = () => {
    if (disabled) {
      return;
    }
    onChange(
      isBidirectional
        ? LinkDirection.UNIDIRECTIONAL
        : LinkDirection.BIDIRECTIONAL
    );
  };

  return (
    <div
      className="flex w-full min-w-[300px] flex-col items-center justify-center self-stretch rounded-[4px] px-[16px] py-[12px]"
      style={{ background: connectorBackground }}
    >
      <div className="mb-[6px] w-full">
        <FormItem
          field={`${fieldPrefix}.name`}
          requiredSymbol={false}
          rules={[
            { required: true, message: '请输入链接名称' },
            { maxLength: 50, message: '名称不能超过50个字符' }
          ]}
          noStyle
        >
          <Input
            placeholder="链接名称"
            maxLength={50}
            size="mini"
            disabled={disabled}
            className="!bg-white text-center"
          />
        </FormItem>
      </div>

      <div className="flex w-full items-center">
        {isBidirectional ? <ArrowHead direction="left" /> : null}
        <DashedSegment className={isBidirectional ? 'mx-[2px]' : 'mr-[2px]'} />
        <Popover content={directionTip}>
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggleDirection}
            className="z-[1] shrink-0 cursor-pointer rounded-[4px] border border-[#C3C7D4] bg-white px-[10px] py-[2px] text-[12px] leading-[18px] text-[rgb(var(--primary-6))] transition-colors hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--primary-1))] disabled:cursor-not-allowed disabled:text-[var(--color-text-3)]"
          >
            {directionLabel}
          </button>
        </Popover>
        <DashedSegment className={isBidirectional ? 'mx-[2px]' : 'ml-[2px]'} />
        <ArrowHead direction="right" />
      </div>

      <div className="mt-[6px] flex w-full items-center gap-[4px]">
        <FormItem
          field={`${fieldPrefix}.id`}
          requiredSymbol={false}
          rules={[
            { required: true, message: '请输入链接 id' },
            ontologyIdentifierValidatorRule
          ]}
          noStyle
          className="!mb-0 min-w-0 flex-1"
        >
          <Input
            placeholder="链接 id"
            size="mini"
            disabled={disabled}
            className="!bg-white text-center !text-[12px]"
          />
        </FormItem>
        <Popover content={ONTOLOGY_IDENTIFIER_EXTRA}>
          <IconQuestionCircle className="shrink-0 cursor-pointer text-[12px] text-[#86909C]" />
        </Popover>
      </div>
    </div>
  );
}
