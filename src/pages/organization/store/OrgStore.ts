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
  updateUser,
  preDelOrg
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
  // 组织数据是否已初始化
  orgDataInitialized: boolean;
  // 删除前判断visible
  preDeleteVisible: boolean;
  // 删除用户前判断visible
  preDeleteUserVisible: boolean;
  // 当前搜索参数
  searchParams: Record<string, any>;
}

export class OrgStore extends Model<InfoStoreState> {
  constructor(public org: OrgEditor) {
    super({
      state: {
        preDeleteVisible: false,
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
        }, // 当前hover的组织
        orgDataInitialized: false, // 组织数据是否已初始化
        preDeleteUserVisible: false,
        searchParams: {}
      }
    });
  }

  setPreDeleteUserVisible = (visible: boolean) => {
    this.setState({
      preDeleteUserVisible: visible
    });
  };

  setPreDeleteVisible = (visible: boolean) => {
    this.setState({
      preDeleteVisible: visible
    });
  };

  // 设置搜索参数
  setSearchParams = (params: Record<string, any>) => {
    this.setState({
      searchParams: params
    });
  };

  async preDelOrgOperate() {
    console.log('vwwww', this.state.hoveredOrg);
    const res = await preDelOrg({
      orgId: this.state.hoveredOrg.id
    });

    return res;
  }

  setParentOrgModalVisible = (visible: boolean) => {
    this.setState({
      parentOrgModalVisible: visible
    });
  };
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
    console.log('setCurrentOrg called with:', org);
    console.log('setCurrentOrg call stack:', new Error().stack);
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
    console.log('addMember - currentOrg state:', this.state.currentOrg);
    if (res.success) {
      this.fetchData({
        page: 1,
        size: 10
      });
      this.setVisible(false); // 关闭添加成员弹窗
    }
    return res;
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
    return res;
  }
  // 修改部门
  async updateOrg(data: any) {
    const res = await updateOrganizationg(data);
    if (res.success) {
      this.fetchOrgData();
      this.fetchData();
      this.setEditOrgModalVisible(false);
    }
    return res;
  }
  // 删除部门
  async deleteOrg(id: string) {
    const res = await deleteOrganization(id);
    if (res.success) {
      await this.fetchOrgData();
    }
    return res;
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
    size?: number;
    searchParams?: Record<string, any>;
  }) {
    const {
      showLoading = true,
      page = 1,
      size = 10,
      searchParams: overrideSearchParams
    } = options || {};

    console.log('fetchData called with options:', options);
    console.log('fetchData searchParams:', this.state.searchParams);
    console.log('fetchData currentOrg:', this.state.currentOrg);

    return this.asyncManager('fetchData', {
      showLoading
    }).exec(async () => {
      try {
        // 合并所有参数：分页参数 + 当前保存的搜索参数 + 传入的搜索参数
        const params: any = {
          page,
          size,
          ...this.state.searchParams,
          ...(overrideSearchParams || {})
        };

        // 如果 searchParams 中没有 organization_id，使用当前选中的组织
        if (!params.organization_id && this.state.currentOrg?.id) {
          params.organization_id = this.state.currentOrg.id;
        }

        console.log('fetchData final params:', params);

        // 处理数组参数，转换为逗号分隔的字符串
        const processedParams = Object.fromEntries(
          Object.entries(params).map(([key, value]) => {
            if (Array.isArray(value)) {
              return [key, value.join(',')];
            }
            return [key, value];
          })
        );

        console.log('fetchData sending to API:', processedParams);
        const response = await getUsers(processedParams);

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

  setTreeData = (data: any[]) => {
    this.setState({
      orgData: data
    });
  };

  // 根据level字段过滤组织树，最多展示7级
  private filterOrgDataByLevel(data: any[], maxLevel = 7): any[] {
    const filterByLevel = (nodes: any[]): any[] => {
      return nodes
        .filter((node) => node.level <= maxLevel) // 过滤掉超过最大级别的节点
        .map((node) => {
          const filteredNode = { ...node };

          // 如果有子节点，递归过滤子节点
          if (node.children && node.children.length > 0) {
            const filteredChildren = filterByLevel(node.children);
            filteredNode.children = filteredChildren;
          }

          return filteredNode;
        });
    };

    return filterByLevel(data);
  }

  // 获取组织树
  fetchOrgData(options?: { showLoading?: boolean }) {
    const { showLoading = true } = options || {};

    return this.asyncManager('fetchOrgData', {
      showLoading
    }).exec(async () => {
      try {
        const response = await getOrganizationTree();
        console.log('fetchOrgData response', response);

        let processedOrgData = addDisabledField(response.data) || [];
        console.log(
          'fetchOrgData processedOrgData (before level filter)',
          processedOrgData
        );

        // 根据level字段过滤，最多展示7级
        processedOrgData = this.filterOrgDataByLevel(processedOrgData, 7);
        console.log(
          'fetchOrgData processedOrgData (after level filter)',
          processedOrgData
        );

        // 移除自动设置第一个组织的逻辑，让 OrgTree 组件控制初始化
        console.log('fetchOrgData setting orgData:', processedOrgData);
        this.setTreeData(processedOrgData);
        return {
          orgData: processedOrgData
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
