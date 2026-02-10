import { Suspense } from 'react';
import MessagesClient from './messages-client';

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-12 flex items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <MessagesClient />
    </Suspense>
  );
}
