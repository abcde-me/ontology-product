import { MemberStore } from '../../store/MemberStore';

export class MemberEditor {
  memberStore: MemberStore;
  constructor() {
    this.memberStore = new MemberStore(this); // 模型配置
  }
}
