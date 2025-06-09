import {
  Button,
  Dropdown,
  Empty,
  Link,
  Menu,
  Message,
  Space,
  Spin,
  Tag
} from '@arco-design/web-react';
import {
  IconSettings,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { SearchBox, Table } from '@ccf2e/arco-material';
import { CreateSpaceModal } from './createSpaceModal';

function SpaceMgmt(props) {
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [searchResult, setSearchResult] = useState({});
  const [list, setList] = useState([
    { id: 'xxxx', name: 'space1', desc: 'space1' },
    { id: 'xxxx2', name: 'space2', desc: 'space1' },
    { id: 'xxxx3', name: 'space3', desc: 'space1' },
    { id: 'xxxx4', name: 'space4', desc: 'space1' }
  ])

  const columns = React.useMemo(() => {
    return [
      {
        title: '空间名称',
        dataIndex: 'name',
        width: 260
      },
      {
        title: '空间ID',
        dataIndex: 'id',
        width: 260
      },
      {
        title: '空间描述',
        dataIndex: 'desc',
        width: 260,
      },
      {
        title: '新建时间',
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
              <Link onClick={() => {
                history.push('/tenant/compute/appforge/spaceDetail')
              }}>进入空间</Link>
              <Link onClick={() => {
                setShowModal(true)
              }}>编辑</Link>
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
          <div className="mb-[20px] flex items-center justify-between">
            <div className="text-[20px] font-[500] leading-[32px] text-[var(--color-text-1)]">
              空间列表
            </div>
            <Button
              type="primary"
              onClick={() => {setShowModal(true)}}
            >
              新建空间
            </Button>
          </div>
          <div className="mb-[16px] flex justify-between">
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
                type="outline"
                icon={<IconSettings />}
                onClick={() => {}}
              />
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
              pagination={{ total: 100 }}
              data={list}
              scroll={{ x: true }}
              rowKey="id"
              onChange={() => {}}
            />
          )}
        </div>
      </div>
      { showModal && <CreateSpaceModal visible={showModal} setVisible={setShowModal} />}
    </Spin>
  );
}

export default observer(SpaceMgmt);
