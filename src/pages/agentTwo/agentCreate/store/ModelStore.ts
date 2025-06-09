import { Model } from '@/models';
import { AgentEditor } from '../compontents/AgentProvider/Agent';
import { getModelsList } from '@/api/appsV2';
interface ModelStoreState {
  modelName: string;
  top_p: number;
  temperature: number;
  modelList: any;
  provider: string;
}

export class ModelStore extends Model<ModelStoreState> {
  constructor(public agent: AgentEditor) {
    super({
      state: {
        modelName: '',
        top_p: 0.0001,
        temperature: 0.0001,
        modelList: [],
        provider: ''
      }
    });
  }

  // 设置初始数据
  setModelFormData(data: any) {
    this.setState({
      ...this.state,
      ...data
    });
  }
  setModelList(list){
    this.setState({
      modelList: list
    });
  }
  setModelName(name){
    this.setState({
      modelName: name
    })
  }
  // 获取大模型列表
  fetchData = (value: string) => {
    this.asyncManager('fetchData').exec(() => {
      return getModelsList(value)
        .then((response) => {
          return {
            modelList: response?.data?.data,
            modelName: response.data.data[0]?.model_name
          };
        })
        .catch((error) => {
          throw error;
        });
    });
  };
}
