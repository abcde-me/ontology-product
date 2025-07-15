// KnowStore.ts
import {
  createUser,
  deleteUser,
  getOrganizationTree,
  getRoleData,
  getUsers,
  banUser,
  updateUser,
  searchMemberUsers
} from '@/api/user';
import { Model } from '@/models';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { MemberEditor } from '../components/MemberProvider/Member';

interface InfoStoreState {
  list: DataSet[]; // 表格数据
  loading: boolean;
  total: number;
  visible: boolean;
  // 当前编辑的成员
  currentMember: DataSet | null;
  // 组织树数据
  orgData?: any[]; // 组织树数据
  roleData: any[]; // 角色
  // 当前搜索参数
  searchParams: Record<string, any>;
  preDeleteVisible: boolean;
}

export class MemberStore extends Model<InfoStoreState> {
  constructor(public member: MemberEditor) {
    super({
      state: {
        list: [],
        loading: false,
        total: 0,
        visible: false,
        currentMember: null,
        orgData: [],
        roleData: [],
        searchParams: {},
        preDeleteVisible: false
      }
    });
  }

  setPreDeleteVisible = (visible: boolean) => {
    this.setState({
      preDeleteVisible: visible
    });
  };

  // 设置当前编辑的成员
  setCurrentMember = (member: DataSet | null) => {
    this.setState({
      currentMember: member
    });
  };
  // 删除成员
  async deleteMember(id: string) {
    const res = await deleteUser(id);
    if (res.success) {
      this.fetchData();
    }
    return res;
  }
  // 停用成员
  async pauseMember(params: any) {
    const { id, status } = params;
    const newParams = {
      id,
      ban: status === 'active' ? true : false
    };
    const res = await banUser(newParams);
    if (res.success) {
      this.fetchData();
    }
    return res;
  }
  // 添加成员
  async addMember(data: any) {
    const res = await createUser(data);
    if (res.success) {
      this.fetchData();
      this.setVisible(false); // 关闭弹窗
    }
    return res;
  }
  // 修改成员
  async updateMember(data: any) {
    const res = await updateUser(data);
    if (res.success) {
      this.fetchData();
      this.setVisible(false); // 关闭弹窗
    }
    return res;
  }
  // 设置表格数据
  setList = (list: DataSet[]) => {
    this.setState({
      list
    });
  };
  // 设置弹窗状态
  setVisible = (visible: boolean) => {
    this.setState({
      visible
    });
  };

  // 设置搜索参数
  setSearchParams = (params: Record<string, any>) => {
    this.setState({
      searchParams: params
    });
  };

  // 请求数据
  fetchData(options?: { showLoading?: boolean; page?: number; size?: number }) {
    const { showLoading = true, page = 1, size = 10 } = options || {};

    return this.asyncManager('fetchData', {
      showLoading
    }).exec(async () => {
      try {
        // 合并所有参数：分页参数 + 当前保存的搜索参数
        const params: any = {
          page,
          size,
          ...this.state.searchParams
        };

        // 处理数组参数，转换为逗号分隔的字符串
        const processedParams = Object.fromEntries(
          Object.entries(params).map(([key, value]) => {
            if (Array.isArray(value)) {
              return [key, value.join(',')];
            }
            return [key, value];
          })
        );

        const response = await searchMemberUsers(processedParams);

        this.setList(response.data?.data || []);
        // 同时更新 store 中的 total
        this.setState({
          total: response.data?.total || 0
        });
        return {
          list: response.data?.data || [],
          total: response.data?.total || 0
        };
      } catch (error) {
        console.error('Failed to fetch data:', error);
        return {
          list: [],
          total: 0
        };
      }
    });
  }
  // 获取组织树
  fetchOrgData(options?: { showLoading?: boolean }) {
    const { showLoading = true } = options || {};

    return this.asyncManager('fetchOrgData', {
      showLoading
    }).exec(async () => {
      try {
        const response = await getOrganizationTree();
        return {
          orgData: response.data || []
        };
      } catch (error) {
        console.error('Failed to fetch data:', error);
        return {
          orgData: []
        };
      }
    });
  }

  // 获取角色
  fetchRoleData(options?: { showLoading?: boolean }) {
    const { showLoading = true } = options || {};

    return this.asyncManager('fetchRoleData', {
      showLoading
    }).exec(async () => {
      try {
        const response = await getRoleData();
        return {
          roleData: response.data || []
        };
      } catch (error) {
        console.error('Failed to fetch data:', error);
        return {
          roleData: []
        };
      }
    });
  }
}
