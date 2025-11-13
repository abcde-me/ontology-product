import type { CommonNodeType } from '@/pages/workflowConfig/workflow/types';
import { VarType } from '@/pages/workflowConfig/workflow/types';

const getDefaultValueByType = (type: VarType) => {
  if (type === VarType.string) return '';

  if (type === VarType.number) return 0;

  if (type === VarType.object) return '{}';

  if (
    type === VarType.arrayObject ||
    type === VarType.arrayString ||
    type === VarType.arrayNumber ||
    type === VarType.arrayFile
  )
    return '[]';

  return '';
};

export const getDefaultValue = (data: CommonNodeType) => {
  return [];
};
