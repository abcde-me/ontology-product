import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';

export interface SceneQueryOption {
  label: string;
  value: string;
}

export const fetchSceneQueryOptions = async (): Promise<SceneQueryOption[]> => {
  const res = await listOntologyModel({
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });

  if (res.status !== 200 || res.code !== '') {
    return [];
  }

  return (res.data?.result || []).map((scene) => ({
    label: scene.name || '未命名场景',
    value: scene.name || '未命名场景'
  }));
};
