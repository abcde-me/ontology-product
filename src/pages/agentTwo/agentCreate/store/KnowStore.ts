// KnowStore.ts
import { Model } from '@/models';
import { AgentEditor } from '../compontents/AgentProvider/Agent';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { getDatasetsList } from '@/api/datasetsV2';

interface InfoStoreState {
  list: DataSet[]; // 表格数据
  selectedList: DataSet[]; // 已选择的数据
  loading: boolean;
  total: number;
  policyFormVisible: boolean;
  selectedKnowledge: any;
  policyValues: any;
  modalVisible: boolean;
}

export class KnowStore extends Model<InfoStoreState> {
  constructor(public agent: AgentEditor) {
    super({
      state: {
        modalVisible: false,
        list: [],
        selectedList: [],
        loading: false,
        total: 0,
        policyFormVisible: false,
        selectedKnowledge: {},
        policyValues: {
           search_method: 'hybrid_search',
          weights: 0.6,
          reranking_enable: true,
          top_k: 6,
          score_threshold_enabled: true,
          score_threshold: 0.10
        }
      }
    });
  }
  setModalVisible = (visible: boolean) => {
    this.setState({
      modalVisible: visible
    });
  };

  // 设置策略配置
  setPolicyValues = (values: any) => {
    this.setState({
      policyValues: values
    });
  };

  // 添加数据
  addToKnowList = (record: DataSet) => {
    const newSelectedList = [...this.state.selectedList, record];
    console.log('newSelectedList', newSelectedList);
    this.setState({
      selectedList: newSelectedList
    });
    console.log('state after update', this.state.selectedList);
  };

  setSelectedList = (list: DataSet[]) => {
    this.setState({
      selectedList: list
    });
  };

  // 移除数据
  removeFromKnowList = (id: string) => {
    const newSelectedList = this.state.selectedList.filter(
      (item) => item.id !== id
    );
    this.setState({
      selectedList: newSelectedList
    });
    console.log('state after remove', this.state.selectedList);
  };

  // 设置表格数据
  setList = (list: DataSet[]) => {
    this.setState({
      list
    });
  };
  // 设置策略表单可见性
  setPolicyFormVisible = (visible: boolean) => {
    this.setState({
      policyFormVisible: visible
    });
  };
  // 设置选中的知识
  setSelectedKnowledge = (knowledge: any) => {
    this.setState({
      selectedKnowledge: knowledge
    });
  };
}
