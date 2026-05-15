import React, { useState, useRef, useCallback } from 'react';
import { Dropdown, Spin } from '@arco-design/web-react';
import { IconDown, IconSettings, IconPlus } from '@arco-design/web-react/icon';
import { useInfiniteScroll } from 'ahooks';
import { useAIWorkbenchStore } from '../store';
import SceneModal from '@/pages/ontologyScene/modules/list/components/SceneModal';
import { useOntologyManagement } from '../hooks/useOntologyManagement';
import { getIconComponent } from '../utils/iconHelper';
import type { OntologScene } from '@/types/ontologySceneApi';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';

interface InfiniteScrollData {
  list: OntologScene[];
  hasMore: boolean;
}

/**
 * 本体场景选择器（包含完整的顶部栏）
 */
const OntologySelector: React.FC = () => {
  const { currentOntology, setCurrentOntology } = useAIWorkbenchStore();
  const {
    createModalVisible,
    createLoading,
    handleCreateOntology,
    openCreateModal,
    closeCreateModal
  } = useOntologyManagement();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * 加载本体列表数据
   */
  const loadOntologyData = useCallback(
    async (d: InfiniteScrollData | undefined) => {
      const currentPage = d ? Math.floor(d.list.length / 20) + 1 : 1;

      const res = await listOntologyModel({
        pageNo: currentPage,
        pageSize: 20,
        order: 'desc',
        orderBy: 'create_time'
      });

      if (res.status === 200 && res.code === '' && res.data) {
        const newList = res.data.result || [];
        const list = d ? [...d.list, ...newList] : newList;

        // 不在这里设置默认本体，由主页面的 loadOntologyList 统一处理

        return {
          list,
          hasMore: newList.length === 20
        };
      }

      return {
        list: d?.list || [],
        hasMore: false
      };
    },
    [currentOntology, setCurrentOntology]
  );

  /**
   * 使用 ahooks 的 useInfiniteScroll
   */
  const { data, loading, loadingMore, reload } = useInfiniteScroll(
    loadOntologyData,
    {
      target: scrollContainerRef,
      isNoMore: (d) => !d?.hasMore,
      manual: true, // 手动控制加载
      reloadDeps: []
    }
  );

  const ontologyList = data?.list || [];

  /**
   * 监听下拉菜单打开，触发加载
   */
  React.useEffect(() => {
    if (dropdownVisible && ontologyList.length === 0) {
      reload();
    }
  }, [dropdownVisible, ontologyList.length, reload]);

  /**
   * 监听当前本体变化，如果本体列表为空但有当前本体，重新加载列表
   */
  React.useEffect(() => {
    if (currentOntology && ontologyList.length === 0) {
      reload();
    }
  }, [currentOntology, ontologyList.length, reload]);

  /**
   * 切换本体
   */
  const handleSelectOntology = (ontology: OntologScene) => {
    setCurrentOntology(ontology);
    setDropdownVisible(false);
  };

  /**
   * 打开创建弹窗
   */
  const handleOpenCreateModal = () => {
    setDropdownVisible(false);
    openCreateModal();
  };

  /**
   * 渲染下拉菜单
   */
  const dropdownList = (
    <div className="w-[216px] overflow-hidden rounded-[12px] bg-white py-[4px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
      <div ref={scrollContainerRef} className="max-h-[400px] overflow-y-auto">
        {ontologyList.map((ontology) => {
          const isSelected = currentOntology?.id === ontology.id;
          return (
            <div
              key={String(ontology.id)}
              className={`flex cursor-pointer items-center gap-[8px] px-[12px] py-[8px] transition-colors ${
                isSelected ? 'bg-[#f2f8ff]' : 'bg-white hover:bg-[#f7f8fa]'
              }`}
              onClick={() => handleSelectOntology(ontology)}
            >
              {/* 图标 */}
              <div className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--color-border-2)] bg-gradient-to-b from-[rgba(24,79,242,0.4)] to-[rgba(24,79,242,0.1)]">
                {getIconComponent(ontology.icon || 'general-1', 16)}
              </div>
              {/* 名称 */}
              <span
                className={`flex-1 truncate text-[14px] font-normal leading-[22px] ${
                  isSelected
                    ? 'text-[rgb(var(--primary-6))]'
                    : 'text-[var(--color-text-1)]'
                }`}
              >
                {ontology.name}
              </span>
            </div>
          );
        })}
        {(loading || loadingMore) && (
          <div className="flex items-center justify-center py-[8px]">
            <Spin size={16} />
          </div>
        )}
      </div>

      {/* 创建按钮 */}
      <div
        className="flex cursor-pointer items-center justify-center gap-[4px] px-[12px] py-[8px] transition-colors hover:bg-[#f7f8fa]"
        onClick={handleOpenCreateModal}
      >
        <IconPlus className="text-[16px] text-[rgb(var(--primary-6))]" />
        <span className="text-[14px] font-normal leading-[22px] text-[rgb(var(--primary-6))]">
          创建本体场景
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex w-full items-center justify-between">
        {/* 左侧区域 */}
        <div className="flex items-center gap-4">
          {/* 标题 */}
          <h1 className="text-[20px] font-[600] leading-[30px] text-[var(--color-text-1)]">
            本体AI工作台
          </h1>

          {/* 垂直分隔线 */}
          <div className="h-[18px] w-[1px] bg-[var(--color-border-2)]" />

          {/* 本体场景选择器 */}
          <Dropdown
            droplist={dropdownList}
            trigger="click"
            position="bl"
            popupVisible={dropdownVisible}
            onVisibleChange={setDropdownVisible}
          >
            <div className="flex cursor-pointer items-center gap-2 hover:opacity-80">
              {currentOntology ? (
                <>
                  {/* 本体图标 */}
                  {currentOntology.icon && (
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border-2)] bg-gradient-to-b from-[rgba(24,79,242,0.4)] to-[rgba(24,79,242,0.1)]">
                      {getIconComponent(currentOntology.icon, 16)}
                    </div>
                  )}
                  {/* 本体名称 */}
                  <span className="max-w-[200px] truncate text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
                    {currentOntology.name}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border-2)] bg-gradient-to-b from-[rgba(24,79,242,0.4)] to-[rgba(24,79,242,0.1)]">
                    {getIconComponent('general-1', 16)}
                  </div>
                  <span className="text-[16px] font-[600] leading-[24px] text-[var(--color-text-1)]">
                    新建本体场景
                  </span>
                </>
              )}
              {/* 下拉箭头 */}
              <IconDown className="text-[18px] text-[var(--color-text-3)]" />
            </div>
          </Dropdown>
        </div>

        {/* 右侧区域 - 设置按钮 */}
        {/* <div className="flex cursor-pointer items-center gap-1 hover:opacity-80">
                    <IconSettings className="text-[20px] text-[var(--color-text-3)]" />
                    <span className="text-[14px] leading-[22px] text-[var(--color-text-3)]">
                        设置
                    </span>
                </div> */}
      </div>

      <SceneModal
        visible={createModalVisible}
        mode="create"
        onSubmit={handleCreateOntology}
        onCancel={closeCreateModal}
        loading={createLoading}
        existingSceneIcons={ontologyList.map((item) => item.icon || '')}
      />
    </>
  );
};

export default OntologySelector;
