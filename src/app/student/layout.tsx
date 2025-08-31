import React from 'react';


import Profile from '@/components/profile';
import { BreadcrumbWithCustomSeparator } from '@/components/student/breadcrumb';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen pt-[4%] bg-blue-100">
      <main className="flex-1 p-6">
        <div className='py-5 flex justify-between'>
        <BreadcrumbWithCustomSeparator />
        <Profile />
        </div>
        {children}
      </main>
    </div>
  );
}