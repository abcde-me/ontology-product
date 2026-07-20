import { listOntologyLinkType } from '@/api/ontologySceneLibrary/graph';
import { createLinkOnGraph } from '@/pages/ontologyScene/modules/graph/services/graphCreateServices';
import { LinkType } from '@/types/graphApi';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import { DISCOVERY_ALGORITHM_LABEL } from '../constants';
import type {
  DiscoveredImplicitRelation,
  ImplicitDiscoveryAlgorithm
} from '../types';

export interface AttachDiscoveriesToOntologyInput {
  sceneId: number;
  taskName?: string;
  discoveries: DiscoveredImplicitRelation[];
}

export interface CreatedOntologyLink {
  id?: number;
  name: string;
  code: string;
  sourceObjectTypeId: number;
  targetObjectTypeId: number;
}

export interface AttachDiscoveriesToOntologyResult {
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  createdLinks: CreatedOntologyLink[];
}

interface OntologyLinkCandidate {
  sourceObjectTypeId: number;
  targetObjectTypeId: number;
  suggestedName: string;
  algorithm: ImplicitDiscoveryAlgorithm;
  confidence: number;
  evidenceSummary?: string;
}

const buildCandidateKey = (candidate: {
  sourceObjectTypeId: number;
  targetObjectTypeId: number;
  suggestedName: string;
}) =>
  `${candidate.sourceObjectTypeId}|${candidate.targetObjectTypeId}|${candidate.suggestedName.trim().toLowerCase()}`;

const dedupeDiscoveries = (
  discoveries: DiscoveredImplicitRelation[]
): OntologyLinkCandidate[] => {
  const map = new Map<string, OntologyLinkCandidate>();

  discoveries.forEach((discovery) => {
    if (
      discovery.sourceObjectTypeId == null ||
      discovery.targetObjectTypeId == null
    ) {
      return;
    }

    const suggestedName = discovery.suggestedName.trim();
    if (!suggestedName) {
      return;
    }

    const key = buildCandidateKey({
      sourceObjectTypeId: discovery.sourceObjectTypeId,
      targetObjectTypeId: discovery.targetObjectTypeId,
      suggestedName
    });
    const existing = map.get(key);
    if (existing) {
      existing.confidence = Math.max(existing.confidence, discovery.confidence);
      return;
    }

    map.set(key, {
      sourceObjectTypeId: discovery.sourceObjectTypeId,
      targetObjectTypeId: discovery.targetObjectTypeId,
      suggestedName,
      algorithm: discovery.algorithm,
      confidence: discovery.confidence,
      evidenceSummary: discovery.evidence?.[0]?.title
    });
  });

  return Array.from(map.values());
};

const linkPairKey = (sourceId: number, targetId: number, name: string) =>
  `${sourceId}|${targetId}|${name.trim().toLowerCase()}`;

export const attachDiscoveriesToOntology = async (
  input: AttachDiscoveriesToOntologyInput
): Promise<AttachDiscoveriesToOntologyResult> => {
  const validDiscoveries = input.discoveries.filter(
    (discovery) =>
      discovery.sourceObjectTypeId != null &&
      discovery.targetObjectTypeId != null &&
      discovery.suggestedName.trim()
  );
  const invalidCount = input.discoveries.length - validDiscoveries.length;
  const candidates = dedupeDiscoveries(validDiscoveries);
  if (!candidates.length) {
    return {
      createdCount: 0,
      skippedCount: input.discoveries.length,
      failedCount: 0,
      createdLinks: []
    };
  }

  const listRes = await listOntologyLinkType({
    ontologyModelID: input.sceneId,
    pageNo: 1,
    pageSize: -1
  });

  const existingLinks = isOntologyApiSuccess(listRes)
    ? listRes.data?.result || []
    : [];

  const existingPairNames = new Set(
    existingLinks
      .filter(
        (item) =>
          item.sourceObjectTypeID != null && item.targetObjectTypeID != null
      )
      .map((item) =>
        linkPairKey(
          item.sourceObjectTypeID as number,
          item.targetObjectTypeID as number,
          item.name || item.code || ''
        )
      )
  );

  const reservedCodes = existingLinks
    .map((item) => item.code)
    .filter(Boolean) as string[];

  let createdCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const createdLinks: CreatedOntologyLink[] = [];

  for (const candidate of candidates) {
    const pairKey = linkPairKey(
      candidate.sourceObjectTypeId,
      candidate.targetObjectTypeId,
      candidate.suggestedName
    );

    if (existingPairNames.has(pairKey)) {
      skippedCount += 1;
      continue;
    }

    const algoLabel = DISCOVERY_ALGORITHM_LABEL[candidate.algorithm];
    const description = [
      input.taskName ? `来源任务：${input.taskName}` : undefined,
      `由关系挖掘发现，算法：${algoLabel}`,
      `置信度 ${(candidate.confidence * 100).toFixed(0)}%`,
      candidate.evidenceSummary
        ? `依据：${candidate.evidenceSummary}`
        : undefined
    ]
      .filter(Boolean)
      .join('；');

    try {
      const { response, code } = await createLinkOnGraph({
        name: candidate.suggestedName,
        description,
        ontologyModelID: input.sceneId,
        sourceObjectTypeID: candidate.sourceObjectTypeId,
        targetObjectTypeID: candidate.targetObjectTypeId,
        type: LinkType.ONE_TO_ONE,
        reservedCodes
      });

      if (!isOntologyApiSuccess(response)) {
        failedCount += 1;
        continue;
      }

      const createdId = Number(response.data?.id ?? 0);
      createdCount += 1;
      existingPairNames.add(pairKey);
      reservedCodes.push(code);
      createdLinks.push({
        id: Number.isFinite(createdId) && createdId > 0 ? createdId : undefined,
        name: candidate.suggestedName,
        code,
        sourceObjectTypeId: candidate.sourceObjectTypeId,
        targetObjectTypeId: candidate.targetObjectTypeId
      });
    } catch {
      failedCount += 1;
    }
  }

  skippedCount += invalidCount;

  return {
    createdCount,
    skippedCount,
    failedCount,
    createdLinks
  };
};
