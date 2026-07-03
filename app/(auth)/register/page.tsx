'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { registerWithEmail } from '@/hooks/useAuth';

const schema = z.object({
  displayName: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await registerWithEmail(values.email, values.password, values.displayName);
      Cookies.set('session_active', '1', { expires: 14 });
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(
        err?.code === 'auth/email-already-in-use'
          ? 'That email is already registered — try logging in instead.'
          : 'Something went wrong creating your account. Please try again.'
      );
    }
  };

  return (
    <GlassPanel className="p-7">
      <h1 className="font-display text-xl font-semibold text-white">Create your account</h1>
      <p className="mt-1 text-sm text-white/50">Start running mock interviews in minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input label="Full name" placeholder="Jordan Lee" error={errors.displayName?.message} {...register('displayName')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="At least 6 characters" error={errors.password?.message} {...register('password')} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-300 hover:underline">
          Log in
        </Link>
      </p>
    </GlassPanel>
  );
}
