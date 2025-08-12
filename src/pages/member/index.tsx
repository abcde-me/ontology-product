import React from 'react';
import MemberProvider from './components/MemberProvider';
import Search from './components/Search';
import MemberTable from './components/MemberTable';
import PreDelModal from './components/PreDelModal';

export default function Member() {
  return (
    <MemberProvider>
      <div
        className="knowledgeList py-[20px] pr-[20px]"
        style={{ height: '100%' }}
      >
        <div
          className="overflow-auto rounded-[12px] bg-white px-[24px] py-[20px]"
          style={{ height: '100%' }}
        >
          <div className="mb-5 text-[20px] font-[500] text-[#0F172A]">
            成员管理
          </div>
          <Search />
          <div className="mt-4">
            <MemberTable />
          </div>
        </div>
      </div>
      <PreDelModal />
    </MemberProvider>
  );
}
