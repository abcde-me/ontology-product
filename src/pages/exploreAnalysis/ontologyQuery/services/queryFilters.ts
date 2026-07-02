import { SCENE_QUERY_ALL_VALUE } from '../constants';

export const matchSceneName = (
  rowSceneName: string | undefined,
  filter?: string
) => {
  if (!filter || filter === SCENE_QUERY_ALL_VALUE) {
    return true;
  }

  return (rowSceneName || '') === filter;
};
