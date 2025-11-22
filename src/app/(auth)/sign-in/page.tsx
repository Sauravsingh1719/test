'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Button from '@/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Mail, User, Lock, Phone, BookOpen, GraduationCap, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useDebounce } from '@uidotdev/usehooks'

const signInSchema = z.object({
  identifier: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().optional(),
})

type SignInFormData = z.infer<typeof signInSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

export default function AuthTabs() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [tabError, setTabError] = useState('')
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  
  // Username availability states
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const debouncedUsername = useDebounce(username, 300)

  // Sign In Form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: '', password: '' },
  })

  // Sign Up Form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
    },
  })

  // Username availability check
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername && debouncedUsername.length >= 3) {
        setIsCheckingUsername(true)
        setUsernameMessage('')
        try {
          const response = await fetch(`/api/check-username-unique?username=${debouncedUsername}`)
          const data = await response.json()
          setUsernameMessage(data.message)
        } catch (error) {
          setUsernameMessage('Error checking username')
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [debouncedUsername])

// In your handleSignIn function
const handleSignIn = async (data: SignInFormData) => {
  setError('');
  const result = await signIn('credentials', {
    redirect: false,
    ...data,
  });

  if (result?.error) {
    // Handle verification error specifically
    if (result.error.includes('verify your email')) {
      setError('Please verify your email before signing in. Check your email for the verification code.');
      toast.error('Email Not Verified', {
        description: 'Please verify your email before signing in.',
      });
    } else {
      setError('Invalid credentials');
      toast.error('Sign In Failed', {
        description: 'Invalid email/username or password.',
      });
    }
  } else {
    router.push(`/student`);
  }
}

const handleSignUp = async (data: SignUpFormData) => {
  // Check if username is available before submitting
  if (usernameMessage !== 'Username is available') {
    setTabError('Please choose an available username')
    return
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, role: 'student' }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Sign up failed')
    }

    const result = await response.json();
    
    // Redirect to verification page instead of auto-signin
    router.push(`/verify/${data.username}`);
    
  } catch (err: any) {
    setTabError(err.message)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-gray-950">
        {/* Left panel - Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8" />
              <span className="text-2xl font-bold">Testify</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Student Portal</h2>
            <p className="text-blue-100">
              Access your courses, track your progress, and connect with educators all in one place.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-8">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold">Student Success</h4>
              <p className="text-sm text-blue-100">Join thousands of students achieving their goals</p>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 md:p-10">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">Testify</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Student Portal</h2>
          </div>
          
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as 'signin' | 'signup')
              setError('')
              setTabError('')
              setUsernameMessage('')
              setUsername('')
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400 rounded-md transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400 rounded-md transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="focus-visible:outline-none">
              <Card className="border-0 shadow-lg dark:bg-gray-900">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-gray-800 dark:text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Sign in to continue your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="identifier" className="text-gray-700 dark:text-gray-300">
                        Email or Username
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="identifier"
                          className="pl-10 py-2 h-11"
                          {...signInForm.register('identifier')}
                        />
                      </div>
                      {signInForm.formState.errors.identifier && (
                        <p className="text-sm text-red-500">
                          {signInForm.formState.errors.identifier.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <button 
                          type="button" 
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Eye /> : <EyeOff />}
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 py-2 h-11"
                          {...signInForm.register('password')}
                        />
                      </div>
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {signInForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={signInForm.formState.isSubmitting}
                    >
                      {signInForm.formState.isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="focus-visible:outline-none">
              <Card className="border-0 shadow-lg dark:bg-gray-900">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-gray-800 dark:text-white">Create Account</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Join our learning community today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input 
                          id="name" 
                          className="pl-10 py-2 h-11"
                          {...signUpForm.register('name')} 
                        />
                      </div>
                      {signUpForm.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input 
                          id="email" 
                          className="pl-10 py-2 h-11"
                          {...signUpForm.register('email')} 
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input 
                          id="username" 
                          className="pl-10 pr-10 py-2 h-11"
                          {...signUpForm.register('username')}
                          onChange={(e) => {
                            signUpForm.register('username').onChange(e);
                            setUsername(e.target.value);
                          }}
                        />
                        {isCheckingUsername && (
                          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                        )}
                        {!isCheckingUsername && usernameMessage && (
                          <div className="absolute right-3 top-3">
                            {usernameMessage === 'Username is available' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : usernameMessage === 'Username is already taken' ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      {signUpForm.formState.errors.username && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.username.message}
                        </p>
                      )}
                      {!isCheckingUsername && usernameMessage && (
                        <p className={`text-sm ${
                          usernameMessage === 'Username is available' 
                            ? 'text-green-500' 
                            : usernameMessage === 'Username is already taken'
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}>
                          {usernameMessage}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <button 
                          type="button" 
                          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? <Eye /> : <EyeOff />}
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 py-2 h-11"
                          {...signUpForm.register('password')}
                        />
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">
                        Phone Number (optional)
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input 
                          id="phoneNumber" 
                          className="pl-10 py-2 h-11"
                          {...signUpForm.register('phoneNumber')} 
                        />
                      </div>
                    </div>

                    {tabError && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{tabError}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={signUpForm.formState.isSubmitting || isCheckingUsername || (usernameMessage !== 'Username is available' && usernameMessage !== '')}
                    >
                      {signUpForm.formState.isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Sign Up'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}