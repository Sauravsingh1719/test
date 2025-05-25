'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
import { Button } from '@/components/ui/button';

export interface Category {
  _id: string;
  name: string;
  description: string;
  subcategories: number;
  createdAt: string;
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const router = useRouter();

  useEffect(() => {
    axios
      .get<{ success: boolean; data: Category[] }>('/api/categories', { withCredentials: true })
      .then(res => {
        if (res.data.success) setCategories(res.data.data);
        else throw new Error('Failed to load categories');
      })
      .catch(err => setError(err.message || 'Error fetching categories'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => router.push('/admin/category/add-category')}>+ New Category</Button>
      </div>

      <Table>
        <TableCaption>All categories</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Subcats</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat, i) => (
            <TableRow key={cat._id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <a href={`/admin/category/${cat._id}`} className="font-medium hover:underline">
                  {cat.name}
                </a>
              </TableCell>
              <TableCell>{cat.description || '—'}</TableCell>
              <TableCell>
                    {cat.subcategories.map((sub, i) => (
                      <span key={sub._id}>
                        {sub.name}{i < cat.subcategories.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </TableCell>
              <TableCell className="text-right">
                {new Date(cat.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">{categories.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
