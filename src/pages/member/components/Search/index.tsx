import AddSvg from '@/assets/add.svg';
import { Button, Input, TreeSelect } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { useDebounceFn } from 'ahooks';
import React, { useEffect, useState } from 'react';
import { useMemberEditor } from '../../components/MemberProvider/Context';
import MemberForm from '../MemberForm';
import { useUserInfo } from '@/store/userInfoStore';
import { getNodePathTitles } from '../../utils';
import { getOrganizationTree } from '@/api/user';

export default function Search() {
  const member = useMemberEditor();
  const { memberStore } = member;

  // 获取用户信息
  const userInfo = useUserInfo();

  // 从 store 中获取当前搜索参数
  const { searchParams } = memberStore.useGetState(['searchParams']);

  // 用于控制是否已经设置了默认值
  const [hasSetDefault, setHasSetDefault] = useState(false);

  // 根据组织名称查找组织key的函数
  const findOrgKeyByTitle = (
    orgData: any[],
    targetTitle: string
  ): string | null => {
    const searchInTree = (nodes: any[]): string | null => {
      for (const node of nodes) {
        if (node.title === targetTitle) {
          return node.key || node.id;
        }
        if (node.children && node.children.length > 0) {
          const result = searchInTree(node.children);
          if (result) return result;
        }
      }
      return null;
    };
    return searchInTree(orgData);
  };

  // 为组织数据添加权限控制的函数
  const addPermissionControl = (nodes: any[]): any[] => {
    return nodes.map((node) => {
      // 检查当前节点是否有 can_get 权限
      const hasGetPermission = node.perms && node.perms.includes('can_get');

      // 创建新节点（保留原有属性）
      const newNode = {
        ...node,
        disabled: !hasGetPermission, // 没有 can_get 权限则禁用
        key: node.key || node.id, // 确保有 key 字段
        // 为禁用的节点添加样式提示
        className: !hasGetPermission ? 'text-gray-400' : undefined
      };

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        newNode.children = addPermissionControl(node.children);
      }

      return newNode;
    });
  };

  // 处理后的组织数据（添加权限控制）
  const [orgData, setOrgData] = useState<any[]>([]);
  const getOrgData = async () => {
    const response = await getOrganizationTree();
    if (response?.data) {
      setOrgData(response?.data || []);
    }
  };
  useEffect(() => {
    getOrgData();
  }, []);
  const processedOrgData = orgData ? addPermissionControl(orgData) : [];

  // 修复后的搜索函数：按照 Arco Design 官方 API
  const filterTreeNode = (inputText: string, node: any) => {
    if (!inputText) return true;

    const searchValue = inputText.toLowerCase();

    // 1. 搜索节点标题（按照官方 API，使用 node.props.title）
    const nodeTitle = node.props?.title || node.title || '';
    if (nodeTitle.toLowerCase().includes(searchValue)) {
      return true;
    }

    // 2. 搜索完整路径（例如：搜索"技术部/前端组"）
    try {
      const nodeKey =
        node.props?.key || node.key || node.props?.value || node.value;
      if (nodeKey) {
        const pathTitles = getNodePathTitles(processedOrgData, nodeKey);
        const fullPath = pathTitles.join('/').toLowerCase();
        if (fullPath.includes(searchValue)) {
          return true;
        }

        // 3. 搜索路径中的任意部分
        const pathString = pathTitles.join(' ').toLowerCase();
        if (pathString.includes(searchValue)) {
          return true;
        }
      }
    } catch (error) {
      // 如果路径搜索出错，只进行标题搜索
      console.warn('Path search error:', error);
    }

    return false;
  };

  // 调试日志：显示权限控制的结果
  React.useEffect(() => {
    if (processedOrgData.length > 0) {
      console.log('TreeSelect 权限控制结果:', processedOrgData);

      // 统计禁用的节点数量
      const countDisabledNodes = (nodes: any[]): number => {
        let count = 0;
        nodes.forEach((node) => {
          if (node.disabled) count++;
          if (node.children) count += countDisabledNodes(node.children);
        });
        return count;
      };

      const disabledCount = countDisabledNodes(processedOrgData);
      console.log(
        `TreeSelect 中共有 ${disabledCount} 个节点因缺少 'can_get' 权限被禁用`
      );
    }
  }, [processedOrgData]);

  const { run: handleSearch } = useDebounceFn(
    (type: string, value: string | undefined) => {
      // 更新特定的搜索条件
      const newSearchParams = { ...searchParams };

      if (value === undefined || value === null || value === '') {
        // 如果值为空，删除该搜索条件
        delete newSearchParams[type];
      } else {
        // 如果值不为空，设置该搜索条件
        newSearchParams[type] = value;
      }

      // 直接更新 store 中的搜索参数
      console.log('Combined search params:', newSearchParams);
      memberStore.setSearchParams(newSearchParams);

      // 然后触发数据获取（不传递参数，让它使用 store 中的参数）
      memberStore.fetchData({ page: 1, size: 10 });
    },
    {
      wait: 300
    }
  );

  // 专门处理 TreeSelect 组织选择的函数，避免重复调用
  const handleOrgChange = (value: string | undefined) => {
    console.log('Selected organization:', value);

    // 直接更新搜索参数，不触发防抖
    const newSearchParams = { ...searchParams };

    if (value === undefined || value === null || value === '') {
      delete newSearchParams.organization_id;
    } else {
      newSearchParams.organization_id = value;
    }

    // 只更新 store 中的搜索参数，让 useTable 来处理数据获取
    memberStore.setSearchParams(newSearchParams);

    // 不在这里调用 fetchData，避免与 useTable 的 useEffect 重复调用
    // memberStore.fetchData({ page: 1, size: 10 });
  };

  useEffect(() => {
    memberStore.fetchOrgData();
  }, []);

  // 设置默认组织值
  useEffect(() => {
    if (
      userInfo &&
      processedOrgData &&
      processedOrgData.length > 0 &&
      !hasSetDefault
    ) {
      let orgKey = null;

      // 优先使用 organization_id
      if (userInfo.organization_id) {
        orgKey = userInfo.organization_id;
        console.log('Using organization_id from userInfo:', orgKey);
      }
      // 如果没有 organization_id，则通过 organization 名称查找
      else if (userInfo.organization) {
        orgKey = findOrgKeyByTitle(processedOrgData, userInfo.organization);
        console.log(
          'Found organization key by name:',
          userInfo.organization,
          'key:',
          orgKey
        );
      }

      if (orgKey) {
        console.log('Setting default organization with key:', orgKey);
        // 设置默认搜索参数并触发搜索
        handleOrgChange(orgKey);
        setHasSetDefault(true);
      }
    }
  }, [userInfo, processedOrgData, hasSetDefault, handleOrgChange]);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center space-x-3">
        <Input
          className="w-[260px] flex-none font-[400]"
          suffix={<IconSearch />}
          placeholder="搜索成员姓名"
          allowClear
          onChange={(value) => {
            handleSearch('name', value);
          }}
        />

        <TreeSelect
          className="w-[160px] flex-none font-[400]"
          allowClear
          placeholder="选择部门"
          showSearch
          treeData={processedOrgData}
          value={searchParams.organization_id}
          filterTreeNode={filterTreeNode}
          onChange={handleOrgChange}
        />
      </div>
      <Button
        type="primary"
        className="flex items-center gap-1 px-3"
        onClick={() => {
          memberStore.setCurrentMember(null);
          memberStore.setVisible(true);
        }}
      >
        <AddSvg />
        添加成员
      </Button>
      <MemberForm />
    </div>
  );
}
