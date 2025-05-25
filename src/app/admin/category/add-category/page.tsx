'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreateCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error('Category name is required');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        description,
        subcategories: subcategories
          .filter((sub) => sub.trim() !== '')
          .map((sub) => ({ name: sub.trim() })),
      };

      const res = await axios.post('/api/categories', payload, {
        withCredentials: true,
      });

      if (res.status === 201 && res.data.success) {
        toast.success('Category created');
        router.push('/admin/category');
      } else {
        toast.error(res.data.error || 'Failed to create category');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error creating category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <Card>
        <CardHeader>
          <CardTitle>New Category</CardTitle>
          <CardDescription>Create a new category for your tests</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Science"
              />
            </div>

            {/* Category Description */}
            <div>
              <Label htmlFor="cat-desc">Description</Label>
              <Input
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional short description"
              />
            </div>

            {/* Subcategories */}
            <div>
              <Label>Subcategories</Label>
              {subcategories.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                  <Input
                    value={sub}
                    onChange={(e) => {
                      const updated = [...subcategories];
                      updated[idx] = e.target.value;
                      setSubcategories(updated);
                    }}
                    placeholder={`Subcategory ${idx + 1}`}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      setSubcategories((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    X
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setSubcategories((prev) => [...prev, ''])}
              >
                + Add Subcategory
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            form="category-form"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Category'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
