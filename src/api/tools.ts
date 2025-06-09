import UAPI from '@/api';
import {
  CustomCollectionBackend,
  DebugToolData,
  ToolCredential
} from '@/utils/type';

export function getBuiltInToolList(providerName: string) {
  return UAPI.RES.builtIntoolsList({ provider: providerName })
    .get()
    .inRegion()
    .do();
}
export function getCustomToolList(provider: string) {
  return UAPI.RES.customToolsList({ provider }).get().inRegion().do();
}
export function getToolProviders() {
  return UAPI.RES.toolsProviders({}).get().inRegion().do();
}

export function getMyToolProviders() {
  return UAPI.RES.myToolsProviders({}).get().inRegion().do();
}

export function addTool(data) {
  return UAPI.RES.addTool({}).post(data).inRegion().do();
}

export function updateTool(data) {
  return UAPI.RES.updateTool({}).post(data).inRegion().do();
}

export async function collectionDetail(
  provider: string
): Promise<CustomCollectionBackend> {
  const res: CustomCollectionBackend = await UAPI.RES.collectionDetail({})
    .get({ provider })
    .inRegion()
    .do();
  res.provider = provider;
  res.name = provider;
  return res;
}

export async function debugTool(data: DebugToolData) {
  const res: CustomCollectionBackend = await UAPI.RES.debugTool({})
    .post(data)
    .inRegion()
    .do();
  return res;
}

export async function deleteTool(provider: string) {
  const res: CustomCollectionBackend = await UAPI.RES.deleteTool({})
    .post({ provider })
    .inRegion()
    .do();
  return res;
}

export async function getToolCredentialSchema(
  collectionName: string
): Promise<ToolCredential[]> {
  const res: ToolCredential[] = await UAPI.RES.toolCredentialSchema({
    collectionName
  })
    .get({})
    .inRegion()
    .do();
  return res;
}

export const updateBuiltInToolCredential = (
  collectionName: string,
  credential: Record<string, any>
) => {
  return UAPI.RES.toolCredentialUpdate({ collectionName })
    .post({ credentials: credential })
    .inRegion()
    .do();
};

export const removeBuiltInToolCredential = (collectionName: string) => {
  return UAPI.RES.toolCredentialDelete({ collectionName })
    .post({})
    .inRegion()
    .do();
};

export const publishTool = (provider: string) => {
  return UAPI.RES.toolPublish({})
    .post({
      provider,
      original_provider: provider
    })
    .inRegion()
    .do();
};
