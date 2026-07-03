'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/hooks/useAuth';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPassword(values.email);
    } finally {
      // Always show success to avoid leaking which emails are registered.
      setSent(true);
    }
  };

  return (
    <GlassPanel className="p-7">
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <h1 className="font-display text-lg font-semibold text-white">Check your inbox</h1>
          <p className="text-sm text-white/50">
            If an account exists for that email, we've sent a link to reset your password.
          </p>
          <Link href="/login" className="mt-2 text-sm text-primary-300 hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-xl font-semibold text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-white/50">We'll email you a link to get back in.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Button type="submit" loading={isSubmitting} className="w-full">
              Send reset link
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-white/50">
            <Link href="/login" className="text-primary-300 hover:underline">
              Back to login
            </Link>
          </p>
        </>
      )}
    </GlassPanel>
  );
}
