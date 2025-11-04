'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { P } from '@/components/ui/typography';
import { useAuthForm } from '@/lib/hooks/use-auth-form';

export default function SignupPage() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleSignUp,
  } = useAuthForm({
    onSignUpSuccess: () => {
      router.push('/dashboard');
      router.refresh();
    },
  });

  useEffect(() => {
    if (error) {
      // setShowErrorDialog(true); // Re-enable if AlertDialog is desired
    }
  }, [error]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp();
  };

  return (
    <div className="flex justify-center items-center bg-background p-4 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join Jhuangnyc to start shopping</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {/* Full Name input removed for now, assuming profile update later */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters, with uppercase, lowercase, digits, and symbols"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <P className="text-muted-foreground text-sm text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </P>
          </CardFooter>
        </form>
      </Card>

      {/* AlertDialog for errors - currently commented out */}
      {/* <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Up Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
