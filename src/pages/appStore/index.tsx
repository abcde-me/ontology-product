import Avatar from '@/components/avater';
import { useInstalledApp } from '@/utils/swr';
import {
  Button,
  Empty,
  Grid,
  Input,
  Message,
  Spin
} from '@arco-design/web-react';
import {
  IconEye,
  IconHeart,
  IconShareInternal,
  IconClockCircle,
} from '@arco-design/web-react/icon';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import './index.css';
import DefaultAppIcon from '@/assets/default-app-icon.svg';

export default function AppStorePage() {
  const history = useHistory();
  const [searchText, setSearchText] = React.useState('');
  const { data, isLoading, error } = useInstalledApp();
  const list =
    data?.filter(
      (item) =>
        item.app.name.match(new RegExp(searchText.trim(), 'i')) ||
        item.app.site?.description?.match(new RegExp(searchText.trim(), 'i'))
    ) || [];
  React.useEffect(() => {
    if (error) {
      Message.error(error?.message);
    }
  }, [error]);

  return (
    <div className="flex  h-full flex-col overflow-auto py-[20px] pr-[20px] ">
      <div className="mb-[20px] flex h-[240px] flex-none flex-col items-center rounded-[12px] bg-[url(@/assets/appstore-bg.png)] bg-cover bg-no-repeat py-[47px] text-white">
        <div className="text-[32px] font-[600] leading-[48px] ">
          让每一个人都可以应用AI创造无限可能
        </div>
        <div className="mb-[14px]">
          您可以立即体验基于AppForge创建的AI原生应用。
        </div>
        <div>
          <Input.Search
            className="appstore-search mb-[8px]"
            placeholder="请输入应用名称或者描述"
            onChange={(val) => setSearchText(val)}
          />
          <div style={{ visibility: 'visible', textAlign: 'center' }}>
            热词:情感陪护 法律咨询 拟定合同 宠物医生 视频生成 作业帮手
          </div>
        </div>
      </div>
      <Spin
        block
        loading={isLoading}
        className="flex-auto rounded-[12px] bg-white  px-[24px] py-[20px]"
      >
        {list?.length === 0 && !isLoading ? (
          <Empty />
        ) : (
          <Grid cols={{ xs: 1, sm: 1, xl: 2, xxl: 3 }} colGap={20} rowGap={20}>
            {list?.map((item) => {
              return (
                <Grid.GridItem key={item.id}>
                  {/* <div className="min-h-[160px] cursor-pointer rounded-[4px] border border-[rgb(var(--primary-3))] bg-[linear-gradient(180deg,rgba(226,239,255,0.2)_0%,rgba(255,255,255,0.2)_100%)] p-[16px] hover:border-[rgb(var(--primary-6))] hover:bg-[rgb(var(--link-1))]">
                    <div className="mb-[16px] flex items-center">
                      <Avatar
                        readonly
                        size={44}
                        value={item.app.icon}
                        className="mr-[8px]"
                        defaultIcon={<DefaultAppIcon className="size-[44px]" />}
                      />
                      <div className="flex flex-col justify-between">
                        <div className="text-[14px] font-[600] leading-[22px] text-[var(--color-text-2)]">
                          {item.app.name}
                        </div>
                        <div className="flex items-center">
                          发布人：{item.publish_user}
                        </div>
                      </div>
                    </div>
                    <div className="two-row-ellipse mb-[12px] h-[40px] text-[var(--color-text-5)]">
                      {item.app.site?.description}
                    </div>
                    <div className="flex items-center">
                      <Button
                        className="try-now"
                        long
                        onClick={() =>
                          history.push(
                            '/tenant/compute/appforge/appChat?id=' + item.id
                          )
                        }
                      >
                        立即体验
                      </Button>
                    </div>
                  </div> */}
                  <div className='app-card h-[220px] rounded-[8px] border border-[rgb(var(--primary-3))] hover:border-[rgb(var(--primary-6))]'>
                    <Avatar
                      readonly
                      size={180}
                      value={item.app.icon}
                      defaultIcon={<DefaultAppIcon className="size-[180px]" />}
                    />
                    <div className="app-info">
                      <div>
                        <div className='app-name'>{item.app.name}</div>
                        <div className='app-tags'><span className='app-tag'>知识问答</span></div>
                        <div className="app-desc two-row-ellipse mb-[12px] h-[40px]">
                          {item.app.site?.description}
                        </div>
                      </div>
                      <div>
                        <div className='app-other'>
                          <span>
                            <IconClockCircle className='text-[#7F8C9F] mr-[4px]'/>
                            <span>2023-09-23 23:23:23</span>
                          </span>
                          <span className='text-[#6E7B8D]'>
                            发布人：{item.publish_user}
                          </span>
                        </div>
                        <div className="try-now">立即体验</div>
                      </div>
                    </div>
                  </div>
                </Grid.GridItem>
              );
            }) || []}
          </Grid>
        )}
      </Spin>
    </div>
  );
}
