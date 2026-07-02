import { buildJointOperationsKnowledgeSeed } from '@/data/jointOperationsKnowledgeSeed';
import type {
  JointAxiom,
  JointKnowledgeBundle,
  JointSceneRule
} from '@/types/jointOperationsKnowledge';

const storageKey = (sceneId: number) =>
  `dev_joint_operations_knowledge_${sceneId}`;

const readBundle = (sceneId: number): JointKnowledgeBundle => {
  try {
    const raw = window.localStorage.getItem(storageKey(sceneId));
    if (!raw) {
      return { axioms: [], sceneRules: [] };
    }
    const parsed = JSON.parse(raw) as JointKnowledgeBundle;
    return {
      axioms: Array.isArray(parsed.axioms) ? parsed.axioms : [],
      sceneRules: Array.isArray(parsed.sceneRules) ? parsed.sceneRules : []
    };
  } catch {
    return { axioms: [], sceneRules: [] };
  }
};

const writeBundle = (sceneId: number, bundle: JointKnowledgeBundle) => {
  window.localStorage.setItem(storageKey(sceneId), JSON.stringify(bundle));
};

export const ensureJointOperationsKnowledge = (
  sceneId: number
): JointKnowledgeBundle => {
  const existing = readBundle(sceneId);
  if (existing.axioms.length > 0 || existing.sceneRules.length > 0) {
    return existing;
  }

  const seed = buildJointOperationsKnowledgeSeed(sceneId);
  writeBundle(sceneId, seed);
  return seed;
};

export const getJointOperationsKnowledge = (
  sceneId: number
): JointKnowledgeBundle => ensureJointOperationsKnowledge(sceneId);

export const saveJointAxiom = (
  sceneId: number,
  axiom: JointAxiom
): JointAxiom => {
  const bundle = ensureJointOperationsKnowledge(sceneId);
  const index = bundle.axioms.findIndex((item) => item.id === axiom.id);
  const next = [...bundle.axioms];
  if (index >= 0) {
    next[index] = axiom;
  } else {
    next.unshift(axiom);
  }
  writeBundle(sceneId, { ...bundle, axioms: next });
  return axiom;
};

export const saveJointSceneRule = (
  sceneId: number,
  rule: JointSceneRule
): JointSceneRule => {
  const bundle = ensureJointOperationsKnowledge(sceneId);
  const index = bundle.sceneRules.findIndex((item) => item.id === rule.id);
  const next = [...bundle.sceneRules];
  if (index >= 0) {
    next[index] = rule;
  } else {
    next.unshift(rule);
  }
  writeBundle(sceneId, { ...bundle, sceneRules: next });
  return rule;
};

export const deleteJointAxiom = (sceneId: number, axiomId: string) => {
  const bundle = ensureJointOperationsKnowledge(sceneId);
  writeBundle(sceneId, {
    ...bundle,
    axioms: bundle.axioms.filter((item) => item.id !== axiomId),
    sceneRules: bundle.sceneRules.map((rule) => ({
      ...rule,
      linkedAxiomIds: rule.linkedAxiomIds?.filter((id) => id !== axiomId)
    }))
  });
};

export const deleteJointSceneRule = (sceneId: number, ruleId: string) => {
  const bundle = ensureJointOperationsKnowledge(sceneId);
  writeBundle(sceneId, {
    ...bundle,
    sceneRules: bundle.sceneRules.filter((item) => item.id !== ruleId)
  });
};

export const findJointAxiomByName = (
  sceneId: number,
  name: string
): JointAxiom | undefined => {
  const normalized = name.trim().toLowerCase();
  return ensureJointOperationsKnowledge(sceneId).axioms.find(
    (item) => item.name.trim().toLowerCase() === normalized
  );
};

export const findJointSceneRuleByName = (
  sceneId: number,
  name: string
): JointSceneRule | undefined => {
  const normalized = name.trim().toLowerCase();
  return ensureJointOperationsKnowledge(sceneId).sceneRules.find(
    (item) => item.name.trim().toLowerCase() === normalized
  );
};
