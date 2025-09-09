import React from 'react';



export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex  min-h-screen pt-[4%] bg-blue-100">
      <main className="flex-1 p-6 ">
        {children}
      </main>
    </div>
  );
}