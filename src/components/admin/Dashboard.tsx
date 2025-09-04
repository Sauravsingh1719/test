// app/admin/page.tsx
import React from 'react'
import Total from './Total'


const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your platform, view statistics, and create content
          </p>
        </div>
      </div>

      <Total />
      
      
    </div>
  )
}

export default Dashboard