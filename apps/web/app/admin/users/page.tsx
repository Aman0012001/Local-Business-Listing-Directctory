"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Search, RefreshCw, Loader2, Shield, ShieldAlert,
    ShieldCheck, ShieldOff, UserCheck, UserX, ChevronLeft,
    ChevronRight, Mail, Calendar, Chrome, KeyRound, MoreVertical,
    Briefcase, User as UserIcon, Crown, Trash2
} from 'lucide-react';
import { api, getImageUrl } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

type Role = 'user' | 'vendor' | 'admin' | 'superadmin';

const ROLE_CONFIG: Record<Role, { label: string; cls: string; Icon: any }> = {
    user: { label: 'User', cls: 'bg-slate-100 text-slate-600 border-slate-200', Icon: UserIcon },
    vendor: { label: 'Vendor', cls: 'bg-blue-50 text-blue-700 border-blue-200', Icon: Briefcase },
    admin: { label: 'Admin', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Shield },
    superadmin: { label: 'Superadmin', cls: 'bg-red-50 text-red-700 border-red-200', Icon: Crown },
};

const RolePill = ({ role }: { role: string }) => {
    const r = ROLE_CONFIG[role as Role] || ROLE_CONFIG.user;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${r.cls}`}>
            <r.Icon className="w-3 h-3" /> {r.label}
        </span>
    );
};

const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-600 border-red-200'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
        {active ? 'Active' : 'Inactive'}
    </span>
);

const ProviderBadge = ({ provider }: { provider?: string }) => {
    if (!provider || provider === 'local') return (
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold">
            <KeyRound className="w-3 h-3" /> Password
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 font-bold">
            <Chrome className="w-3 h-3" /> Google
        </span>
    );
};

const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const ROLE_COLORS: Record<string, string> = {
    user: 'from-slate-400 to-slate-500',
    vendor: 'from-blue-400 to-blue-600',
    admin: 'from-amber-400 to-orange-500',
    superadmin: 'from-red-500 to-red-700',
};

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const LIMIT = 15;

    const fetchUsers = useCallback(async (p = page) => {
        setLoading(true);
        try {
            const res = await api.admin.getUsers(p, LIMIT);
            setUsers(res.data || []);
            setMeta(res.meta || { total: 0, totalPages: 1 });
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchUsers(page); }, [page]);

    const changeRole = async (userId: string, role: Role) => {
        setActionLoading(userId + '-role');
        try {
            await api.admin.updateUserRole(userId, role);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        } catch (err: any) {
            alert(err.message || 'Failed to change role');
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    const toggleStatus = async (userId: string, isActive: boolean) => {
        setActionLoading(userId + '-status');
        try {
            await api.admin.toggleUserStatus(userId, !isActive);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This will also remove their business listings and all related data. This action cannot be undone.')) {
            return;
        }

        setActionLoading(userId + '-delete');
        try {
            await api.admin.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            alert('User deleted successfully');
        } catch (err: any) {
            alert(err.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
            setOpenMenu(null);
        }
    };

    // Client-side filtering
    const filtered = users.filter(u => {
        const matchesSearch = !search || [u.fullName, u.email, u.city, u.country]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'all'
            || (statusFilter === 'active' ? u.isActive : !u.isActive);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const roleCounts: Record<string, number> = { all: users.length };
    users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

    return (
        <div className="space-y-8 pb-20" onClick={() => setOpenMenu(null)}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-400 font-medium mt-1">
                        {meta.total} total users — manage roles, permissions, and accounts.
                    </p>
                </div>
                <button
                    onClick={() => fetchUsers(page)}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Overview mini-stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['all', 'user', 'vendor', 'admin'] as const).map((r) => {
                    const cfg = r === 'all'
                        ? { label: 'All Users', cls: 'from-slate-700 to-slate-900', Icon: Users }
                        : { label: ROLE_CONFIG[r].label + 's', cls: ROLE_COLORS[r], Icon: ROLE_CONFIG[r].Icon };
                    return (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r as any)}
                            className={`group rounded-3xl p-5 text-left transition-all border-2 ${roleFilter === r
                                ? 'border-slate-900 bg-slate-900 text-white '
                                : 'border-transparent bg-white hover:border-slate-200 text-slate-700 shadow-sm'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cfg.cls} flex items-center justify-center mb-3 shadow-md`}>
                                <cfg.Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className={`text-2xl font-black mb-0.5 ${roleFilter === r ? 'text-white' : 'text-slate-900'}`}>
                                {roleCounts[r] ?? 0}
                            </p>
                            <p className={`text-xs font-bold uppercase tracking-widest ${roleFilter === r ? 'text-white/60' : 'text-slate-400'}`}>
                                {cfg.label}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Search + Status filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, city..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-400 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-3 rounded-2xl font-bold text-sm transition-all border capitalize ${statusFilter === s
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                    <Users className="w-12 h-12 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-sm">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm relative">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">User</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</p>
                    </div>

                    <AnimatePresence>
                        {filtered.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className={`grid md:grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 items-center px-6 py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${openMenu === user.id ? 'relative z-50' : ''}`}
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${ROLE_COLORS[user.role] || ROLE_COLORS.user} flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden`}>
                                        {user.avatarUrl ? (
                                            <img src={getImageUrl(user.avatarUrl) || ''} alt={user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-black text-sm">{getInitials(user.fullName)}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 text-sm truncate">{user.fullName || '—'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <ProviderBadge provider={user.provider} />
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Mail className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 font-medium truncate">{user.email}</span>
                                </div>

                                {/* Role */}
                                <div>
                                    <RolePill role={user.role} />
                                </div>

                                {/* Status */}
                                <div>
                                    <StatusBadge active={user.isActive} />
                                </div>

                                {/* Actions */}
                                {user.role !== 'superadmin' && (
                                    <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                                        >
                                            {actionLoading?.startsWith(user.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <MoreVertical className="w-4 h-4" />
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {openMenu === user.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                                    className="absolute right-0 top-11 z-50 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 py-2 w-52 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete User
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400 font-medium">
                        Page {page} of {meta.totalPages} · {meta.total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(meta.totalPages - 4, page - 2)) + i;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all border ${page === p
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            disabled={page === meta.totalPages}
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
