import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Calendar, Search, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const bookingsRef = React.useRef(bookings);
    useEffect(() => {
        bookingsRef.current = bookings;
    }, [bookings]);

    useEffect(() => {
        const fetchPendingBookings = async () => {
            // Only set loading true on initial mount if bookings is empty to avoid UI flashing during polls
            if (bookingsRef.current.length === 0) setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }
                const res = await fetch('/api/admin/bookings/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 401 || res.status === 400) {
                    localStorage.removeItem('token');
                    navigate('/auth');
                    return;
                } else if (res.status === 403 || !res.ok) {
                    navigate('/dashboard');
                    return;
                }

                const data = await res.json();
                if (data.bookings) {
                    const prevBookings = bookingsRef.current;
                    // Check for brand new bookings that weren't in the previous state
                    if (prevBookings.length > 0) {
                        data.bookings.forEach((newBooking: any) => {
                            const isOld = prevBookings.find((b) => b.id === newBooking.id);
                            if (!isOld) {
                                if (Notification.permission === 'granted') {
                                    new Notification('New Booking Request!', {
                                        body: `${newBooking.user.name} has requested a ${newBooking.duration}-hour session on ${format(new Date(newBooking.start_time), 'MMM d')}.`,
                                        icon: '/favicon.ico'
                                    });
                                }
                            }
                        });
                    }

                    setBookings(data.bookings);
                }
            } catch (err) {
                // Silently fail polling on network error
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingBookings();

        // Request permission for Browser Notifications
        if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // Poll every 15 seconds for incoming booking requests
        const interval = setInterval(fetchPendingBookings, 15000);
        return () => clearInterval(interval);
    }, [navigate]);

    const handleStatusUpdate = async (id: number, status: 'CONFIRMED' | 'CANCELLED') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Remove the processed booking from the list
                setBookings(prev => prev.filter(b => b.id !== id));
            } else {
                alert('Failed to update booking status');
            }
        } catch (err) {
            alert('Network error while updating status');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="min-h-screen relative bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
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
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Pending Approvals</h1>
                    <p className="text-slate-500">Review and manage incoming studio booking requests.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">All Caught Up!</h3>
                        <p className="text-slate-500">There are no pending booking requests to review right now.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:border-indigo-200 transition-colors">

                                {/* Image Section */}
                                <div className="h-48 bg-slate-100 relative group border-b border-slate-100">
                                    {booking.payment?.receipt_url ? (
                                        <img
                                            src={booking.payment.receipt_url.startsWith('http') ? booking.payment.receipt_url : booking.payment.receipt_url}
                                            alt="Receipt Proof"
                                            className="w-full h-full p-2 object-contain cursor-pointer"
                                            onClick={() => window.open(booking.payment.receipt_url.startsWith('http') ? booking.payment.receipt_url : booking.payment.receipt_url, '_blank')}
                                            title="Click to view full receipt"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <Search size={24} className="mb-2" />
                                            <span className="text-sm font-medium">No Receipt Uploaded</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                        RM {booking.duration === 1 ? '60' : '100'}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-900 text-lg">{booking.user.name}</h3>
                                        <a href={`mailto:${booking.user.email}`} className="text-sm text-indigo-600 hover:underline">{booking.user.email}</a>
                                    </div>

                                    <div className="space-y-2 mb-6 bg-slate-50 p-3 rounded-xl">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span className="font-medium">{format(new Date(booking.start_time), 'EEEE, MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>{format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')} ({booking.duration} Hour{booking.duration > 1 ? 's' : ''})</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
