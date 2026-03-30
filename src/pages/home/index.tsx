import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { Button, Message } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';
import { createOntologyModel } from '@/api/ontologySceneLibrary/ontologyScene';
import SceneModal, {
  SceneFormData
} from '@/pages/ontologyScene/modules/list/components/SceneModal';
import homeBgVideo from './assets/home-bac.mp4';

export default function Home() {
  const history = useHistory();
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleModalSubmit = async (data: SceneFormData) => {
    setSubmitLoading(true);
    try {
      const response = await createOntologyModel({
        name: data.name,
        description: data.description || '',
        icon: data.icon || '',
        tagIdList: []
      });

      if (response.status === 200 && response.code === '') {
        Message.success('创建成功');
        history.push(
          `/tenant/compute/onto/ontologyScene/detail/${response.data.id}`
        );
      } else {
        Message.error(response.message || '创建失败');
      }
    } catch (error) {
      Message.error('创建失败');
      console.error('提交失败:', error);
    } finally {
      setSubmitLoading(false);
      setModalVisible(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div
      className={classNames(
        styles['home-page'],
        'flex h-full w-full overflow-hidden bg-white'
      )}
    >
      {/* 内容区域 */}
      <div className="relative mx-auto flex h-full w-full flex-1 flex-col items-center">
        <div className="absolute bottom-0 left-0 right-0 top-0 flex justify-center overflow-hidden">
          <video
            className="h-full w-full max-w-none object-cover"
            src={homeBgVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
        </div>
        <div className="mt-[64px] w-full text-center">
          {/* 大标题 - 入场动效 */}
          <h1
            className={classNames(
              'mb-[6px] text-[40px] font-[600] leading-[56px] text-[var(--color-text-1)]',
              styles['fade-in-up']
            )}
            style={{
              animationDelay: '0ms'
            }}
          >
            <span className="text-[#184FF2]">本体</span> 构建与运营平台
          </h1>

          {/* 说明文字 - 入场动效 */}
          <p
            className={classNames(
              'mb-[25px] text-[16px] leading-[24px] text-[var(--color-text-3)]',
              styles['fade-in-up']
            )}
            style={{
              animationDelay: '50ms'
            }}
          >
            将离散的底层数据映射为可视、可管、可执行的业务对象，构建面向 AI
            时代的语义基础设施
          </p>

          {/* 按钮 - 入场动效和悬停动效 */}
          <div
            className={classNames(styles['fade-in-up'])}
            style={{
              animationDelay: '100ms'
            }}
          >
            <Button
              type="primary"
              size="large"
              className={classNames(styles['create-button'])}
              onClick={() => setModalVisible(true)}
            >
              <span className="mr-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                立即创建本体场景
              </span>
              <span className="inline-block">→</span>
            </Button>
          </div>
        </div>
      </div>

      {modalVisible && (
        <SceneModal
          visible={modalVisible}
          mode="create"
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
          loading={submitLoading}
        />
      )}
    </div>
  );
}
