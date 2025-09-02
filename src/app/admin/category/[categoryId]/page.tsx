// [categoryId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryData {
  _id: string;
  name: string;
  description: string;
  subcategories: Array<{ _id: string; name: string }>;
  createdAt: string;
}

export default function CategoryDetails() {
  const { categoryId } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    axios
      .get<{ success: boolean; data: CategoryData }>(
        `/api/categories/${categoryId}`,
        { withCredentials: true }
      )
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

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `/api/categories/${categoryId}`,
        { name, description },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        toast.success('Category updated successfully');
        setCategory({ ...category!, name, description });
      } else {
        toast.error(res.data.error || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating category');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `/api/categories/${categoryId}`,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        toast.success('Category deleted successfully');
        router.push('/admin/category');
      } else {
        toast.error(res.data.error || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error deleting category');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive p-3 rounded-md">
        {error}
      </div>
    );
  }

  if (!category) {
    return <p>Category not found</p>;
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            View and manage category information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subcategories</Label>
              <div className="text-sm text-muted-foreground">
                {category.subcategories.length} subcategories
              </div>
            </div>
            <div className="space-y-2">
              <Label>Created Date</Label>
              <div className="text-sm">
                {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleUpdate} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Category
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the category and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}