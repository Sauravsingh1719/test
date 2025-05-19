'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
} from "@/components/ui/dialog"
import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { toast } from "sonner"





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
  const [studentId, setStudentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('')
 
  const handleUpdate = async () => {
    try {
      const res = await axios.put(`/api/students/${params.studentId}`, {
        phoneNumber,
        password
      })

      if (res.status === 200) {
      setMessage(res.data.message || 'Student updated successfully');
      toast.success("Account updated successfully.")
      router.push(`/admin/students/${params.studentId}`);
    } else {
      setMessage(res.data.message || 'Unexpected response');
    }
            
    } catch (error: any) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Error updating student')
    }
  }

const handleDelete = async () => {
  try {
    const res = await axios.delete(`/api/students/${params.studentId}`, {
      withCredentials: true,
    });

    if (res.status === 200) {
      setMessage(res.data.message || 'Student deleted successfully');
      toast.success("Account deleted successfully", {
        description: "Account has been deleted permanently.", 
      })
      router.push('/admin/students');
    } else {
      setMessage(res.data.message || 'Unexpected response');
    }

  } catch (error: any) {
    console.error(error);
    setMessage(error.response?.data?.message || 'Error deleting student');
  }
};



  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`/api/students/${params.studentId}`, {
          withCredentials: true
        });

        if (response.data.success) {
          setStudent(response.data.student);
           
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

  if (loading) {
    return <div><SkeletonCard/></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div>
        <div>
            <h2 className='font-medium text-3xl text-gray-600'>Student's Profile</h2>
        </div>
        <div className='font-extrabold text-5xl  py-6'>
            <h2>{student.name}</h2>
        </div>
        <div className='pl-5 font-semibold text-xl'>
                <h2>Username:    {student.username}</h2>
                <h2>Email:  {student.email}</h2>
                <h2>Number:  {student.phoneNumber}</h2>
                <h2>Created At: {new Date(student.createdAt).toLocaleDateString()}</h2>
        </div>
        <div className='flex py-5 gap-2'>
        <div >
        <Dialog>
            <DialogTrigger>
              <Button>Update</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Details</DialogTitle>
                <DialogDescription className='flex flex-col gap-5 py-5'>
                                <Input value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="New phone number"/>

                                <Input value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password"
                    />
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={handleUpdate}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
        <div>
          <Dialog>
              <DialogTrigger>
                <Button>Delete</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure want to delete account?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter onClick={handleDelete}>
                  <Button>Yes</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>

        </div>
        </div>
    </div>
  );
}