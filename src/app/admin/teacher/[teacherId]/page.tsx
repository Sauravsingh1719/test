'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import SkeletonCard from '@/components/SkeletonLoading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Button from '@/components/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
  category: Category; // Changed from string to Category object
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
        router.push(`/admin/teacher/${teacherId}`);
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

  if (loading) return <div><SkeletonCard /></div>;
  if (error) return <div>Error: {error}</div>;
  if (!teacher) return <div>Teacher not found</div>;

  return (
    <div>
      <h2 className="font-medium text-3xl text-gray-600">Teacher's Profile</h2>
      <div className="font-extrabold text-5xl py-6">{teacher.name}</div>
      <div className="pl-5 font-semibold text-xl">
        <div>Username: {teacher.username}</div>
        <div>Email: {teacher.email}</div>
        <div>Phone: {teacher.phoneNumber || '-'}</div>
        <div>Category: {teacher.category?.name || '-'}</div>
        <div>Joined: {new Date(teacher.createdAt).toLocaleDateString()}</div>
      </div>

      <div className="flex py-5 gap-2">
        {/* Update Dialog */}
        <Dialog>
          <DialogTrigger>
            <Button>Update</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Teacher</DialogTitle>
              <DialogDescription className="flex flex-col gap-4 py-4">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="New phone number"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog>
          <DialogTrigger>
            <Button className='bg-red-800'>Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Teacher</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete
                this teacher account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className='bg-red-800' onClick={handleDelete}>
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}