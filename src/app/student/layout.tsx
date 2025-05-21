import React from 'react';
import Sidebar from '@/components/admin/Sidebar';

import Profile from '@/components/profile';
import { BreadcrumbWithCustomSeparator } from '@/components/student/breadcrumb';
import Navbar from '@/components/student/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <Navbar/>
        <div className='py-5 flex justify-between'>
        <BreadcrumbWithCustomSeparator />
        <Profile />
        </div>
        {children}
      </main>
    </div>
  );
}