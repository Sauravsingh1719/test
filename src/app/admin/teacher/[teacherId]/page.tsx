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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Folder, 
  Edit, 
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
  category: Category;
}

export default function TeacherDetails() {
  const router = useRouter();
  const { teacherId } = useParams();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axios.get(`/api/teacher/${teacherId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setTeacher(res.data.teacher);
          setPhoneNumber(res.data.teacher.phoneNumber || '');
        } else {
          throw new Error(res.data.message || 'Failed to load teacher');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `/api/teacher/${teacherId}`,
        { phoneNumber, password },
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success('Teacher updated successfully.');
        // Refresh teacher data
        const teacherRes = await axios.get(`/api/teacher/${teacherId}`, {
          withCredentials: true,
        });
        if (teacherRes.data.success) {
          setTeacher(teacherRes.data.teacher);
        }
      } else {
        toast.error(res.data.message || 'Unexpected response');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error updating teacher');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/api/teacher/${teacherId}`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        toast.success('Teacher deleted successfully.', {
          description: 'This teacher account has been removed.',
        });
        router.push('/admin/teacher');
      } else {
        toast.error(res.data.message || 'Unexpected response');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error deleting teacher');
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
            <CardDescription>Failed to load teacher details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Teacher Not Found</CardTitle>
            <CardDescription>The requested teacher could not be found</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Teachers
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">{teacher.name}</CardTitle>
              <CardDescription>Teacher Profile</CardDescription>
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
                    <p className="font-medium">@{teacher.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{teacher.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline">{teacher.category?.name || 'Not assigned'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(teacher.createdAt).toLocaleDateString()}
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
                      <DialogTitle>Update Teacher Details</DialogTitle>
                      <DialogDescription>
                        Update the teacher's contact information or reset their password.
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
                        Delete Teacher Account
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the teacher
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