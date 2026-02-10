import { Suspense } from 'react';
import LoginClient from './login-client';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-slate-50 text-slate-500">
          Loading...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
