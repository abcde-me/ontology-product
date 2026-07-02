import { useCallback, useEffect, useMemo, useState } from 'react';
import { Message } from '@arco-design/web-react';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isJointOperationsOntologyName } from '@/data/jointOperationsOntologySeed';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type { OntologScene } from '@/types/ontologySceneApi';

interface UseSceneCenterScenesOptions {
  preferJointOperationsScene?: boolean;
  autoSelectFirst?: boolean;
}

export function useSceneCenterScenes(
  options: UseSceneCenterScenesOptions = {}
) {
  const { preferJointOperationsScene = false, autoSelectFirst = true } =
    options;
  const [loading, setLoading] = useState(true);
  const [scenes, setScenes] = useState<OntologScene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<number>();

  const loadScenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOntologyModel({
        pageNo: 1,
        pageSize: 100,
        order: 'desc',
        orderBy: 'create_time'
      });

      if (isOntologyApiSuccess(res) && res.data?.result) {
        setScenes(res.data.result);
        const preferredScene = preferJointOperationsScene
          ? res.data.result.find((item) =>
              isJointOperationsOntologyName(item.name)
            ) || res.data.result[0]
          : res.data.result[0];
        if (autoSelectFirst && preferredScene?.id) {
          setSelectedSceneId(preferredScene.id);
        }
      }
    } catch {
      Message.error('加载本体场景库失败');
    } finally {
      setLoading(false);
    }
  }, [autoSelectFirst, preferJointOperationsScene]);

  useEffect(() => {
    loadScenes();
  }, [loadScenes]);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId),
    [scenes, selectedSceneId]
  );

  return {
    loading,
    scenes,
    selectedSceneId,
    setSelectedSceneId,
    selectedScene,
    reloadScenes: loadScenes
  };
}
