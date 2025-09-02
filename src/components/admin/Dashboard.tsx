// app/admin/page.tsx
import React from 'react'
import Total from './Total'
import TestCreate from '../Testcreate'
import StudentTestList from '../student/TestList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Test Management</TabsTrigger>
          <TabsTrigger value="create">Create Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tests</CardTitle>
              <CardDescription>
                View and manage all tests on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentTestList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Test</CardTitle>
              <CardDescription>
                Build a new test with questions and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestCreate />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard