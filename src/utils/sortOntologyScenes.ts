import type { OntologScene } from '@/types/ontologySceneApi';

const resolveCreateTime = (scene: OntologScene): number => {
  const parsed = Date.parse(scene.createTime || '');
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const id = Number(scene.id);
  return Number.isFinite(id) ? id : 0;
};

/** 按创建时间倒序排列，最新创建的场景排在最前（左上角） */
export const sortOntologyScenesByCreateTimeDesc = (
  scenes: OntologScene[]
): OntologScene[] =>
  [...scenes].sort((left, right) => {
    const timeDiff = resolveCreateTime(right) - resolveCreateTime(left);
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return Number(right.id || 0) - Number(left.id || 0);
  });
