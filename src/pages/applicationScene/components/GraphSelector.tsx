import React, { useEffect, useState } from 'react';
import { Message, Select, Space, Typography } from '@arco-design/web-react';
import { listOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import { isOntologyApiSuccess } from '@/utils/apiResponse';
import type { OntologScene } from '@/types/ontologySceneApi';

const { Text } = Typography;

interface GraphSelectorProps {
  value?: number;
  onChange: (sceneId?: number, scene?: OntologScene) => void;
  /** 嵌入图谱工具栏时使用横向布局 */
  inline?: boolean;
  /** 工具栏内嵌缩放控件挂载点 */
  zoomSlot?: React.ReactNode;
}

export default function GraphSelector({
  value,
  onChange,
  inline = false,
  zoomSlot
}: GraphSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [scenes, setScenes] = useState<OntologScene[]>([]);

  useEffect(() => {
    const loadScenes = async () => {
      setLoading(true);
      try {
        const res = await listOntologyModel({
          pageNo: 1,
          pageSize: 100,
          order: 'desc',
          orderBy: 'create_time'
        });

        if (isOntologyApiSuccess(res) && res.data?.result) {
          setScenes(res.data.result);
        }
      } catch {
        Message.error('加载本体场景库失败');
      } finally {
        setLoading(false);
      }
    };

    void loadScenes();
  }, []);

  const selectedScene = scenes.find((scene) => scene.id === value);

  const selectNode = (
    <Select
      allowClear
      loading={loading}
      placeholder="请选择本体场景图谱"
      value={value}
      style={{ width: inline ? 280 : 360 }}
      onChange={(sceneId) => {
        const scene = scenes.find((item) => item.id === sceneId);
        onChange(sceneId, scene);
      }}
      options={scenes
        .filter((scene) => scene.id != null)
        .map((scene) => ({
          label: scene.name || `场景 #${scene.id}`,
          value: scene.id!
        }))}
    />
  );

  if (inline) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Text className="flex-shrink-0 text-[13px] font-medium">关联图谱</Text>
        <div className="min-w-0 flex-1">{selectNode}</div>
        {zoomSlot}
        {selectedScene?.description && (
          <Text
            type="secondary"
            className="hidden max-w-[160px] truncate text-[12px] xl:inline"
            title={selectedScene.description}
          >
            {selectedScene.description}
          </Text>
        )}
      </div>
    );
  }

  return (
    <Space direction="vertical" className="w-full" size="small">
      <Text bold>关联图谱</Text>
      {selectNode}
      {selectedScene?.description && (
        <Text type="secondary" className="text-[13px]">
          {selectedScene.description}
        </Text>
      )}
    </Space>
  );
}
