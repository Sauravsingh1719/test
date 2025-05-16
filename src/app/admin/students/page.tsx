'use client';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Student } from '@/types/user';

export default function StudentsTable() {
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        // Type the response data
        const data: { students: Student[] } = await response.json();
        setStudents(data.students);
      } catch (err) {
        // Handle error type properly
        setError(err instanceof Error ? err.message : 'Error loading student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Table>
      <TableCaption>A list of all registered students</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Joined Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student, index) => (
          <TableRow key={student._id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.username}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{student.phoneNumber || '-'}</TableCell>
            <TableCell className="text-right">
              {new Date(student.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total Students</TableCell>
          <TableCell className="text-right">{students.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}