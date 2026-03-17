import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, User } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const hideNav = ['/checkout', '/confirmation'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0 relative overflow-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-y-auto">
        <Outlet />

        {!hideNav && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 max-w-md mx-auto">
            <div className="flex justify-around items-center h-16">
              <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Home size={20} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Home</span>
              </Link>
              <Link to="/calendar" className={`flex flex-col items-center gap-1 ${location.pathname === '/calendar' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Calendar size={20} strokeWidth={location.pathname === '/calendar' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Book</span>
              </Link>

              <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <User size={20} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Profile</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
