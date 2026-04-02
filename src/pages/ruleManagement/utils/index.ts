import { CreateAutoRule, MonthDayMode, PeriodType } from '../types/save';
import { AutoRuleFormData } from '@/pages/ruleManagement/types';

export function buildAutoTrigger(data: AutoRuleFormData): CreateAutoRule {
  const { name, description, triggerType, cycle, date, time } = data;

  if (triggerType === 1) {
    const scheduleConfig: CreateAutoRule['scheduleConfig'] = {
      enabled: true,
      time: time || '',
      periodType:
        cycle === 'per_week'
          ? PeriodType.Weekly
          : cycle === 'per_month'
            ? PeriodType.Monthly
            : PeriodType.Daily
    };

    if (cycle === 'per_week') {
      const weekDays = Array.isArray(date)
        ? date.map((item) => Number(item)).filter((item) => !Number.isNaN(item))
        : [];

      if (weekDays.length) {
        scheduleConfig.weekDays = weekDays;
      }
    }

    if (cycle === 'per_month') {
      if (date === 'L') {
        scheduleConfig.monthDayMode = MonthDayMode.Last;
      } else {
        const monthDays = (Array.isArray(date) ? date : [date])
          .map((item) => Number(item))
          .filter((item) => !Number.isNaN(item));

        scheduleConfig.monthDayMode = MonthDayMode.Specific;
        if (monthDays.length) {
          scheduleConfig.monthDays = monthDays;
        }
      }
    }

    return {
      name: name?.trim() || '',
      description: description?.trim(),
      triggerType,
      scheduleConfig
    };
  }

  return {
    name: name?.trim() || '',
    description: description?.trim(),
    triggerType: 0
  };
}

export function buildAutoRule(data: AutoRuleFormData): CreateAutoRule {
  const { triggerType } = data;
  if (triggerType === 1) {
    return buildAutoTrigger(data);
  }
  return {
    name: '',
    triggerType: 0
  };
}
