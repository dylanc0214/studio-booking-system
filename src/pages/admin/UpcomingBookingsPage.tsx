import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Edit2, XCircle, Search, Save, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function UpcomingBookingsPage() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Editing state
    const [editingBookingObj, setEditingBookingObj] = useState<any>(null);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth');
                return;
            }
            const res = await fetch('/api/admin/bookings/upcoming', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 400 || res.status === 403) {
                navigate('/dashboard');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error('Failed to fetch upcoming bookings', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [navigate]);

    const handleCancelClick = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this confirmed booking? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'CANCELLED' })
            });

            if (res.ok) {
                fetchBookings();
            } else {
                alert('Failed to cancel booking');
            }
        } catch (err) {
            alert('Network error while cancelling booking');
        }
    };

    const handleEditClick = (booking: any) => {
        setEditingBookingObj(booking);
        // Extract local date and time strings for the inputs
        const d = new Date(booking.start_time);
        setEditDate(format(d, 'yyyy-MM-dd'));
        setEditTime(format(d, 'HH:mm'));
    };

    const handleCancelEdit = () => {
        setEditingBookingObj(null);
        setEditDate('');
        setEditTime('');
    };

    const handleSaveEdit = async () => {
        if (!editingBookingObj || !editDate || !editTime) return;

        try {
            const token = localStorage.getItem('token');

            // Construct new start time string in local time, then convert to UTC ISO for the server
            // We assume the admin enters Malaysia time (or their local time)
            const localDateStr = `${editDate}T${editTime}:00`;
            const startDate = new Date(localDateStr);
            const isoString = startDate.toISOString();

            const res = await fetch(`/api/admin/bookings/${editingBookingObj.id}/time`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ start_time: isoString })
            });

            if (res.ok) {
                setEditingBookingObj(null);
                fetchBookings();
            } else {
                const errData = await res.json();
                alert(errData.error || 'Failed to update booking time. The slot might be unavailable.');
            }
        } catch (err) {
            alert('Network error while updating booking time');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 relative pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-slate-900 text-lg">Upcoming Bookings</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Upcoming Bookings</h3>
                        <p className="text-slate-500">There are no confirmed upcoming bookings at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col hover:border-indigo-200 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                            {booking.user.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">Booking #{booking.id}</p>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                                        RM {booking.total_price}
                                    </div>
                                </div>

                                {editingBookingObj?.id === booking.id ? (
                                    <div className="space-y-3 mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">New Date</label>
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">New Start Time</label>
                                            <input
                                                type="time"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                                value={editTime}
                                                onChange={(e) => setEditTime(e.target.value)}
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">Duration will remain {booking.duration} hr(s).</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span className="font-medium">{format(new Date(booking.start_time), 'EEEE, MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>
                                                {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                                                <span className="text-slate-400 ml-1">({booking.duration}hr)</span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                                    {editingBookingObj?.id === booking.id ? (
                                        <>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors text-sm border border-slate-200"
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors text-sm shadow-sm"
                                            >
                                                <Save size={16} /> Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleCancelClick(booking.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors text-sm"
                                            >
                                                <XCircle size={16} /> Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(booking)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors text-sm"
                                            >
                                                <Edit2 size={16} /> Reschedule
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
