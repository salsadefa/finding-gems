'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useAdminDrop,
  useAdminDrops,
  useCreateAdminDrop,
  useUpdateAdminDrop,
  usePublishAdminDrop,
  useSetAdminDropItems,
} from '@/lib/api/admin-drops';
import { Plus, Sparkles, CheckCircle2, Clock, ExternalLink, Pencil, Save, X, Hash, FileText } from 'lucide-react';

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 size={12} /> Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
      <Clock size={12} /> Draft
    </span>
  );
}

export default function DropsTab() {
  const { data, isLoading, error } = useAdminDrops({ page: 1, limit: 50 });
  const drops = useMemo(() => data?.drops ?? [], [data?.drops]);
  const createDrop = useCreateAdminDrop();
  const updateDrop = useUpdateAdminDrop();
  const publishDrop = usePublishAdminDrop();
  const setItems = useSetAdminDropItems();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = selectedId ?? (drops[0]?.id ?? null);
  const selected = useMemo(() => drops.find((d) => d.id === effectiveSelectedId) || null, [drops, effectiveSelectedId]);

  const { data: detail } = useAdminDrop(effectiveSelectedId || '');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Items form state
  const [itemsText, setItemsText] = useState('');
  const [notesEnabled, setNotesEnabled] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Sync edit fields when selected drop changes
  useEffect(() => {
    if (selected) {
      setEditTitle(selected.title || '');
      setEditDescription(selected.description || '');
      setIsEditing(false);
    }
  }, [selected]);

  // Populate items text when detail loads
  useEffect(() => {
    if (detail?.items?.length) {
      const lines = detail.items
        .sort((a, b) => a.position - b.position)
        .map((it) => {
          const slug = it.websiteSlug || it.websiteId;
          return it.note ? `${slug} | ${it.note}` : slug;
        })
        .join('\n');
      setItemsText(lines);
    } else {
      setItemsText('');
    }
  }, [detail?.items]);

  const parseItems = () => {
    const lines = itemsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((line) => {
      const [slug, ...rest] = line.split('|').map((p) => p.trim());
      const note = notesEnabled ? rest.join(' | ').trim() : '';
      return {
        websiteSlug: slug,
        ...(note ? { note } : {}),
      };
    });
  };

  const handleSaveEdit = () => {
    if (!effectiveSelectedId) return;
    updateDrop.mutate(
      {
        id: effectiveSelectedId,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">Weekly Drops</h2>
            <p className="text-sm text-gray-500 mt-1">Curated collections that appear on the homepage.</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Drops</p>
                <span className="text-xs text-gray-400">{drops.length} total</span>
              </div>
              {isLoading ? (
                <div className="p-8 text-gray-500">Loading...</div>
              ) : error ? (
                <div className="p-8 text-red-600">Failed to load drops.</div>
              ) : drops.length === 0 ? (
                <div className="p-8 text-gray-500">No drops yet.</div>
              ) : (
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {drops.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${effectiveSelectedId === d.id ? 'bg-blue-50/60 border-l-2 border-l-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.title}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">/{d.slug}</p>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 p-4 bg-white">
              <p className="text-sm font-semibold text-gray-900 mb-3">Create new drop</p>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!title.trim()) return;
                  createDrop.mutate(
                    { title: title.trim(), description: description.trim() || undefined },
                    {
                      onSuccess: (drop) => {
                        setTitle('');
                        setDescription('');
                        setSelectedId(drop.id);
                      },
                    }
                  );
                }}
              >
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Drop title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description (optional)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[90px]"
                />
                <button
                  type="submit"
                  disabled={createDrop.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white font-semibold disabled:opacity-40"
                >
                  <Plus size={16} />
                  {createDrop.isPending ? 'Creating...' : 'Create drop'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selected ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                Select a drop to edit.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-white">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                          placeholder="Drop title"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[60px]"
                          placeholder="Description"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                          <Sparkles size={14} />
                          {selected.status === 'published' ? 'Live on homepage' : 'Draft'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mt-2 truncate">{selected.title}</h3>
                        {selected.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{selected.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">/{selected.slug}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={updateDrop.isPending}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"
                        >
                          <Save size={14} />
                          {updateDrop.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditTitle(selected.title || '');
                            setEditDescription(selected.description || '');
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <Link
                          href={`/drops/${selected.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                        >
                          Preview <ExternalLink size={14} />
                        </Link>
                        {selected.status !== 'published' && (
                          <button
                            onClick={() => publishDrop.mutate(selected.id)}
                            disabled={publishDrop.isPending}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"
                          >
                            Publish
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Items editor */}
                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">Items</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Paste website slugs (one per line). Optionally add a note using <span className="font-mono">|</span>.
                    </p>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={notesEnabled}
                        onChange={(e) => setNotesEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      Notes enabled
                    </label>
                    <textarea
                      value={itemsText}
                      onChange={(e) => setItemsText(e.target.value)}
                      placeholder={`example-tool\nlanding-kit | Great for quick MVP\nforms-helper | Best-in-class UX`}
                      className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[180px] font-mono text-sm"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">Current items: {detail?.items?.length || 0}</p>
                      <button
                        onClick={() => {
                          if (!effectiveSelectedId) return;
                          const items = parseItems();
                          setItems.mutate({ id: effectiveSelectedId, items });
                        }}
                        disabled={!effectiveSelectedId || setItems.isPending}
                        className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold disabled:opacity-40"
                      >
                        {setItems.isPending ? 'Saving...' : 'Save items'}
                      </button>
                    </div>
                  </div>

                  {/* Current items preview — improved display */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b bg-white flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">Current Items</p>
                      <span className="text-xs text-gray-400 ml-auto">{detail?.items?.length || 0} items</span>
                    </div>
                    <div className="p-4 text-sm text-gray-700">
                      {detail?.items?.length ? (
                        <div className="space-y-2">
                          {detail.items
                            .sort((a, b) => a.position - b.position)
                            .map((it) => (
                              <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-xs font-bold text-gray-600 flex-shrink-0">
                                  {it.position}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {it.websiteName || it.websiteSlug || it.websiteId}
                                  </p>
                                  {it.websiteName && it.websiteSlug && (
                                    <p className="text-xs text-gray-400 truncate font-mono">/{it.websiteSlug}</p>
                                  )}
                                  {it.note && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{it.note}</p>
                                  )}
                                </div>
                                <Hash size={12} className="text-gray-300 flex-shrink-0" />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No items yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
