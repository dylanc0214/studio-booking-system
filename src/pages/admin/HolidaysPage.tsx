import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, XCircle, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function HolidaysPage() {
    const navigate = useNavigate();
    const [holidays, setHolidays] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newDate, setNewDate] = useState('');
    const [newReason, setNewReason] = useState('');

    const fetchHolidays = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth');
                return;
            }
            const res = await fetch('/api/admin/holidays', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 400 || res.status === 403) {
                navigate('/dashboard');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setHolidays(data.holidays);
            }
        } catch (err) {
            console.error('Failed to fetch holidays', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, [navigate]);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate) return;

        try {
            const token = localStorage.getItem('token');

            // Convert entered local date string to a UTC Date object representing midnight
            const localDateStr = `${newDate}T00:00:00`;
            const dateObj = new Date(localDateStr);

            const res = await fetch('/api/admin/holidays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ date: dateObj.toISOString(), reason: newReason })
            });

            if (res.ok) {
                setNewDate('');
                setNewReason('');
                fetchHolidays();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add holiday.');
            }
        } catch (err) {
            alert('Network error while adding holiday');
        }
    };

    const handleDeleteHoliday = async (id: number) => {
        if (!confirm('Delete this blocked date?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/holidays/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchHolidays();
            } else {
                alert('Failed to delete holiday');
            }
        } catch (err) {
            alert('Network error while deleting holiday');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 relative pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="font-bold text-slate-900 text-lg">Manage Holidays & Blocked Dates</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
                <div className="mb-8">
                    <p className="text-slate-500">Add dates that should be unavailable for users to book. Keep in mind that blocking a date does not automatically cancel existing confirmed bookings.</p>
                </div>

                {/* Add New */}
                <form onSubmit={handleAddHoliday} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Select Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Reason (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Public Holiday, Studio Maintenance"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Block Date
                    </button>
                </form>

                {/* List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : holidays.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <CalendarIcon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Blocked Dates</h3>
                        <p className="text-slate-500">All dates are currently open for booking.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <ul className="divide-y divide-slate-100">
                            {holidays.map(holiday => (
                                <li key={holiday.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                                            <CalendarIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}</h3>
                                            <p className="text-sm text-slate-500">{holiday.reason || 'No reason provided'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteHoliday(holiday.id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Remove block"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
