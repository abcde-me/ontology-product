import { ensureSpatiotemporalDemoOntology } from '@/services/spatiotemporalOntologyBootstrap';
import { toAnalysisScope } from './scopeInstances';
import type {
  CreateImplicitRelationTaskInput,
  ImplicitAnalysisScope,
  ImplicitRelationUsageScenario
} from '../types';

export const buildScenarioScopeDraft = async (
  scenario: ImplicitRelationUsageScenario
): Promise<Partial<ImplicitAnalysisScope>> => {
  try {
    const demo = await ensureSpatiotemporalDemoOntology();
    const objectTypes = demo.objectTypes.filter((item) =>
      scenario.objectTypeCodes.includes(item.code)
    );

    if (!objectTypes.length) {
      return {
        instanceMode: 'all',
        objectTypes: [],
        instances: []
      };
    }

    return {
      ontologySceneId: demo.sceneId,
      ontologySceneName: demo.sceneName,
      objectTypes: objectTypes.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code
      })),
      instanceMode: 'all',
      instances: []
    };
  } catch {
    return {
      instanceMode: 'all',
      objectTypes: [],
      instances: []
    };
  }
};

export const buildScenarioTaskInput = async (
  scenario: ImplicitRelationUsageScenario
): Promise<CreateImplicitRelationTaskInput> => {
  const scopeDraft = await buildScenarioScopeDraft(scenario);
  const scope = toAnalysisScope(scopeDraft);

  return {
    name: scenario.defaultTaskName,
    description: scenario.defaultDescription,
    algorithm: scenario.algorithm,
    ...(scope ? { scope } : {})
  };
};
