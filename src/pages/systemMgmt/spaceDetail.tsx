import {
  Button,
  Tabs,
  Empty,
  Link,
  Menu,
  Message,
  Space,
  Spin,
  Tag
} from '@arco-design/web-react';
import {
  IconEdit,
  IconRefresh,
  IconArrowLeft,
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { SearchBox, Table } from '@ccf2e/arco-material';
import SpaceIcon1 from '@/assets/space-icon1.svg';
import { CreateSpaceModal } from './createSpaceModal';
import { DelSpaceModal } from './delSpaceModal';
import './spaceDetail.less';

const TabPane = Tabs.TabPane;

function SpaceDetail(props) {
  const history = useHistory();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDelModal, setShowDelModal] = useState(false);
  const [activeTab, setActiveTab] = useState('member');
  const [searchResult, setSearchResult] = useState({});
  const [list, setList] = useState([
    { usename: 'xxxx', name: 'space1', desc: 'space1' },
    { usename: 'xxxx2', name: 'space2', desc: 'space1' },
    { usename: 'xxxx3', name: 'space3', desc: 'space1' },
    { usename: 'xxxx4', name: 'space4', desc: 'space1' }
  ])

  const columns = React.useMemo(() => {
    return [
      {
        title: '昵称',
        dataIndex: 'name',
        width: 200
      },
      {
        title: '用户名',
        dataIndex: 'usename',
        width: 260
      },
      {
        title: '角色',
        dataIndex: 'desc',
        width: 260,
      },
      {
        title: '加入时间',
        dataIndex: 'created_at',
        width: 260,
      },
      {
        title: '操作',
        dataIndex: 'oper',
        width: 132,
        render(_, app) {
          return (
            <Space>
              <Link onClick={() => {}}>移除</Link>
            </Space>
          );
        }
      }
    ];
  }, []);

  return (
    <Spin className="appforge-spin" block loading={false}>
      <div className="h-full overflow-auto py-[20px] pr-[20px]">
        <div className="min-h-full rounded-[12px] bg-white px-[24px] py-[20px]">
          <div className="mb-[20px] flex items-center gap-x-[12px]">
            <div
              className='size-[24px] flex items-center justify-center mr-[8px] cursor-pointer shadow-lg rounded-full'
              onClick={() => history.goBack()}
            >
              <IconArrowLeft className='size-[16px] text-[#1E293B]'/>
            </div>
            <SpaceIcon1 className='size-[44px]'/>
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              XX的空间
            </div>
          </div>
            <Tabs activeTab={activeTab} onChange={setActiveTab} className="mb-[16px]">
              <TabPane key='member' title='成员管理' />
              <TabPane key='invitation' title='邀请管理' />
              <TabPane key='setting' title='空间设置' />
            </Tabs>
          { activeTab === 'member' &&
            <>
              <div className=" mb-[16px] flex justify-between">
                <SearchBox
                  className="pb-[0px]"
                  searchResult={searchResult}
                  searchConfig={[{
                      key: 'name',
                      label: '空间名称',
                      type: 'input',
                      placeholder: '请输入空间名称以模糊查询'
                    }
                  ]}
                  onSearch={() => {}}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {}}
                  >添加成员</Button>
                  <Button
                    type="outline"
                    icon={<IconRefresh />}
                    onClick={() => {}}
                  />
                </Space>
              </div>
              {list.length === 0 ? (
                <Empty />
              ) : (
                <Table
                  columns={columns}
                  data={list}
                  scroll={{ x: true }}
                  rowKey="usename"
                  onChange={() => {}}
                />
              )}
            </>
          }
          { activeTab === 'setting' && 
            <div className="setting-section">
              <div className="flex justify-between items-center p-[24px] rounded-[8px] border border-gray-200 border-width-1">
                <div className='left-part flex items-center gap-x-[16px]'>
                  <SpaceIcon1 className='rounded-[12px] size-[96px]'/>
                  <div className='flex flex-col gap-y-[2px]'>
                    <span className="space-name">
                      <span>陈磊的团队</span>
                      <IconEdit className='size-[20px] cursor-pointer'/>
                    </span>
                    <span>
                      <span className="user-role mr-[20px]">用户角色：管理员</span>
                      <span className="user-desc">团队描述：这是一个团队描述，描述要长描述要长描述要长描述要长描述要长描述要长描述要长描述要长</span>
                    </span>
                  </div>
                </div>
                <Button type="outline" className="primary" onClick={() => setShowDelModal(true)}>删除空间</Button>
              </div>
              <div>
                <div className='sub-title mt-[16px] mb-[12px]'>空间详情</div>
                <div className='detail-items flex'>
                  <div className='w-1/2 border border-gray-200 border-width-1 py-[12px] px-[24px]'>
                    <span className='text-[#7F8C9F]'>空间ID：</span>
                    <span>xxxxxxx</span>
                  </div>
                  <div className='w-1/2 border border-gray-200 border-width-1 py-[12px] px-[24px]'>
                    <span className='text-[#7F8C9F]'>新建时间：</span>
                    <span>2023-09-09</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      { showCreateModal && <CreateSpaceModal visible={showCreateModal} setVisible={setShowCreateModal} />}
      { showDelModal && <DelSpaceModal visible={showDelModal} setVisible={setShowDelModal} />}
    </Spin>
  );
}

export default observer(SpaceDetail);
