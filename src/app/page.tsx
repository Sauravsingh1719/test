import TestifyPass from '@/components/Fifth'
import Fourth from '@/components/Fourth'
import Hero from '@/components/Hero'

import StudentTestList from '@/components/student/TestList'
import Third from '@/components/Third'
import React from 'react'

const page = () => {
  return (
    <div className='w-full h-screen bg-blue-200'>
      <Hero />
      <div className='px-[20%] bg-blue-200'>
        <div className='pb-10'>
          <h2 className='text-5xl font-bold text-blue-700 '>Featured Tests 📝</h2>
        </div>
        <div className='py-4'>
          <StudentTestList />
        </div>
      </div>
      <div>
        <Third />
      </div>
      <div>
        <Fourth/>
      </div>
      <div>
        <TestifyPass />
      </div>
      
    </div>
  )
}

export default page