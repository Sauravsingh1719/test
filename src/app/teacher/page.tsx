import React from 'react'
import { authOptions } from '../api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'

export default async function Page() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name || 'Guest';
  const category = session?.user?.category?.name || 'General';

  return (
    <div>
      <div className='py-[8%] px-[20%] flex flex-col gap-5'>
        <h1 className='font-bold text-5xl'>Welcome, <span className='text-blue-500 font-extrabold'> {name}</span></h1>
        <h1 className='font-bold text-2xl'>Your assigned category: {category}</h1>
        <h1 className='font-bold text-2xl'>Other Teachers in your category: {category}</h1>
      </div>
    </div>
  );
}