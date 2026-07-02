import { Message } from '@arco-design/web-react';
import { RELATION_INSIGHT_FAVORITE_KEY } from '../constants';
import type { RelationInsightFavorite, SelectedObjectContext } from '../types';

const readFavorites = (): RelationInsightFavorite[] => {
  try {
    const raw = localStorage.getItem(RELATION_INSIGHT_FAVORITE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeFavorites = (items: RelationInsightFavorite[]) => {
  localStorage.setItem(RELATION_INSIGHT_FAVORITE_KEY, JSON.stringify(items));
};

export const buildFavoriteId = (context: SelectedObjectContext) =>
  `${context.sceneId}-${context.objectTypeId}-${context.instanceId}`;

export const isFavorite = (context: SelectedObjectContext | null): boolean => {
  if (!context) {
    return false;
  }

  const favoriteId = buildFavoriteId(context);
  return readFavorites().some((item) => item.id === favoriteId);
};

export const toggleFavorite = (
  context: SelectedObjectContext
): { favorited: boolean; items: RelationInsightFavorite[] } => {
  const favoriteId = buildFavoriteId(context);
  const current = readFavorites();
  const exists = current.some((item) => item.id === favoriteId);

  if (exists) {
    const next = current.filter((item) => item.id !== favoriteId);
    writeFavorites(next);
    Message.success('已取消收藏');
    return { favorited: false, items: next };
  }

  const nextItem: RelationInsightFavorite = {
    id: favoriteId,
    sceneId: context.sceneId,
    sceneName: context.sceneName,
    objectTypeId: context.objectTypeId,
    objectTypeName: context.objectTypeName,
    instanceId: context.instanceId,
    instanceLabel: context.instanceLabel,
    createdAt: Date.now()
  };

  const next = [nextItem, ...current].slice(0, 20);
  writeFavorites(next);
  Message.success('已加入收藏');
  return { favorited: true, items: next };
};
