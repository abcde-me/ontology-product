import { Message } from '@arco-design/web-react';

/** 本体场景库列表页（创建场景入口） */
export const ONTOLOGY_SCENE_LIST_PATH =
  '/tenant/compute/onto/ontologyScene/list';

export const NO_ONTOLOGY_SCENE_TIP =
  '暂无本体场景库，请前往「本体管理 > 本体场景库」创建场景后再试';

export const notifyNoOntologyScene = () => {
  Message.warning({
    content: NO_ONTOLOGY_SCENE_TIP,
    duration: 5000
  });
};
