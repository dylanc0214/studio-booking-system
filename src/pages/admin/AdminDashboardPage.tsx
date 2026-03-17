import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, CalendarCheck2, TrendingUp, CalendarDays, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        totalUsers: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }
                const res = await fetch('/api/admin/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 401 || res.status === 400 || res.status === 403) {
                    navigate('/dashboard');
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 relative">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">U</span>
                        </div>
                        <span className="font-bold text-slate-900 hidden sm:block">Admin Portal</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, Admin. Here is what's happening today.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-slate-500 text-sm font-medium mb-1">Total Revenue</span>
                                <span className="text-2xl font-bold text-slate-900">RM {stats.totalRevenue}</span>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-3">
                                    <CalendarCheck2 size={20} />
                                </div>
                                <span className="text-slate-500 text-sm font-medium mb-1">Pending Approvals</span>
                                <span className="text-2xl font-bold text-slate-900">{stats.pendingBookings}</span>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                                    <CalendarDays size={20} />
                                </div>
                                <span className="text-slate-500 text-sm font-medium mb-1">Confirmed Bookings</span>
                                <span className="text-2xl font-bold text-slate-900">{stats.confirmedBookings}</span>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                                    <Users size={20} />
                                </div>
                                <span className="text-slate-500 text-sm font-medium mb-1">Total Users</span>
                                <span className="text-2xl font-bold text-slate-900">{stats.totalUsers}</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link to="/admin/pending" className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                            <CalendarCheck2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Review Approvals</h3>
                                            <p className="text-xs text-slate-500">Check newly submitted receipts</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        →
                                    </div>
                                </Link>

                                <Link to="/admin/bookings" className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                            <CalendarDays size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Manage Bookings</h3>
                                            <p className="text-xs text-slate-500">View & edit upcoming sessions</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        →
                                    </div>
                                </Link>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
