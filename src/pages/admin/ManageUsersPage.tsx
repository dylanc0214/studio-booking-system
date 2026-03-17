import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Mail, Calendar, UserX, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageUsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth');
                return;
            }
            const res = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 400 || res.status === 403) {
                navigate('/dashboard');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [navigate]);

    const handleBanUser = async (id: number, isBanned: boolean) => {
        const action = isBanned ? 'unban' : 'ban';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${id}/ban`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_banned: !isBanned })
            });

            if (res.ok) {
                fetchUsers(); // Refresh the list
            } else {
                alert(`Failed to ${action} user`);
            }
        } catch (err) {
            alert(`Network error while trying to ${action} user`);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-slate-900 text-lg">Manage Users</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full p-4 overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="hidden md:grid grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                            <div>User</div>
                            <div>Role</div>
                            <div>Joined</div>
                            <div className="text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {users.map(user => (
                                <div key={user.id} className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                                <span className="truncate">{user.name}</span>
                                                {user.is_banned && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Banned</span>}
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1 truncate"><Mail size={12} className="shrink-0" /> <span className="truncate">{user.email}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {user.role === 'ADMIN' ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="flex md:justify-end mt-2 md:mt-0">
                                        {user.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => handleBanUser(user.id, user.is_banned || false)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full md:w-auto justify-center ${user.is_banned
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                                    }`}
                                            >
                                                {user.is_banned ? <ShieldCheck size={16} /> : <UserX size={16} />}
                                                {user.is_banned ? 'Unban' : 'Ban'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    No users found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
