// KnowStore.ts
import {
  banUser,
  createOrganization,
  createUser,
  deleteOrganization,
  deleteUser,
  getOrganizationTree,
  getRoleData,
  getUsers,
  updateOrganizationg,
  updateUser
} from '@/api/user';
import { Model } from '@/models';
import { addDisabledField } from '../utils';
import type { DataSet } from '@/pages/workflowConfig/models/datasets';
import { OrgEditor } from '../components/OrgProvider/Org';

interface InfoStoreState {
  list: DataSet[]; // 表格数据
  loading: boolean;
  total: number;
  visible: boolean;
  // 当前编辑的成员
  currentMember: any;
  // 当前选择的组织
  currentOrg: any;
  // 组织Modal
  orgModalVisible: boolean;
  parentOrgModalVisible: boolean;
  orgData?: any[]; // 组织树数据
  roleData: any[]; // 角色
  editOrgModalVisible: boolean;
  // tree 搜索关键词
  treeSearchKey: string;
  // 当前hover的组织
  hoveredOrg?: any;
  
}

export class OrgStore extends Model<InfoStoreState> {
  constructor(public org: OrgEditor) {
    super({
      state: {
        list: [],
        loading: false,
        total: 0,
        visible: false,
        currentMember: {},
        currentOrg: {},
        orgModalVisible: false,
        orgData: [],
        roleData: [],
        editOrgModalVisible: false,
        treeSearchKey: '',
        parentOrgModalVisible: false,
        hoveredOrg: {
          _key: ''
        } // 当前hover的组织
      },
    
    });
  }

  setParentOrgModalVisible = (visible: boolean) => {
    this.setState({
      parentOrgModalVisible: visible
    });
  }
  // 设置当前hover的组织
  setHoveredOrg = (org: any) => {
    this.setState({
      hoveredOrg: org
    });
  };
  setTreeSearchKey = (key: string) => {
    this.setState({
      treeSearchKey: key
    });
  };

  // 设置编辑组织弹窗状态
  setEditOrgModalVisible = (visible: boolean) => {
    this.setState({
      editOrgModalVisible: visible
    });
  };

  // 设置组织Modal
  setOrgModalVisible = (visible: boolean) => {
    this.setState({
      orgModalVisible: visible
    });
  };
  // 设置当前选择的组织
  setCurrentOrg = (org: any) => {
    this.setState({
      currentOrg: org
    });
  };
  // 设置当前编辑的成员
  setCurrentMember = (member: DataSet) => {
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
  }
  // 添加成员
  async addMember(data: any) {
    const res = await createUser(data);
    if (res.success) {
      this.fetchData();
      this.setVisible(false); // 关闭添加成员弹窗
    }
  }
  // 修改成员
  async updateMember(data: any) {
    const res = await updateUser(data);
    if (res.success) {
      this.fetchData();
      this.setVisible(false); // 关闭编辑成员弹窗
    }
  }
  // 创建部门
  async createOrg(data: any) {
    const res = await createOrganization(data);
    if (res.success) {
     await this.fetchOrgData();
      this.fetchData();
      this.setParentOrgModalVisible(false);
      this.setOrgModalVisible(false);
    }
  }
  // 修改部门
  async updateOrg(data: any) {
    const res = await updateOrganizationg(data);
    if (res.success) {
      this.fetchOrgData();
      this.fetchData();
      this.setEditOrgModalVisible(false);
    }
  }
  // 删除部门
  async deleteOrg(id: string) {
    const res = await deleteOrganization(id);
    if (res.success) {
      await this.fetchOrgData();
      this.fetchData();
    }
  }
  // 设置当前编辑的成员
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

  // 请求数据
  fetchData(options?: {
    showLoading?: boolean;
    page?: number;
    limit?: number;
    organization_id?: string | number;
    name?: string;
    // 其他搜索参数
    [key: string]: any;
  }) {
    const {
      showLoading = true,
      page = 1,
      limit = 10,
      organization_id = 1,
      name,
      ...otherParams
    } = options || {};

    return this.asyncManager('fetchData', {
      showLoading
    }).exec(async () => {
      try {
        // 合并所有参数
        const params = {
          page,
          limit,
          organization_id,
          name,
          ...otherParams
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

        const response = await getUsers(processedParams);

        this.setList(response.data?.data || []);
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

  setTreeData = (data: any[]) => {
    this.setState({
      orgData: data
    });
  };

  // 获取组织树
  fetchOrgData(options?: { showLoading?: boolean }) {
    const { showLoading = true } = options || {};

    return this.asyncManager('fetchOrgData', {
      showLoading
    }).exec(async () => {
      try {
        const response = await getOrganizationTree();
        this.setCurrentOrg({
          currentOrg: response.data[0]
        })
        return {
          orgData: addDisabledField(response.data) || [],
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
