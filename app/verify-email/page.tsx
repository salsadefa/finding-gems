import { Suspense } from 'react';
import VerifyEmailClient from './verify-email-client';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center text-gray-500">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
