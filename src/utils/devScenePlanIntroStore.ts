import type {
  ScenePlanIntro,
  ScenePlanIntroPageKey
} from '@/types/scenePlanIntro';

const storageKey = (pageKey: ScenePlanIntroPageKey, sceneId: number) =>
  `dev_scene_plan_intro_${pageKey}_${sceneId}`;

export const getScenePlanIntro = (
  pageKey: ScenePlanIntroPageKey,
  sceneId: number
): ScenePlanIntro => {
  try {
    const raw = window.localStorage.getItem(storageKey(pageKey, sceneId));
    if (!raw) {
      return { content: '' };
    }
    const parsed = JSON.parse(raw) as ScenePlanIntro;
    return {
      content: typeof parsed.content === 'string' ? parsed.content : '',
      updateTime: parsed.updateTime
    };
  } catch {
    return { content: '' };
  }
};

export const saveScenePlanIntro = (
  pageKey: ScenePlanIntroPageKey,
  sceneId: number,
  content: string
): ScenePlanIntro => {
  const data: ScenePlanIntro = {
    content,
    updateTime: new Date().toISOString()
  };
  window.localStorage.setItem(
    storageKey(pageKey, sceneId),
    JSON.stringify(data)
  );
  return data;
};
