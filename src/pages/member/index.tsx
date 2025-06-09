import React from 'react';
import MemberProvider from './components/MemberProvider';
import Search from './components/Search';
import MemberTable from './components/MemberTable';

export default function Member() {
  return (
    <MemberProvider>
      <div className="m-2 rounded-lg bg-white p-6">
        <div className="mb-5 text-2xl font-bold text-[#0F172A]">成员管理</div>
        <Search />
        <div className="mt-4">
          <MemberTable />
        </div>
      </div>
    </MemberProvider>
  );
}
