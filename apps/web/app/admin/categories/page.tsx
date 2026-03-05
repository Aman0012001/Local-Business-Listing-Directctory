"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Search, RefreshCw, Loader2, Edit2, Trash2,
    CheckCircle2, XCircle, Image as ImageIcon, PlusCircle,
    ChevronRight, FolderPlus, MoreVertical, LayoutGrid,
    List, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { Category } from '../../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        imageUrl: '',
        description: '',
        parentId: '',
        displayOrder: 0,
        status: 'active' as 'active' | 'disabled'
    });

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.categories.adminGetAll();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create');
        try {
            await api.categories.adminCreate(formData);
            await fetchCategories();
            setIsCreateModalOpen(false);
            resetForm();
        } catch (err: any) {
            alert(err.message || 'Failed to create category');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        setActionLoading('update');
        try {
            await api.categories.adminUpdate(selectedCategory.id, formData);
            await fetchCategories();
            setIsEditModalOpen(false);
            resetForm();
        } catch (err: any) {
            alert(err.message || 'Failed to update category');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (category: Category) => {
        const newStatus = category.status === 'active' ? 'disabled' : 'active';
        setActionLoading(category.id);
        try {
            await api.categories.adminUpdateStatus(category.id, newStatus);
            setCategories(prev => prev.map(c => c.id === category.id ? { ...c, status: newStatus } : c));
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        setActionLoading('delete');
        try {
            await api.categories.adminDelete(selectedCategory.id);
            await fetchCategories();
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete category. Make sure it has no subcategories or listings.');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            icon: category.icon || '',
            imageUrl: category.imageUrl || '',
            description: category.description || '',
            parentId: category.parentId || '',
            displayOrder: category.displayOrder || 0,
            status: category.status
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            icon: '',
            imageUrl: '',
            description: '',
            parentId: '',
            displayOrder: 0,
            status: 'active'
        });
        setSelectedCategory(null);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Category Management</h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Control the business categories accessible to vendors and users.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCategories}
                        className="flex items-center justify-center p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Add Category
                    </button>
                </div>
            </div>

            {/* toolbar */}
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search categories by name or slug..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 h-16 rounded-[24px] border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-slate-100 placeholder:text-slate-400 text-base shadow-sm transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Slug</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Created At</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode='popLayout'>
                                {loading && categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <Loader2 className="w-10 h-10 animate-spin text-slate-200 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <LayoutGrid className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">No categories found</h3>
                                            <p className="text-slate-400 font-medium mt-2">Try adjusting your search terms.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((c, idx) => (
                                        <motion.tr
                                            key={c.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner overflow-hidden">
                                                        {c.imageUrl ? (
                                                            <img src={c.imageUrl} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="text-xl text-slate-400 font-bold">{c.icon || <LayoutGrid className="w-6 h-6" />}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-base">{c.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium mt-0.5 mt-1 line-clamp-1 max-w-[200px]">{c.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{c.slug}</code>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleToggleStatus(c)}
                                                    disabled={actionLoading === c.id}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${c.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {actionLoading === c.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <>
                                                            {c.status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                            {c.status}
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm text-slate-500 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(c)}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedCategory(c); setIsDeleteModalOpen(true); }}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600 transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900">{isEditModalOpen ? 'Edit Category' : 'Create New Category'}</h2>
                                <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }} className="text-slate-300 hover:text-slate-900 transition-colors">
                                    <XCircle className="w-8 h-8" />
                                </button>
                            </div>

                            <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., Beauty Salon"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Custom Slug (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., beauty-salon"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Icon (Emoji or Icon Name)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 💇‍♀️ or Sparkles"
                                            value={formData.icon}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold transition-all text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.displayOrder}
                                            onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold transition-all text-center"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief description of this category..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={!!actionLoading}
                                        className="flex-1 h-16 bg-slate-900 text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            isEditModalOpen ? 'Save Changes' : 'Create Category'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedCategory && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Are you sure?</h3>
                            <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                                You are about to delete <span className="text-slate-900 font-black">"{selectedCategory.name}"</span>.
                                This action cannot be undone and will fail if the category has subcategories or active listings.
                            </p>
                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setSelectedCategory(null); }}
                                    className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!!actionLoading}
                                    className="flex-1 h-14 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/20 disabled:opacity-50"
                                >
                                    {actionLoading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
