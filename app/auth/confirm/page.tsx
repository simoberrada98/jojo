'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { P } from '@/components/ui/typography';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const code = searchParams.get('code');
      const type = searchParams.get('type');

      if (code && type) {
        setStatus('loading');
        const { error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: type as 'email' | 'phone', // Supabase type expects 'email' or 'phone'
        });

        if (!error) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to dashboard...');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 2000);
        } else {
          setStatus('error');
          setMessage(`Error confirming email: ${error.message}`);
        }
      } else {
        setStatus('error');
        setMessage('Invalid confirmation link.');
      }
    };

    confirmEmail();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex justify-center items-center bg-background p-4 min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && <Loader2 className="mx-auto w-10 h-10 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle className="mx-auto w-10 h-10 text-green-500" />}
          {status === 'error' && <XCircle className="mx-auto w-10 h-10 text-destructive" />}
          {message && <P className="text-muted-foreground">{message}</P>}
        </CardContent>
      </Card>
    </div>
  );
}
