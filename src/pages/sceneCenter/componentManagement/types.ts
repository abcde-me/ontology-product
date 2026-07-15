export type ComponentCategory =
  | 'geo'
  | 'time'
  | 'chart'
  | 'data'
  | 'graph'
  | 'interaction'
  | 'content';

export type ComponentStatus = 'available' | 'planned';

export type AppComponentItem = {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  tags: string[];
  status: ComponentStatus;
  reference?: string;
};
