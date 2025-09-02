'use client';
import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  _id: string;
  name: string;
}

export default function CreateTeacherPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await axios.get("/api/categories");
        if (res.data?.success) {
          setCategories(res.data.data || []);
        } else {
          toast.error("Failed to load categories");
        }
      } catch (err) {
        console.error(err);
        toast.error("Network error while loading categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !username || !email || !phone || !password || !category) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        '/api/teacher',
        { name, username, email, phoneNumber: phone, password, category },
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success('Teacher account created');
        router.push('/admin/teacher');
      } else {
        toast.error(res.data.message || 'Unexpected response');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Teacher</CardTitle>
          <CardDescription>Fill in the details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="create-teacher-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Unique username"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Strong password"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="create-teacher-form"
            variant="default"
            className="w-full"
            disabled={loading || loadingCategories}
          >
            {loading ? 'Creating…' : 'Create Teacher'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}