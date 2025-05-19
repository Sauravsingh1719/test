'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CategoryData {
  _id: string;
  name: string;
  description: string;
  subcategories: number;
  createdAt: string;
}

export default function CategoryDetails() {
  const { categoryId } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [name, setName]         = useState('');
  const [description, setDescription] = useState('');

  // Fetch one category
  useEffect(() => {
    axios
      .get<{ success: boolean; data: CategoryData }>(`/api/categories/${categoryId}`, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setCategory(res.data.data);
          setName(res.data.data.name);
          setDescription(res.data.data.description);
        } else {
          throw new Error(res.data.error || 'Not found');
        }
      })
      .catch(err => setError(err.message || 'Error loading category'))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleUpdate = () => {
    axios
      .put(
        `/api/categories/${categoryId}`,
        { name, description },
        { withCredentials: true }
      )
      .then(res => {
        if (res.data.success) {
          toast.success('Category updated');
          router.refresh(); // refetch list/details
        } else {
          toast.error(res.data.error || 'Update failed');
        }
      })
      .catch(err => toast.error(err.response?.data?.message || 'Error updating'))
  };

  const handleDelete = () => {
    axios
      .delete(`/api/categories/${categoryId}`, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          toast.success('Category deleted');
          router.push('/admin/category');
        } else {
          toast.error(res.data.error || 'Delete failed');
        }
      })
      .catch(err => toast.error(err.response?.data?.message || 'Error deleting'))
  };

  if (loading) return <SkeletonCard />;
  if (error)   return <p className="text-red-500">{error}</p>;
  if (!category) return <p>Category not found</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{category.name}</h1>
      <p>{category.description || 'No description'}</p>
      <p>
        <strong>Subcategories:</strong> {category.subcategories}
      </p>
      <p>
        <strong>Created on:</strong>{' '}
        {new Date(category.createdAt).toLocaleDateString()}
      </p>

      <div className="flex gap-2">
        {/* Update Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cat-desc">Description</Label>
                  <Input
                    id="cat-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleUpdate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                This will permanently remove the category.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete}>
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
