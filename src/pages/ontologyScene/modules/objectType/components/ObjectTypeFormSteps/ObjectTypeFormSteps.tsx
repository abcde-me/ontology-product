import React from 'react';
import classNames from 'classnames';
import styles from '../ObjectTypeForm.module.scss';

interface ObjectTypeFormStepsProps {
  currentStep: number;
  className?: string;
  /** 未传时为三步（含实例同步）；CSV 等场景可传两步 */
  steps?: string[];
}

const DEFAULT_STEPS = ['基本信息', '属性信息', '实例同步'];

export default function ObjectTypeFormSteps({
  currentStep,
  className,
  steps: stepsProp
}: ObjectTypeFormStepsProps) {
  const steps = stepsProp ?? DEFAULT_STEPS;

  return (
    <div className={classNames(styles['object-type-form-steps'], className)}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <React.Fragment key={`${label}-${index}`}>
            <div className="flex items-center gap-[12px]">
              <div
                className={classNames(
                  'flex h-[24px] w-[24px] items-center justify-center rounded-full text-[14px] font-[500]',
                  isCompleted
                    ? 'bg-[#E8F3FF] text-[#165DFF]'
                    : isActive
                      ? 'bg-[#165DFF] text-white'
                      : 'bg-[#F2F3F5] text-[#86909C]'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={classNames(
                  'whitespace-nowrap text-[14px]',
                  isActive
                    ? 'font-[600] text-[#165DFF]'
                    : isCompleted
                      ? 'font-[400] text-[#165DFF]'
                      : 'font-[400] text-[var(--color-text-3)]'
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={classNames(
                  'mx-[16px] h-px flex-1',
                  isCompleted ? 'bg-[#165DFF]' : 'bg-[#E5E6EB]'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
