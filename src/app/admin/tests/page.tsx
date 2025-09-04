import React from 'react'
import StudentTestList from '@/components/student/TestList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminCreateTestPage from '@/components/admin/test-creation/page'

function page() {
  return (
    <div>
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
             <AdminCreateTestPage />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default page