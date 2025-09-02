'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2,
  Save,
  AlertTriangle,
  GraduationCap
} from 'lucide-react'

interface Student {
  _id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
}

export default function StudentDetails() {
  const router = useRouter();
  const params = useParams();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`/api/students/${params.studentId}`, {
          withCredentials: true
        });

        if (response.data.success) {
          setStudent(response.data.student);
          setPhoneNumber(response.data.student.phoneNumber || '');
        } else {
          throw new Error(response.data.message || 'Failed to fetch student');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 
                err.message || 
                'Error loading student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.studentId]);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`/api/students/${params.studentId}`, {
        phoneNumber,
        password
      })

      if (res.status === 200) {
        toast.success("Account updated successfully.");
        // Refresh student data
        const studentRes = await axios.get(`/api/students/${params.studentId}`, {
          withCredentials: true,
        });
        if (studentRes.data.success) {
          setStudent(studentRes.data.student);
        }
      } else {
        toast.error(res.data.message || 'Unexpected response');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error updating student');
    }
  }

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/api/students/${params.studentId}`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        toast.success("Account deleted successfully", {
          description: "Account has been deleted permanently.", 
        });
        router.push('/admin/students');
      } else {
        toast.error(res.data.message || 'Unexpected response');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error deleting student');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load student details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>The requested student could not be found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">{student.name}</CardTitle>
              <CardDescription>Student Profile</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">@{student.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Actions</h3>
              <div className="flex flex-col gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Edit className="h-4 w-4" /> Update Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Student Details</DialogTitle>
                      <DialogDescription>
                        Update the student's contact information or reset their password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password (leave blank to keep current)"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleUpdate} className="gap-2">
                        <Save className="h-4 w-4" /> Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" /> Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Student Account
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the student
                        account and remove all associated data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="destructive" onClick={handleDelete} className="gap-2">
                        <Trash2 className="h-4 w-4" /> Yes, Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}