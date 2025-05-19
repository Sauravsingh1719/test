'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Teacher } from '@/types/user';
import Button from '@/components/button';

export default function TeachersTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get<{ teachers: Teacher[] }>(
          '/api/teacher',
          { withCredentials: true }
        );
        setTeachers(res.data.teachers);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Error loading teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
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
    <div>
    <Table>
      <TableCaption>A list of all registered teachers</TableCaption>
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
        {teachers.map((teacher, idx) => (
          <TableRow key={teacher._id}>
            <TableCell className="font-medium">{idx + 1}</TableCell>
            <TableCell>
              <a href={`/admin/teacher/${teacher._id}`}>{teacher.name}</a>
            </TableCell>
            <TableCell>{teacher.username}</TableCell>
            <TableCell>{teacher.email}</TableCell>
            <TableCell>{teacher.phoneNumber || '-'}</TableCell>
            <TableCell className="text-right">
              {new Date(teacher.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total Teachers</TableCell>
          <TableCell className="text-right">{teachers.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    <div>
        <Button><a href='/admin/teacher/add-account'>Create</a></Button>
    </div>
    </div>
  );
}
