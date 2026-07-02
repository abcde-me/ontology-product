import type { OntologyFunctionVersion } from '@/types/ontologyFunctionVersion';
import {
  getNextSceneVersionLabel,
  isHistoricalSavedVersion,
  isNewestSavedVersion
} from './ontologySceneVersionLabel';

type VersionWithLabel = { label: string };

export const getNextFunctionVersionLabel = (
  versions: OntologyFunctionVersion[] = []
) => getNextSceneVersionLabel(versions as VersionWithLabel[] as never);

export const isNewestFunctionVersion = (
  versionId: string | undefined,
  versions: OntologyFunctionVersion[] = []
) => isNewestSavedVersion(versionId, versions as never[]);

export const isHistoricalFunctionVersion = (
  versionId: string | undefined,
  versions: OntologyFunctionVersion[] = []
) => isHistoricalSavedVersion(versionId, versions as never[]);
