import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addDays, isSunday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(bookingData.date || new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(bookingData.timeSlot);
  const [duration, setDuration] = useState<number>(bookingData.duration || 1);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const [availableSlots, setAvailableSlots] = useState<{ time: string, count: number }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await fetch(`/api/availability?date=${dateStr}&duration=${duration}`);
        const data = await res.json();

        if (data.availableSlots) {
          const slots = data.availableSlots.map((slot: any) => ({
            time: format(new Date(slot.start), 'h:mm a'),
            count: slot.availableCount
          }));
          setAvailableSlots(slots);
        }
      } catch (err) {
        console.error('Failed to fetch availability', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, duration]);

  const handleDateClick = (day: Date) => {
    if (isSunday(day) || isBefore(day, startOfDay(new Date()))) return; // Block Sundays and past dates
    setSelectedDate(day);
    setSelectedTime(undefined); // Reset time when date changes
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      updateBookingData({
        date: selectedDate,
        timeSlot: selectedTime,
        duration,
        serviceName: duration === 1 ? '1-Hour Jam' : '2-Hour Session',
        price: duration === 1 ? 60 : 50 // Note: 2 hr is RM100 total, so 50/hr equivalent.
      });
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/checkout');
      } else {
        navigate('/auth');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg text-slate-900 mr-8">Select Date & Time</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-40">
        {/* Calendar Section */}
        <div className="p-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <h2 className="font-bold text-slate-900 text-base">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, dayIdx) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const isDisabled = isSunday(day) || isBefore(day, startOfDay(new Date()));

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      'h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm transition-all relative',
                      !isCurrentMonth && 'text-slate-300',
                      isDisabled && 'text-slate-300 cursor-not-allowed opacity-50',
                      isCurrentMonth && !isSelected && !isDisabled && 'text-slate-700 hover:bg-slate-100',
                      isSelected && 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold',
                      isTodayDate && !isSelected && !isDisabled && 'text-indigo-600 font-bold bg-indigo-50'
                    )}
                  >
                    {format(day, 'd')}
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 bg-indigo-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="px-6 pb-2">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => { setDuration(1); setSelectedTime(undefined); }}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                duration === 1 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              1 Hour
            </button>
            <button
              onClick={() => { setDuration(2); setSelectedTime(undefined); }}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                duration === 2 ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              2 Hours
            </button>
          </div>
        </div>

        {/* Time Slots Section */}
        <div className="px-6 pb-6 mt-4">
          <h3 className="font-bold text-slate-900 text-lg mb-4">Available Slots</h3>
          {isLoadingSlots ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableSlots.map(({ time, count }) => (
                <button
                  key={time}
                  onClick={() => handleTimeClick(time)}
                  className={cn(
                    'h-14 rounded-xl text-sm font-medium border transition-all flex flex-col items-center justify-center',
                    selectedTime === time
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'
                  )}
                >
                  <span>{time}</span>
                  <span className={cn('text-[10px] mt-0.5', selectedTime === time ? 'text-indigo-100' : 'text-slate-400')}>
                    {count} / 3 slots
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Snippet */}
        {bookingData.serviceName && (
          <div className="px-6 mb-8">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Session Type</p>
                <p className="text-sm font-bold text-slate-900">{bookingData.serviceName} • 12 PM - 7 PM</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto z-40">
        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
