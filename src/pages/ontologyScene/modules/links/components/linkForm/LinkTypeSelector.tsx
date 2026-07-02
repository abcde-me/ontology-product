import React from 'react';
import classNames from 'classnames';
import LinkCheckIcon from '../../../../assets/link-check.svg';
import Link1To1Icon from '../../../../assets/link-11.svg';
import Link1ToNIcon from '../../../../assets/link-1n.svg';
import LinkNNIcon from '../../../../assets/link-nn.svg';
import { LinkType } from '../../../../types/link';
import { LINK_TYPE_DESCRIPTIONS, LINK_TYPE_OPTIONS } from './constants';

interface LinkTypeSelectorProps {
  value: LinkType;
  onChange?: (type: LinkType) => void;
  disabled?: boolean;
}

export default function LinkTypeSelector({
  value,
  onChange,
  disabled = false
}: LinkTypeSelectorProps) {
  return (
    <div className="flex gap-[16px]">
      {LINK_TYPE_OPTIONS.map((type) => (
        <div
          key={type}
          className={classNames(
            'relative flex-1 rounded-[4px] border-[1px] p-[16px] transition-all',
            disabled ? 'cursor-default' : 'cursor-pointer',
            value === type
              ? 'border-[#165DFF] bg-[#E8F3FF]'
              : classNames(
                  'border-[#E5E6EB] bg-white',
                  !disabled && 'hover:border-[#165DFF]'
                )
          )}
          onClick={() => {
            if (disabled || !onChange) return;
            onChange(type);
          }}
        >
          {value === type && (
            <LinkCheckIcon className="absolute right-0 top-0" />
          )}
          <div className="flex flex-row items-center gap-[8px]">
            <div className="h-[40px] w-[40px]">
              {type === LinkType.ONE_TO_ONE && <Link1To1Icon />}
              {type === LinkType.ONE_TO_MANY && <Link1ToNIcon />}
              {type === LinkType.MANY_TO_MANY && <LinkNNIcon />}
            </div>
            <div className="flex flex-col gap-[4px]">
              <div className="text-[16px] font-[500] leading-[24px] text-[var(--color-text-1)]">
                {type}
              </div>
              <div className="text-[12px] leading-[18px] text-[var(--color-text-4)]">
                {LINK_TYPE_DESCRIPTIONS[type]}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
