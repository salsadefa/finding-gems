'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  type Category
} from '@/lib/api/categories';
import { Input } from '@/components/Input';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { Loader2, Pencil, Trash2, Plus, X, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
    const { user, isAuthenticated } = useAuth();
    
    // API Hooks
    const { data: categories, isLoading, error } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    
    // UI State
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: '#3B82F6'
    });

    if (!isAuthenticated || user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
                <p className="text-gray-500">You don&apos;t have permission to access this page.</p>
            </div>
        );
    }

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: '',
            color: '#3B82F6'
        });
    };

    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, name, slug }));
    };

    const handleAddCategory = async () => {
        if (!formData.name.trim()) return;
        
        try {
            await createCategory.mutateAsync({
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: formData.description || undefined,
                icon: formData.icon || undefined,
                color: formData.color || undefined
            });
            
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !formData.name.trim()) return;
        
        try {
            await updateCategory.mutateAsync({
                id: editingCategory.id,
                data: {
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || undefined,
                    icon: formData.icon || undefined,
                    color: formData.color || undefined
                }
            });
            
            setEditingCategory(null);
            resetForm();
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };

    const handleDeleteCategory = async () => {
        if (!deletingCategory) return;
        
        try {
            await deleteCategory.mutateAsync(deletingCategory.id);
            setDeletingCategory(null);
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            icon: category.icon || '',
            color: category.color || '#3B82F6'
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
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
                    <Button onClick={openAddModal}>
                        <Plus size={18} className="mr-2" />
                        Add Category
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                        <p className="text-red-700">Error loading categories. Please try again.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Category</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Slug</th>
                                    <th className="px-6 py-4 text-left font-semibold text-gray-500">Description</th>
                                    <th className="px-6 py-4 text-center font-semibold text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-right font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories?.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {category.color && (
                                                    <div 
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                                        style={{ backgroundColor: category.color }}
                                                    >
                                                        {category.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                {category.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                category.isActive 
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                                            }`}>
                                                {category.isActive ? (
                                                    <>
                                                        <Check size={12} className="mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <X size={12} className="mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingCategory(category)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {categories?.length === 0 && (
                            <div className="p-12 text-center text-gray-400">
                                <p>No categories found. Create your first category!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Category">
                <div className="space-y-4">
                    <Input 
                        label="Category Name *" 
                        value={formData.name} 
                        onChange={(e) => handleNameChange(e.target.value)} 
                        placeholder="e.g., Marketing Tools"
                    />
                    <Input 
                        label="Slug *" 
                        value={formData.slug} 
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="marketing-tools"
                    />
                    <Input 
                        label="Description" 
                        value={formData.description} 
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this category"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Icon (optional)" 
                            value={formData.icon} 
                            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                            placeholder="Icon name or URL"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="h-10 w-10 rounded cursor-pointer border border-gray-300"
                                />
                                <Input 
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddCategory}
                            disabled={createCategory.isPending || !formData.name.trim()}
                        >
                            {createCategory.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Plus size={18} className="mr-2" />
                            )}
                            Add Category
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Category Modal */}
            <Modal 
                isOpen={!!editingCategory} 
                onClose={() => { setEditingCategory(null); resetForm(); }} 
                title="Edit Category"
            >
                <div className="space-y-4">
                    <Input 
                        label="Category Name *" 
                        value={formData.name} 
                        onChange={(e) => handleNameChange(e.target.value)} 
                        placeholder="e.g., Marketing Tools"
                    />
                    <Input 
                        label="Slug *" 
                        value={formData.slug} 
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="marketing-tools"
                    />
                    <Input 
                        label="Description" 
                        value={formData.description} 
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this category"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Icon (optional)" 
                            value={formData.icon} 
                            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                            placeholder="Icon name or URL"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="h-10 w-10 rounded cursor-pointer border border-gray-300"
                                />
                                <Input 
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="secondary" onClick={() => { setEditingCategory(null); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUpdateCategory}
                            disabled={updateCategory.isPending || !formData.name.trim()}
                        >
                            {updateCategory.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Pencil size={18} className="mr-2" />
                            )}
                            Update Category
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={!!deletingCategory} 
                onClose={() => setDeletingCategory(null)} 
                title="Delete Category"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{deletingCategory?.name}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="secondary" onClick={() => setDeletingCategory(null)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="danger"
                            onClick={handleDeleteCategory}
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 size={18} className="mr-2" />
                            )}
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <style jsx>{`
                .categories-page { padding: 32px 0 64px; min-height: 80vh; }
                .back-link { font-size: 14px; color: var(--gray-500); display: inline-block; margin-bottom: 16px; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
                h1 { font-size: 2rem; font-weight: 700; }
                .page-header p { color: var(--gray-500); margin-top: 4px; }
            `}</style>
        </div>
    );
}
