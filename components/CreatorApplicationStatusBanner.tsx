'use client';

import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import type { CreatorApplication } from '@/lib/api/creator-application';

type Props = {
  application: CreatorApplication;
};

function Step({ label, state }: { label: string; state: 'done' | 'current' | 'todo' | 'error' }) {
  const base = 'flex items-center gap-2 text-xs font-medium';
  const dotBase = 'w-6 h-6 rounded-full flex items-center justify-center border';

  if (state === 'done') {
    return (
      <div className={`${base} text-emerald-700`}>
        <span className={`${dotBase} bg-emerald-50 border-emerald-200`}>
          <CheckCircle2 size={14} />
        </span>
        <span>{label}</span>
      </div>
    );
  }

  if (state === 'current') {
    return (
      <div className={`${base} text-amber-800`}>
        <span className={`${dotBase} bg-amber-50 border-amber-200`}>
          <Clock size={14} />
        </span>
        <span>{label}</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`${base} text-red-700`}>
        <span className={`${dotBase} bg-red-50 border-red-200`}>
          <XCircle size={14} />
        </span>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className={`${base} text-gray-500`}>
      <span className={`${dotBase} bg-white border-gray-200`}>
        <span className="w-2 h-2 rounded-full bg-gray-300" />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function CreatorApplicationStatusBanner({ application }: Props) {
  const status = application.status;
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  const tone = isApproved
    ? 'border-emerald-200 bg-emerald-50/50'
    : isRejected
      ? 'border-red-200 bg-red-50/40'
      : 'border-amber-200 bg-amber-50/40';

  const title = isApproved
    ? 'Creator application approved'
    : isRejected
      ? 'Creator application needs changes'
      : 'Creator application under review';

  const desc = isApproved
    ? 'You can start listing your tools. If the Creator Studio is still locked, log out and log in again to refresh your role.'
    : isRejected
      ? (application.rejectionReason
          ? `We couldn\'t approve your application yet. Reason: ${application.rejectionReason}`
          : "We couldn't approve your application yet. Please review and resubmit.")
      : 'We\'re reviewing your submission. Typical review time: 1-2 business days.';

  const steps: Array<{ label: string; state: 'done' | 'current' | 'todo' | 'error' }> = [
    { label: 'Submitted', state: 'done' },
    { label: 'In review', state: isRejected ? 'error' : isPending ? 'current' : 'done' },
    { label: 'Approved', state: isApproved ? 'done' : 'todo' },
  ];

  return (
    <div className={`w-full border rounded-2xl p-5 md:p-6 ${tone}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-700 mt-1">{desc}</p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            {steps.map((s) => (
              <Step key={s.label} label={s.label} state={s.state} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={isApproved ? '/creator' : '/apply-creator'}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isApproved ? 'Open Creator Studio' : isRejected ? 'Review & reapply' : 'View submission'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
