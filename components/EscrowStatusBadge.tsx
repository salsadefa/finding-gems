'use client';

import React from 'react';

export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

const STYLES: Record<EscrowStatus, { className: string; label: string }> = {
  held: {
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Held',
  },
  released: {
    className: 'bg-green-50 text-green-700 border-green-200',
    label: 'Released',
  },
  refunded: {
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    label: 'Refunded',
  },
  disputed: {
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    label: 'Refund Requested',
  },
};

export default function EscrowStatusBadge({
  status,
  className = '',
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const normalized = typeof status === 'string' ? status.toLowerCase() : '';
  const value = (normalized as EscrowStatus) || null;

  if (!value || !(value in STYLES)) return null;

  const { className: base, label } = STYLES[value];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${base} ${className}`}
    >
      {label}
    </span>
  );
}
