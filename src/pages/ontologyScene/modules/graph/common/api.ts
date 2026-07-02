const computeHashSync = (jsonObject: any) => {
  const jsonString = JSON.stringify(jsonObject);

  let hash = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(16).padStart(8, '0');
};

const draftBySceneId = new Map<number, Record<string, unknown>>();
let activeSceneId: number | null = null;

const notFoundResponse = () =>
  Promise.resolve({
    code: 'ResourceNotFound',
    data: null,
    message: ''
  });

export const setActiveWorkflowSceneId = (sceneId: number | null) => {
  activeSceneId =
    sceneId != null && Number.isFinite(sceneId) && sceneId > 0 ? sceneId : null;
};

export const setDraft = (
  draft: Record<string, unknown> | null,
  sceneId?: number
) => {
  const resolvedSceneId = sceneId ?? activeSceneId;
  if (resolvedSceneId == null) {
    return;
  }

  if (draft == null) {
    draftBySceneId.delete(resolvedSceneId);
    return;
  }

  draftBySceneId.set(resolvedSceneId, draft);
};

const getWorkflow = () => {
  if (activeSceneId == null) {
    return notFoundResponse();
  }

  const draft = draftBySceneId.get(activeSceneId);
  return draft ? Promise.resolve({ data: draft as any }) : notFoundResponse();
};

const persistDraft = (args: Record<string, unknown>) => {
  if (activeSceneId == null) {
    return Promise.resolve({ data: args as any });
  }

  const draft = {
    ...args,
    updated_at: Math.ceil(Date.now() / 1000)
  } as Record<string, unknown> & { hash?: string };
  draft.hash = computeHashSync(draft);
  draftBySceneId.set(activeSceneId, draft);
  return Promise.resolve({ data: draft as any });
};

const createWorkflow = (args: Record<string, unknown>) => {
  return persistDraft(args);
};

const updateWorkflow = (args: Record<string, unknown>) => {
  return persistDraft(args);
};

export { getWorkflow, createWorkflow, updateWorkflow };
