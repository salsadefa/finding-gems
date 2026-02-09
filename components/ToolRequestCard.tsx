'use client';

import Link from 'next/link';
import { MessageSquare, Clock, Tag } from 'lucide-react';
import type { ToolRequestListItem } from '@/lib/api/tool-requests';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ToolRequestCard({ request }: { request: ToolRequestListItem }) {
  const isSolved = Boolean(request.solvedAt || request.selectedResponseId);
  const budget =
    request.budgetMin || request.budgetMax
      ? `${request.currency} ${request.budgetMin ? request.budgetMin.toLocaleString() : '0'} - ${
          request.budgetMax ? request.budgetMax.toLocaleString() : 'Flexible'
        }`
      : null;

  return (
    <Link href={`/requests/${request.id}`} className="block">
      <div className="p-5 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all">
          <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{request.title}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                request.status === 'open'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {request.status === 'open' ? 'Open' : isSolved ? 'Solved' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {timeAgo(request.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={14} />
            {request.responseCount} responses
          </span>
          {request.category?.name && (
            <span className="inline-flex items-center gap-1">
              <Tag size={14} />
              {request.category.name}
            </span>
          )}
          {budget && <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">{budget}</span>}
        </div>
      </div>
    </Link>
  );
}
