import { ModelStore } from '../../store/ModelStore';
import { InfoStore } from '../../store/InfoStore';
import { AbilityStore } from '../../store/AbilityStore';
import { KnowStore } from '../../store/KnowStore';
import { WorkflowStore } from '../../store/WorkflowStore';

export class AgentEditor {
  agent_id: string;
  modelStore: ModelStore;
  infoStore: InfoStore;
  abilityStore: AbilityStore;
  knowStore: KnowStore;
  workflowStore: WorkflowStore;
  constructor(agent_id: string) {
    this.agent_id = agent_id;
    this.modelStore = new ModelStore(this); // 模型配置
    this.infoStore = new InfoStore(this); // 应用信息
    this.abilityStore = new AbilityStore(this); // 能力配置
    this.knowStore = new KnowStore(this); // 知识库配置
    this.workflowStore = new WorkflowStore(this); // 工作流配置
  }
}
