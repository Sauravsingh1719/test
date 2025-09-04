
import React from 'react';
import Navbar from '@/components/admin/Navbar';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6">
        <Navbar/>
        {children}
      
      </main>
    </div>
  );
}