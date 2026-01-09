'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useToast } from '@/lib/store';
import { mockCategories } from '@/lib/mockData';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

export default function AdminCategoriesPage() {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [categories, setCategories] = useState(mockCategories);
    const [showModal, setShowModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    if (!isAuthenticated || user?.role !== 'admin') {
        return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h1>Admin Access Required</h1></div>;
    }

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
        setCategories(prev => [...prev, { id: `cat-new-${Date.now()}`, name: newCategoryName, slug, websiteCount: 0 }]);
        showToast('Category added!', 'success');
        setNewCategoryName('');
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast('Category deleted', 'info');
    };

    return (
        <div className="categories-page">
            <div className="container">
                <Link href="/admin" className="back-link">← Back to Dashboard</Link>
                <div className="page-header">
                    <div>
                        <h1>Category Management</h1>
                        <p>Add, edit, or remove marketplace categories</p>
                    </div>
                    <Button onClick={() => setShowModal(true)}>+ Add Category</Button>
                </div>

                <div className="categories-table">
                    <div className="table-header">
                        <span>Name</span>
                        <span>Slug</span>
                        <span>Websites</span>
                        <span>Actions</span>
                    </div>
                    {categories.map(cat => (
                        <div key={cat.id} className="table-row">
                            <span className="name">{cat.name}</span>
                            <span className="slug">{cat.slug}</span>
                            <span>{cat.websiteCount}</span>
                            <span className="actions">
                                <Button size="sm" variant="ghost">Edit</Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)}>Delete</Button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Category">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input label="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Marketing" />
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleAddCategory}>Add Category</Button>
                    </div>
                </div>
            </Modal>

            <style jsx>{`
        .categories-page { padding: 32px 0 64px; min-height: 80vh; }
        .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        h1 { font-size: 2rem; font-weight: 700; }
        .page-header p { color: var(--gray-500); margin-top: 4px; }
        .categories-table { background: var(--gray-50); border-radius: 16px; overflow: hidden; }
        .table-header, .table-row { display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1.5fr; gap: 16px; padding: 16px 24px; align-items: center; }
        .table-header { background: var(--gray-100); font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--gray-500); }
        .table-row { border-bottom: 1px solid var(--gray-200); font-size: 14px; } .table-row:last-child { border-bottom: none; }
        .name { font-weight: 500; }
        .slug { font-family: monospace; font-size: 13px; color: var(--gray-500); }
        .actions { display: flex; gap: 8px; }
      `}</style>
        </div>
    );
}
