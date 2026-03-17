import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Wifi, Video, Snowflake, Star, ChevronRight, Menu, Search, Calendar, User, Activity, ShieldCheck, Plus, X, LogOut, MapPin } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { updateBookingData } = useBooking();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleSelectService = (serviceId: string, name: string, price: number, duration: number) => {
    updateBookingData({ serviceId, serviceName: name, price, duration });
    navigate('/calendar');
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="flex justify-between items-center p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} className="text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Underrated</h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 mb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop"
            alt="DJ Studio"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded w-fit mb-2">AVAILABLE NOW</span>
            <h2 className="text-white text-3xl font-bold mb-2">Premium DJ Suite</h2>
            <p className="text-slate-200 text-sm leading-relaxed max-w-[90%]">
              Professional Pioneer XDJ-XZ. Sound-treated. Ready to record.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Options */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Book your session</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSelectService('1h', '1-Hour Jam', 60, 1)}
            className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Clock size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">1-Hour Jam</h4>
                <p className="text-xs text-slate-500">Quick practice session</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-bold text-slate-900 text-lg">RM60</span>
              <span className="text-xs font-medium text-indigo-600">Book Now</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectService('2h', '2-Hour Session', 50, 2)}
            className="group bg-white border border-indigo-100 ring-1 ring-indigo-50 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <Plus size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">2-Hour Session</h4>
                <p className="text-xs text-slate-500">Full set preparation</p>
              </div>
            </div>
            <div className="text-right mt-4">
              <span className="block font-bold text-slate-900 text-lg">RM100</span>
              <span className="text-xs font-medium text-indigo-600">Book Now</span>
            </div>
          </button>

        </div>
      </div>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="font-bold text-slate-900 text-lg">Menu</h2>
              <button
                className="p-2 -mr-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 bg-white">
              <div className="px-4 space-y-2">
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/calendar'); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors font-medium text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Calendar size={18} />
                  </div>
                  Book a Session
                </button>

                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors font-medium text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
                        <Activity size={18} />
                      </div>
                      My Dashboard
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }} // Could go to a dedicated profile page later
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors font-medium text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
                        <User size={18} />
                      </div>
                      Profile Settings
                    </button>
                    <div className="h-px bg-slate-100 my-4 mx-4"></div>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        localStorage.removeItem('token');
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 transition-colors font-medium text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                        <LogOut size={18} />
                      </div>
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/auth'); }}
                    className="w-full flex items-center gap-4 p-4 mt-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-bold text-left shadow-md shadow-indigo-200 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                    Sign In
                  </button>
                )}
              </div>
            </div>
            {/* Quick Access Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="p-3 bg-white rounded-xl text-xs font-medium text-slate-600 text-left border border-slate-100 hover:border-slate-300 transition-colors flex items-center gap-2"
                  onClick={() => { setIsMenuOpen(false); navigate('/terms'); }}
                >
                  <ShieldCheck size={14} className="text-indigo-500" /> Terms
                </button>
                <button
                  className="p-3 bg-white rounded-xl text-xs font-medium text-slate-600 text-left border border-slate-100 hover:border-slate-300 transition-colors flex items-center gap-2"
                  onClick={() => window.open('https://wa.me/60129119936', '_blank')}
                >
                  <MapPin size={14} className="text-green-500" /> Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
