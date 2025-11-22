'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, ArrowLeft, CheckCircle, Clock, RefreshCw, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner'; // Replace useToast with sonner

const verifySchema = z.object({
  code: z.string().min(6, {
    message: "Verification code must be 6 digits",
  }).max(6),
});

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: params.username,
          code: data.code,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Account Verified! 🎉', {
          description: result.message,
        });
        router.replace('/sign-in');
      } else {
        toast.error('Verification Failed', {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error('Verification Failed', {
        description: 'An error occurred. Please try again.',
      });
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // We'll implement resend functionality later
      // For now, just show a message
      toast.info('Feature Coming Soon', {
        description: 'Resend functionality will be implemented in the next update.',
      });
      
      setCountdown(60); // 60 seconds countdown
    } catch (error) {
      toast.error('Failed to Resend', {
        description: 'Unable to send verification code. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-lg dark:bg-gray-900">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Verify Your Account
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
                Enter the 6-digit code sent to your email
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Verification Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Verification sent to your email
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    The code will expire in 1 hour for security reasons.
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Verification Code Field */}
                <FormField
                  name="code"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Verification Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="text-center text-lg font-mono tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                        Enter the 6-digit code exactly as shown in the email
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Verify Button */}
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Account
                </Button>
              </form>
            </Form>

            {/* Resend Code Section */}
            <div className="text-center space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Didn't receive the code?
                </p>
                <Button
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Code
                    </>
                  )}
                </Button>
              </div>

              {/* Back to Sign In */}
              <Link 
                href="/sign-in" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors group text-sm"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>
            </div>

            {/* Help Text */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Tip:</strong> Check your spam folder if you don't see the email. 
                  Make sure to enter the code quickly as it expires in 1 hour.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}