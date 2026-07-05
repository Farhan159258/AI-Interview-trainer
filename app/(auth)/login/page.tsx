'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginWithEmail } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await loginWithEmail(values.email, values.password);
      Cookies.set('session_active', '1', { expires: 14 });
      router.push(searchParams.get('redirect') || '/dashboard');
    } catch (err) {
      setServerError('Incorrect email or password. Try again.');
    }
  };

  return (
    <GlassPanel className="p-7">
      <h1 className="font-display text-xl font-semibold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-white/50">Log in to continue practicing.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-white/50 hover:text-white">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary-300 hover:underline">
          Sign up
        </Link>
      </p>
    </GlassPanel>
  );
}

// Next.js requires any component that calls useSearchParams() to be wrapped
// in a <Suspense> boundary, or static prerendering fails at build time.
export default function LoginPage() {
  return (
    <Suspense fallback={<GlassPanel className="p-7 text-center text-sm text-white/40">Loading…</GlassPanel>}>
      <LoginForm />
    </Suspense>
  );
}