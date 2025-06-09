import { Model } from '@/models';
import { AgentEditor } from '../compontents/AgentProvider/Agent';
import { PROLOGUE_SYSTEM_PROMPT, RECOMMEND_SYSTEM_PROMPT } from '../constants';
import { aiGenerate } from '@/api/appsV2';
interface RecommendItem {
  id: string;
  value: string;
}

interface AbilityStoreState {
  prologue: string;
  prologueStatus: boolean;
  recommend: RecommendItem[];
  recommendStatus: boolean;
}

export class AbilityStore extends Model<AbilityStoreState> {
  constructor(public agent: AgentEditor) {
    super({
      state: {
        prologue: '', // 开场白
        prologueStatus: false, // 开场白状态
        recommend: [{ value: '', id: Date.now().toString() + Math.random() }], // 推荐问
        recommendStatus: false // 推荐问状态
      }
    });
  }
  // 设置开场白状态
  setPrologueStatus(status: boolean) {
    this.setState({
      prologueStatus: status
    });
  }
  // AI生成开场白
  generatePrologue() {
    this.setPrologueStatus(true);
    setTimeout(() => {
      this.fetchPrologue();
      this.setPrologueStatus(false);
    }, 2000);
  }
  fetchPrologue(options?: { prologueStatus?: boolean }) {
    const { prologueStatus = true } = options || {};
    return this.asyncManager('fetchPrologue', {
      showLoading: prologueStatus
    }).exec(() => {
      const { agentName, agentDesc } = this.agent.infoStore.getState();
      const data = {
        app_name: agentName,
        app_description: agentDesc,
        type: 'opening_statement',
        pre_prompt: '',
        stream: false
      };
      return aiGenerate(data).then((res) => {
        console.log('res', res);
        this.setPrologueStatus(false);
        this.agent.infoStore.updateAgentConfigData(this.agent.agent_id);
        return {
          prologue: res.data
        };
      });
    });
  }
  // 修改开场白
  setPrologue(prologue: string) {
    this.setState({
      prologue: prologue
    });
  }
  // 设置推荐问状态
  setRecommendStatus(status: boolean) {
    this.setState({
      recommendStatus: status
    });
  }
  // AI生成推荐问
  generateRecommend() {
    this.setRecommendStatus(true);
    this.fetchRecommend();
  }
  // 修改推荐问
  setRecommend(recommend: any[]) {
    this.setState({
      recommend: recommend
    });
  }
  fetchRecommend(options?: { showLoading?: boolean }) {
    const { showLoading = true } = options || {};
    return this.asyncManager('fetchRecommend', {
      showLoading
    }).exec(() => {
      const { agentName, agentDesc } = this.agent.infoStore.getState();
      const data = {
        app_name: agentName,
        app_description: agentDesc,
        type: 'suggested_questions',
        pre_prompt: '',
        stream: false
      };
      return aiGenerate(data).then((res) => {
        this.setRecommendStatus(false);
        console.log('res', JSON.parse(res.data));
        const recommendList = JSON.parse(res.data).map((item) => ({
          value: item,
          id: Date.now().toString() + Math.random()
        }));
        this.setState({
          recommend: recommendList
        });
        this.agent.infoStore.updateAgentConfigData(this.agent.agent_id);
        return {
          recommend: recommendList
        };
      });
    });
  }
}
