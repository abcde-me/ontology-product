import { create } from 'zustand';

// 定义状态的类型
interface Store {
  tagVisible: boolean;
  editId: string;
  ControlVisible: string;
  tagList: any[];
  tagListArr: any[];
  // 文档标签存储
  docTagLiist: any[];
  // 树组件选择之后回显的tag标签
  treeTagList: any[];
  // 树组件传递数据tag标签---主要用于切片分段
  toTreeTagList: any[];
  // 开关详情控制
  switchTag: string;
  //开关
  switchTagVisible: boolean;
  // 带有开关数据间选择tag标签
  swirchTagList: any[];
  PolicyVisiable: any;
  onHandTagList: (netTagList: any) => void;
  onHandTagArrList: (netTagList: any) => void;
  onTagVisible: (visible: boolean) => void;
  onControlVisible: (visible: string, edit?: string) => void;
  onHandTreeTag: (newTreeTagList: any[]) => void;
  onHandDocTagLiist: (newTreeTagList: any[]) => void;
  onSwitchTag: (newSwitchTag: string) => void;
  onSwitchTagVisible: (visible: boolean) => void;
  onHandToTreeTag: (newToTreeTagList: any[]) => void;
  onHandSwitchTreeTag: (newSwirchTagList: any[]) => void;
  onHandPolicyVisiable: (newPolicyVisiable: any) => void;
}

// 创建状态管理仓库
const useTagEment = create<Store>((set) => ({
  tagVisible: false,
  PolicyVisiable: {},
  ControlVisible: '',
  editId: '',
  treeTagList: [],
  toTreeTagList: [],
  docTagLiist: [],
  switchTag: '',
  switchTagVisible: false,
  swirchTagList: [],
  tagListArr: [],
  tagList: [],
  onHandTagList(netTagList) {
    set({ tagList: netTagList });
  },
  onHandTagArrList(netTagArrList) {
    set({ tagListArr: netTagArrList });
  },
  onTagVisible(visible: boolean) {
    set({ tagVisible: visible });
  },
  onControlVisible(visible: string, edit?: string) {
    set({ ControlVisible: visible, editId: edit });
  },
  onHandTreeTag(newTreeTagList) {
    set({ treeTagList: newTreeTagList });
  },
  onSwitchTag(newSwitchTag) {
    set({ switchTag: newSwitchTag });
  },
  onSwitchTagVisible(visible) {
    set({ switchTagVisible: visible });
  },
  onHandToTreeTag(newToTreeTagList) {
    set({ toTreeTagList: newToTreeTagList });
  },
  onHandSwitchTreeTag(newSwirchTagList) {
    set({ swirchTagList: newSwirchTagList });
  },
  onHandDocTagLiist(newDocTagList) {
    set({ docTagLiist: newDocTagList });
  },
  onHandPolicyVisiable(newPolicyVisiable) {
    set({ PolicyVisiable: newPolicyVisiable });
  }
}));

export default useTagEment;
