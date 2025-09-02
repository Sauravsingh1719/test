import Carousel from '@/components/student/Carousel'
import { getServerSession } from 'next-auth';
import React from 'react'
import { authOptions } from '../api/auth/[...nextauth]/options';
import Category from '@/components/Category';
import StudentTestList from '@/components/student/TestList';


export default async function Page() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name || 'Guest';

  return (
    <div>
      <div className='py-2'>
        <h1 className='font-bold text-3xl'>
          Welcome, <span className='font-extrabold text-blue-500 text-4xl uppercase'>{name}</span> {/* Corrected string interpolation */}
        </h1>
      </div>
      <div>
        <Carousel />
      </div>
      <div className='py-4 flex text-center justify-center'>
        <h1 className='font-extrabold text-5xl text-gray-300'>Ready for a new Challenge ? </h1>
      </div>
      <div>
        <Category />
      </div>
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Tests</h1>
      <StudentTestList />
    </div>
    </div>
  )
}