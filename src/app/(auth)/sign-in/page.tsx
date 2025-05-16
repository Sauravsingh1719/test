'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const signInSchema = z.object({
  identifier: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function AuthTabs() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [tabError, setTabError] = useState('');
  const [activeTab, setActiveTab] = useState('signin');

  // Sign In Form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: '', password: '' },
  });

  // Sign Up Form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', email: '', password: '', name: '', phoneNumber: '' },
  });

  const handleSignIn = async (data: SignInFormData) => {
    setError('');
    const result = await signIn('credentials', {
      redirect: false,
      ...data,
      callbackUrl: '/admin',
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/admin');
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'student' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign up failed');
      } alert('Account created successfully')

      // Auto-signin after successful registration
      await signIn('credentials', {
        redirect: false,
        identifier: data.email,
        password: data.password,
      });
      router.push('/admin');
    } catch (err: any) {
      setTabError(err.message);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      {/* Sign In Tab */}
      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your student account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)}>
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  {...signInForm.register('identifier')}
                />
                {signInForm.formState.errors.identifier && (
                  <p className="text-sm text-red-500">
                    {signInForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...signInForm.register('password')}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={signInForm.formState.isSubmitting}
              >
                {signInForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sign Up Tab */}
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Register as a new student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...signUpForm.register('name')} />
                {signUpForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...signUpForm.register('email')} />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...signUpForm.register('username')} />
                {signUpForm.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...signUpForm.register('password')}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                <Input id="phoneNumber" {...signUpForm.register('phoneNumber')} />
              </div>
              {tabError && <p className="text-sm text-red-500">{tabError}</p>}
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}