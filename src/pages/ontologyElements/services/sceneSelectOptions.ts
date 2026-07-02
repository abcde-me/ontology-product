import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import type { SceneSelectOption } from '../types';

export const fetchSceneSelectOptions = async (): Promise<
  SceneSelectOption[]
> => {
  const res = await listOntologyModel({
    pageNo: -1,
    pageSize: -1,
    order: 'desc'
  });

  if (res.status !== 200 || res.code !== '') {
    return [];
  }

  return (res.data?.result || [])
    .filter((scene) => scene.id != null)
    .map((scene) => ({
      label: scene.name || '未命名场景',
      value: Number(scene.id)
    }));
};
