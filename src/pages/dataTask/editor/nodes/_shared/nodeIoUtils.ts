import type {
  DataTaskNodeInputField,
  DataTaskNodeOutputField
} from '../../types';

export const DATA_TASK_OUTPUT_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Integer', value: 'integer' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Object', value: 'object' },
  { label: 'Array', value: 'array' },
  { label: 'Array[String]', value: 'array[string]' },
  { label: 'Array[Object]', value: 'array[object]' },
  { label: 'Any', value: 'any' }
];

export const normalizeOutputFields = (
  value: unknown
): DataTaskNodeOutputField[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const variable = String(
        record.variable ?? record.name ?? record.key ?? ''
      ).trim();
      if (!variable) {
        return null;
      }
      return {
        variable,
        type: String(record.type || 'string'),
        des: String(record.des ?? record.label ?? record.comment ?? '')
      };
    })
    .filter(Boolean) as DataTaskNodeOutputField[];
};

export const normalizeInputFields = (
  value: unknown
): DataTaskNodeInputField[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const variable = String(record.variable ?? '').trim();
      const valueSelector = Array.isArray(record.value_selector)
        ? record.value_selector.map(String)
        : [];
      if (!variable && !valueSelector.length) {
        return null;
      }
      return {
        variable:
          variable || String(valueSelector[valueSelector.length - 1] || ''),
        value_selector: valueSelector,
        label: typeof record.label === 'string' ? record.label : undefined
      };
    })
    .filter(Boolean) as DataTaskNodeInputField[];
};

export const collectUsedVarSelectors = (variables: unknown): string[][] => {
  return normalizeInputFields(variables)
    .map((item) => item.value_selector)
    .filter((selector) => selector.length > 0);
};

export const replaceUsedVarSelectors = (
  variables: unknown,
  oldSelector: string[],
  newSelector: string[]
): DataTaskNodeInputField[] => {
  const oldKey = oldSelector.join('.');
  return normalizeInputFields(variables).map((item) => {
    if (item.value_selector.join('.') !== oldKey) {
      return item;
    }
    return {
      ...item,
      value_selector: [...newSelector],
      variable:
        item.variable ||
        String(newSelector[newSelector.length - 1] || item.variable)
    };
  });
};

export const createEmptyOutputField = (
  index: number
): DataTaskNodeOutputField => ({
  variable: `field_${index + 1}`,
  type: 'string',
  des: ''
});

export const createEmptyInputField = (): DataTaskNodeInputField => ({
  variable: '',
  value_selector: []
});
