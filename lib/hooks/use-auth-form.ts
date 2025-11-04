'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';
interface AuthFormOptions {
  onSuccess?: () => void;
  onSignInSuccess?: () => void;
  onSignUpSuccess?: () => void;
}

export function useAuthForm(options?: AuthFormOptions) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    // Check for at least one lowercase, one uppercase, one digit, one symbol
    const hasLowercase = /[a-z]/.test(pwd);
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    if (!hasLowercase || !hasUppercase || !hasDigit || !hasSymbol) {
      return 'Password must include lowercase, uppercase, digits, and symbols.';
    }
    return null;
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      toast.error(signInError.message);
    } else {
      options?.onSuccess?.();
      options?.onSignInSuccess?.();
      router.refresh();
      // Reset form
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      setLoading(false);
      return;
    }

    const gravatarHash = CryptoJS.MD5(email.trim().toLowerCase()).toString();
    const gravatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=400`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: '', // Full name will be set by the user later or in a profile update
          avatar_url: gravatarUrl,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      toast.error(signUpError.message);
    } else {
      setError(null);
      toast.success('Check your email to confirm your account!');
      options?.onSuccess?.();
      options?.onSignUpSuccess?.();
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handleSignIn,
    handleSignUp,
  };
}
