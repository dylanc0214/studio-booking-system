import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Settings, CalendarCheck2 } from 'lucide-react';

export default function AdminLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center">
            <div className="w-full max-w-5xl flex-1 bg-white relative shadow-2xl min-h-screen pb-20 md:pb-0 font-sans text-slate-900 border-x border-slate-100 flex flex-col">
                <Outlet />

                {/* Mobile Navigation Footer - Fixed to the bottom of the column wrapper or screen for mobile */}
                <nav className="fixed bottom-0 left-0 right-0 md:absolute border-t border-slate-100 bg-white z-50 md:bottom-auto md:top-full">
                    <div className="max-w-5xl mx-auto flex justify-around items-center h-16 px-2">
                        <Link to="/admin" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${location.pathname === '/admin' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                            <LayoutDashboard size={20} strokeWidth={location.pathname === '/admin' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium hidden sm:block">Dashboard</span>
                        </Link>

                        <Link to="/admin/pending" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${location.pathname === '/admin/pending' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                            <CalendarCheck2 size={20} strokeWidth={location.pathname === '/admin/pending' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium hidden sm:block">Approvals</span>
                        </Link>

                        <Link to="/admin/users" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${location.pathname === '/admin/users' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Users size={20} strokeWidth={location.pathname === '/admin/users' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium hidden sm:block">Users</span>
                        </Link>

                        <Link to="/admin/bookings" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${location.pathname === '/admin/bookings' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                            <CalendarDays size={20} strokeWidth={location.pathname === '/admin/bookings' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium hidden sm:block">Bookings</span>
                        </Link>

                        <Link to="/admin/holidays" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${location.pathname === '/admin/holidays' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Settings size={20} strokeWidth={location.pathname === '/admin/holidays' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium hidden sm:block">Holidays</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}
