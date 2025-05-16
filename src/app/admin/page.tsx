import Dashboard from '@/components/admin/Dashboard'
import Profile from '@/components/profile'
import React from 'react'

const page = () => {
  return (
    <div>
      <div className='py-5 flex justify-between'>
        <h2 className="text-4xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div>
        <Dashboard />
      </div>
    </div>
  )
}

export default page