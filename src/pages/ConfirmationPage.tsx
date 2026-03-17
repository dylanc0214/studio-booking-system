import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, X } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { Button } from '../components/Button';
import { format } from 'date-fns';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { bookingData } = useBooking();

  // Fallback data
  const date = bookingData.date || new Date();
  const timeSlot = bookingData.timeSlot || '10:00 AM';
  const serviceName = bookingData.serviceName || '1-Hour Jam';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-100">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} className="text-slate-900" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Confirmation</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Success Banner */}
        <div className="flex flex-col items-center pt-12 pb-8 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600 animate-in zoom-in duration-500">
            <CheckCircle2 size={40} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            Your session at Studio A is locked in. We've sent access instructions and your receipt to your email.
          </p>
        </div>

        {/* Studio Image Card */}
        <div className="px-4 mb-8">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group">
            <img 
              src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=2070&auto=format&fit=crop" 
              alt="Studio" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">UPCOMING</span>
              <h3 className="font-bold text-lg">Studio A - Main Room</h3>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="px-4">
          <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date</p>
                <p className="text-slate-900 font-bold">{format(date, 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-200"></div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Time</p>
                <p className="text-slate-900 font-bold">{timeSlot} - {parseInt(timeSlot) + 1}:00 {timeSlot.includes('PM') ? 'PM' : 'AM'}</p>
                <p className="text-xs text-slate-500 mt-1">1 Hour Duration</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-200"></div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Location</p>
                <p className="text-slate-900 font-bold">123 Vinyl Street, Downtown</p>
                <button className="text-indigo-600 text-sm font-medium mt-1 hover:underline">Get Directions</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 bg-white border-t border-slate-100 pb-8">
        <Button 
          className="w-full mb-3 flex items-center justify-center gap-2 group" 
          size="lg" 
          onClick={() => navigate('/dashboard')}
        >
          <span>View My Bookings</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
