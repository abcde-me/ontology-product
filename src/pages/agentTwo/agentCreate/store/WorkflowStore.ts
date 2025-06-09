// KnowStore.ts
import { Model } from '@/models';
import { AgentEditor } from '../compontents/AgentProvider/Agent';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { getAppsList } from '@/api/appsV2';

interface InfoStoreState {
  list: DataSet[]; // 表格数据
  selectedList: DataSet[]; // 已选择的数据
  loading: boolean;
  total: number;
  modalVisible: boolean;
}

export class WorkflowStore extends Model<InfoStoreState> {
  constructor(public agent: AgentEditor) {
    super({
      state: {
        list: [],
        selectedList: [],
        loading: false,
        total: 0,
        modalVisible: false
      }
    });
  }
  setModalVisible = (visible: boolean) => {
    this.setState({
      modalVisible: visible
    });
  };

  // 添加数据
  addToKnowList = (record: DataSet) => {
    const newSelectedList = [...this.state.selectedList, record];
    this.setState({
      selectedList: newSelectedList
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
  };

  // 设置表格数据
  setList = (list: DataSet[]) => {
    this.setState({
      list
    });
  };
  setSelectedList = (list: DataSet[]) => {
    this.setState({
      selectedList: list
    });
  };
}
