// add-category/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, X, ArrowLeft } from 'lucide-react';

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
        toast.success('Category created successfully');
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
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
          <CardDescription>
            Add a new category to organize your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Electronics, Clothing, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Subcategories</Label>
              <div className="space-y-3">
                {subcategories.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={sub}
                      onChange={(e) => {
                        const updated = [...subcategories];
                        updated[idx] = e.target.value;
                        setSubcategories(updated);
                      }}
                      placeholder={`Subcategory ${idx + 1}`}
                    />
                    {subcategories.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSubcategories((prev) => 
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubcategories((prev) => [...prev, ''])}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Subcategory
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Creating Category...' : 'Create Category'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}