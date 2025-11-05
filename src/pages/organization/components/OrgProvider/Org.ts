import { OrgStore } from '../../store/OrgStore';

export class OrgEditor {
  orgStore: OrgStore;
  constructor() {
    this.orgStore = new OrgStore(this); // 模型配置
  }
}
